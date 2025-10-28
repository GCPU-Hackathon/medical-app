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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

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
            'description' => 'Generate VRDF file - Preparing assets for VR visualization',
            'status' => 'in_progress',
            'step_order' => 6,
            'started_at' => now(),
        ]);

        try {
            Log::info("Starting VR asset preparation for Study: {$this->study->code}");
            
            $requiredTypes = ['t1c', 't1n', 't2w', 't2f'];
            $files = $this->getRequiredFiles($requiredTypes);
            
            $segmentationAsset = $this->study->assets()
                ->where('asset_type', 'segmentation')
                ->first();
            
            if (!$segmentationAsset) {
                throw new \Exception("Segmentation file not found for VR preparation in study {$this->study->code}");
            }
            
            if (empty($files)) {
                throw new \Exception("No required MRI files found for VR preparation in study {$this->study->code}");
            }
            
            $totalFiles = count($files);
            $current = 0;
            
            foreach ($files as $type => $filename) {
                $current++;
                
                $step->update([
                    'description' => "Generate VRDF file - Converting {$current}/{$totalFiles}",
                    'notes' => "Processing {$type} file: {$filename}"
                ]);
                
                Log::info("Processing VR file {$current}/{$totalFiles}", [
                    'study_code' => $this->study->code,
                    'type' => $type,
                    'filename' => $filename
                ]);
                
                $this->processVRFile($type, $filename, $segmentationAsset->filename);
            }
            
            $step->update([
                'status' => 'completed',
                'completed_at' => now(),
                'description' => "Generate VRDF file - Preparing assets for VR visualization",
                'notes' => "VR asset preparation completed successfully. All {$totalFiles} files processed.",
            ]);

            Log::info("VR asset preparation completed successfully for Study: {$this->study->code}");
            
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
     * Get required files from assets
     */
    private function getRequiredFiles(array $requiredTypes): array
    {
        $files = [];
        
        foreach ($requiredTypes as $type) {
            $asset = $this->study->assets()
                ->where('asset_type', $type)
                ->first();
            
            if ($asset) {
                $files[$type] = $asset->filename;
            } else {
                Log::warning("Missing asset type {$type} for study {$this->study->code}");
            }
        }
        
        return $files;
    }

    /**
     * Process individual VR file
     */
    private function processVRFile(string $type, string $filename, string $segFilename): void
    {
        $requestData = [
            'study_code' => $this->study->code,
            'filename' => $filename,
            'seg_filename' => $segFilename
        ];
        
        $response = Http::timeout(120)
            ->retry(3, 100)
            ->post('http://vrdf-service:8000/convert', $requestData);
        
        if (!$response->successful()) {
            throw new \Exception(
                "VRDF service failed for {$type}: " . $response->body()
            );
        }
        
        $result = $response->json();
        
        if (!$result['success']) {
            throw new \Exception(
                "VRDF conversion failed for {$type}: " . ($result['message'] ?? 'Unknown error')
            );
        }
        
        $this->storeVRDFAsset($type, $result['vrdf_file']);
        
        Log::info("VRDF file processed successfully", [
            'study_code' => $this->study->code,
            'type' => $type,
            'filename' => $filename,
            'seg_filename' => $segFilename,
            'vrdf_file' => $result['vrdf_file'],
            'result' => $result
        ]);
    }

    /**
     * Store VRDF file as asset
     */
    private function storeVRDFAsset(string $type, string $vrdfFilename): void
    {
        $localDisk = Storage::disk('local');
        $vrdfFilePath = "studies/{$this->study->code}/{$vrdfFilename}";
        
        if (!$localDisk->exists($vrdfFilePath)) {
            throw new \Exception("VRDF file not found: {$vrdfFilename} for study {$this->study->code}");
        }
        
        $absolutePath = $localDisk->path($vrdfFilePath);
        $fileSize = filesize($absolutePath);
        
        $asset = $this->study->assets()->create([
            'filename' => $vrdfFilename,
            'file_path' => $vrdfFilePath,
            'file_size' => $fileSize,
            'mime_type' => 'application/octet-stream',
            'asset_type' => $type . '_vrdf',
            'metadata' => [
                'created_by_vr_preparation' => true,
                'modality' => $type,
                'processed_at' => now()->toDateTimeString()
            ]
        ]);
        
        Log::info("Created new VRDF asset", [
            'study_code' => $this->study->code,
            'filename' => $vrdfFilename,
            'asset_id' => $asset->id,
            'asset_type' => $type . '_vrdf',
            'path' => $vrdfFilePath,
            'size' => round($fileSize / 1024, 2) . ' KB'
        ]);
    }

    /**
     * Get the tags that should be assigned to the job.
     */
    public function tags(): array
    {
        return ['vr-preparation', "study:{$this->study->code}"];
    }
}
