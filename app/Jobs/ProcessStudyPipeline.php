<?php

namespace App\Jobs;

use App\Models\Study;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessStudyPipeline implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    public $timeout = 3600;

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
        Log::info("Starting processing pipeline for Study ID: {$this->study->id}");
        
        $this->study->update([
            'status' => 'in_progress',
            'processing_started_at' => now()
        ]);

        try {
            // Check if Pipeline Started step already exists to prevent duplicates
            $existingPipelineStep = $this->study->studySteps()
                ->where('name', 'Pipeline Started')
                ->first();
                
            if (!$existingPipelineStep) {
                $this->study->studySteps()->create([
                    'name' => 'Pipeline Started',
                    'description' => 'Study processing pipeline has been initiated',
                    'status' => 'completed',
                    'step_order' => 1,
                    'started_at' => now(),
                    'completed_at' => now()
                ]);
            }

            // Dispatch the processing chain
            ProcessQualityCheck::dispatch($this->study)
                ->chain([
                    new ProcessSegmentation($this->study),
                    new ProcessVolumetry($this->study),
                    new ProcessLLMAnalysis($this->study),
                    new FinalizeStudy($this->study),
                ]);
                
            Log::info("Processing pipeline chain dispatched for Study ID: {$this->study->id}");
            
        } catch (\Exception $e) {
            Log::error("Error in processing pipeline for Study ID: {$this->study->id}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $this->study->update([
                'status' => 'cancelled',
                'processing_errors' => $e->getMessage(),
            ]);
            
            throw $e;
        }
    }
}
