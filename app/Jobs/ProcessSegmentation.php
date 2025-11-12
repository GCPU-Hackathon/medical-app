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
use Illuminate\Support\Facades\Storage;

class ProcessSegmentation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 3600;
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
            'name' => 'Segmentation Processing',
            'description' => 'Running AI segmentation models on brain MRI images',
            'status' => 'in_progress',
            'step_order' => 3,
            'started_at' => now(),
        ]);

        try {
            Log::info("Starting segmentation processing for Study: {$this->study->code}");
            
            // 1. Appeler l'API FastAPI pour démarrer la segmentation
            $taskId = $this->startSegmentation(['study_code' => $this->study->code, 'simulate' => true]);
            
            Log::info("Segmentation task started", [
                'study_code' => $this->study->code,
                'task_id' => $taskId
            ]);
            
            // 3. Mettre à jour les notes avec le task_id
            $step->update([
                'notes' => "Segmentation task ID: {$taskId}"
            ]);
            
            // 4. Faire du polling jusqu'à ce que la segmentation soit terminée
            $result = $this->pollSegmentationStatus($taskId);
            
            // 5. Traiter le résultat
            $this->processSegmentationResult($result);
            
            // 6. Mettre à jour le step comme réussi
            $step->update([
                'status' => 'completed',
                'completed_at' => now(),
                'notes' => "Segmentation completed. Output: {$result['output_file']}",
            ]);

            Log::info("Segmentation completed successfully for Study: {$this->study->code}");
            
        } catch (\Exception $e) {
            Log::error("Segmentation processing failed for Study: {$this->study->code}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $step->update([
                'status' => 'failed',
                'completed_at' => now(),
                'notes' => 'Segmentation processing failed: ' . $e->getMessage(),
            ]);

            $this->study->update([
                'status' => 'failed',
                'processing_completed_at' => now(),
                'processing_errors' => array_merge(
                    $this->study->processing_errors ?? [],
                    ['segmentation' => $e->getMessage()]
                )
            ]);
            
            throw $e;
        }
    }

    /**
     * Démarrer la segmentation via l'API FastAPI
     */
    private function startSegmentation(array $data): string
    {
        $response = Http::timeout(30)
            ->retry(3, 100)
            ->post('http://brats:8000/segment', $data);
        
        if (!$response->successful()) {
            throw new \Exception(
                "Failed to start segmentation: " . $response->body()
            );
        }
        
        $taskId = $response->json('task_id');
        
        if (!$taskId) {
            throw new \Exception("No task_id returned from segmentation API");
        }
        
        return $taskId;
    }

    /**
     * Faire du polling sur le statut de la segmentation
     */
    private function pollSegmentationStatus(string $taskId): array
    {
        $maxAttempts = 900;
        $attempt = 0;
        
        Log::info("Starting to poll segmentation status", ['task_id' => $taskId]);
        
        while ($attempt < $maxAttempts) {
            
            try {
                $response = Http::timeout(10)
                    ->get("http://brats:8000/task/{$taskId}/status");
                
                if (!$response->successful()) {
                    Log::warning("Failed to check status, retrying...", [
                        'task_id' => $taskId,
                        'attempt' => $attempt
                    ]);
                    $attempt++;
                    continue;
                }
                
                $status = $response->json();
                
                // Vérifier le statut
                if ($status['status'] === 'completed') {
                    Log::info("Segmentation completed", [
                        'task_id' => $taskId,
                        'total_time' => $attempt * 2 . 's'
                    ]);
                    return $status['result'];
                }
                
                if ($status['status'] === 'failed') {
                    $error = $status['error'] ?? 'Unknown error';
                    throw new \Exception("Segmentation failed: {$error}");
                }
                
                // Status est 'pending' ou 'processing', continuer
                $attempt++;
                
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::warning("Connection error while polling, retrying...", [
                    'task_id' => $taskId,
                    'error' => $e->getMessage()
                ]);
                $attempt++;
            }
        }
        
        throw new \Exception("Timeout: Segmentation took longer than 30 minutes");
    }

    /**
     * Traiter le résultat de la segmentation
     */
    private function processSegmentationResult(array $result): void
    {
        // Extraire le filename du path retourné par l'API
        $outputPath = $result['output_file']; // Ex: "storage/studies/STU-AAF57CCE/segmentation_xxx.nii.gz"
        $filename = basename($outputPath);
        
        // Convertir le path pour la DB: "storage/..." → "private/..."
        $relativePath = str_replace('storage/', 'private/', $outputPath);
        
        // Pour accéder au fichier via Storage::disk('private'), enlever le prefix "private/"
        $storageAccessPath = str_replace('storage/', '', $outputPath); // Juste "studies/STU-AAF57CCE/..."
        
        // Vérifier si un asset avec ce filename existe déjà pour ce study
        $existingAsset = $this->study->assets()
            ->where('filename', $filename)
            ->first();
        
        if ($existingAsset) {
            // Scénario 1: Le fichier existe déjà, juste mettre à jour le type
            Log::info("Updating existing asset to segmentation type", [
                'study_code' => $this->study->code,
                'filename' => $filename,
                'asset_id' => $existingAsset->id
            ]);
            
            $existingAsset->update([
                'asset_type' => 'segmentation'
            ]);
            
        } else {
            // Scénario 2: Nouveau fichier, créer un asset
            Log::info("Creating new segmentation asset", [
                'study_code' => $this->study->code,
                'filename' => $filename
            ]);
            
            // Récupérer la taille du fichier (utiliser le path sans "private/")
            $fileSize = Storage::disk('local')->size($storageAccessPath);
            
            // Déterminer le mime_type
            $mimeType = 'application/gzip';
            
            $this->study->assets()->create([
                'filename' => $filename,
                'file_path' => $relativePath, // Stocké avec "private/" dans la DB
                'file_size' => $fileSize,
                'mime_type' => $mimeType,
                'asset_type' => 'segmentation',
                'metadata' => [
                    'task_id' => $result['task_id'] ?? null,
                ]
            ]);
        }
    }

    /**
     * Get the tags that should be assigned to the job.
     */
    public function tags(): array
    {
        return ['segmentation', "study:{$this->study->study_code}"];
    }
}