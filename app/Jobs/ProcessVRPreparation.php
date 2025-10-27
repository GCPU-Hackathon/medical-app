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

class ProcessVRPreparation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120;
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
            'name' => 'VR Asset Preparation',
            'description' => 'Et renvoyer un fichier VRDF - Preparing assets for VR visualization',
            'status' => 'in_progress',
            'step_order' => 6,
            'started_at' => now(),
        ]);

        try {
            Log::info("Starting VR asset preparation for Study: {$this->study->code}");
            
            sleep(8);
            
            throw new \Exception("VR asset preparation failed: Unable to generate VRDF file for VR visualization");
            
        } catch (\Exception $e) {
            Log::error("VR asset preparation failed for Study: {$this->study->code}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $step->update([
                'status' => 'failed',
                'completed_at' => now(),
                'notes' => 'VR asset preparation failed: ' . $e->getMessage(),
            ]);

            $this->study->update([
                'status' => 'failed',
                'processing_completed_at' => now(),
                'processing_errors' => array_merge(
                    $this->study->processing_errors ?? [],
                    ['vr_preparation' => $e->getMessage()]
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
        return ['vr-preparation', "study:{$this->study->code}"];
    }
}
