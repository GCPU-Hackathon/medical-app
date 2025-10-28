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

class FinalizeStudy implements ShouldQueue
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
        try {
            Log::info("Finalizing study processing for Study: {$this->study->code}");
            
            // Update study status to completed
            $this->study->update([
                'status' => 'completed',
                'processing_completed_at' => now(),
            ]);

            Log::info("Study processing finalized successfully for Study: {$this->study->code}");
            
        } catch (\Exception $e) {
            Log::error("Study finalization failed for Study: {$this->study->code}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->study->update([
                'status' => 'failed',
                'processing_completed_at' => now(),
                'processing_errors' => array_merge(
                    $this->study->processing_errors ?? [],
                    ['finalization' => $e->getMessage()]
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
        return ['finalization', "study:{$this->study->code}"];
    }
}
