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

class ProcessSegmentation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 1800;

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
            'name' => 'Segmentation Processing',
            'description' => 'Running AI segmentation models on brain MRI images',
            'status' => 'in_progress',
            'step_order' => 3,
            'started_at' => now(),
        ]);

        try {
            Log::info("Starting segmentation processing for Study ID: {$this->study->id}");
            
            // Simulate some processing time
            sleep(5);
            
            // Intentionally fail this step as requested
            throw new \Exception("Segmentation processing failed: AI model encountered unexpected input format");
            
        } catch (\Exception $e) {
            Log::error("Segmentation processing failed for Study ID: {$this->study->id}", [
                'error' => $e->getMessage()
            ]);
            
            $step->update([
                'status' => 'failed',
                'completed_at' => now(),
                'notes' => 'Segmentation processing failed: ' . $e->getMessage(),
            ]);

            $this->study->update([
                'status' => 'failed',
                'processing_completed_at' => now(),
                'processing_errors' => ['segmentation' => $e->getMessage()]
            ]);
            
            throw $e;
        }
    }
}
