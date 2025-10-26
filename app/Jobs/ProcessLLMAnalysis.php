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

class ProcessLLMAnalysis implements ShouldQueue
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
            'name' => 'LLM Analysis',
            'description' => 'Generating AI-powered medical analysis and insights',
            'status' => 'in_progress',
            'step_order' => 5,
            'started_at' => now(),
        ]);

        try {
            Log::info("Starting LLM analysis for Study: {$this->study->code}");
            
            // Fake processing for 20 seconds
            sleep(20);
            
            // Always fail after the fake processing
            throw new \Exception("LLM Analysis failed: Unable to generate medical insights from study data");
            
        } catch (\Exception $e) {
            Log::error("LLM analysis failed for Study: {$this->study->code}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $step->update([
                'status' => 'failed',
                'completed_at' => now(),
                'notes' => 'LLM analysis failed: ' . $e->getMessage(),
            ]);

            $this->study->update([
                'status' => 'failed',
                'processing_completed_at' => now(),
                'processing_errors' => array_merge(
                    $this->study->processing_errors ?? [],
                    ['llm_analysis' => $e->getMessage()]
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
        return ['llm-analysis', "study:{$this->study->code}"];
    }
}
