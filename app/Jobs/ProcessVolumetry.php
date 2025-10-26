<?php

namespace App\Jobs;

use App\Models\Study;
use App\Models\StudyStep;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessVolumetry implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60;
    public $tries = 1;

    /**
     * Create a new job instance.
     */
    public function __construct(public Study $study)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $step = StudyStep::create([
            'study_id' => $this->study->id,
            'name' => 'Volumetry Processing',
            'description' => 'Calculating brain tissue volumes from segmentation results',
            'status' => 'in_progress',
            'step_order' => 4,
            'started_at' => now(),
        ]);

        try {
            Log::info("Starting volumetry processing for Study: {$this->study->code}");
            
            // Find the segmentation file from assets
            $segmentationAsset = $this->study->assets()
                ->where('asset_type', 'segmentation')
                ->first();
            
            if (!$segmentationAsset) {
                throw new \Exception("No segmentation file found for study {$this->study->code}");
            }
            
            // Call volumetry agent API
            $response = Http::timeout(60)
                ->retry(3, 100)
                ->post('http://volumetry-agent:8000/analyze', [
                    'study_code' => $this->study->code,
                    'filename' => $segmentationAsset->filename
                ]);
            
            if (!$response->successful()) {
                throw new \Exception(
                    "Volumetry API failed: " . $response->body()
                );
            }
            
            $result = $response->json();
            
            // Check if metrics were saved successfully
            if ($result['status'] !== 'success' || !$result['metrics_saved']) {
                throw new \Exception(
                    "Volumetry processing failed: " . ($result['message'] ?? 'Unknown error')
                );
            }

            sleep(5);
            
            Log::info("Volumetry API response", [
                'study_code' => $this->study->code,
                'result' => $result
            ]);
            
            // Update step as completed
            $step->update([
                'status' => 'completed',
                'completed_at' => now(),
                'notes' => "Volumetry completed successfully. " . $result['message'],
            ]);

            Log::info("Volumetry completed successfully for Study: {$this->study->code}");
            
        } catch (\Exception $e) {
            Log::error("Volumetry processing failed for Study: {$this->study->code}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $step->update([
                'status' => 'failed',
                'completed_at' => now(),
                'notes' => 'Volumetry processing failed: ' . $e->getMessage(),
            ]);

            $this->study->update([
                'status' => 'failed',
                'processing_completed_at' => now(),
                'processing_errors' => array_merge(
                    $this->study->processing_errors ?? [],
                    ['volumetry' => $e->getMessage()]
                )
            ]);
            
            throw $e;
        }
    }

    /**
     * Get the tags that should be assigned to the job.
     */
    public function tags(): array
    {
        return ['volumetry', "study:{$this->study->code}"];
    }
}
