<?php

namespace App\Jobs;

use App\Models\Study;
use App\Models\StudyStep;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
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
            Log::info("Starting volumetry processing for Study: {$this->study->study_code}");
            
            // Fake processing for 20 seconds
            sleep(20);
            
            // Always fail after the fake processing
            throw new \Exception("Volumetry processing failed: Unable to calculate volumes from segmentation data");
            
        } catch (\Exception $e) {
            Log::error("Volumetry processing failed for Study: {$this->study->study_code}", [
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
        return ['volumetry', "study:{$this->study->study_code}"];
    }
}
