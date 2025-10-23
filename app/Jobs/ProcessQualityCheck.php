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
use Illuminate\Support\Facades\Storage;

class ProcessQualityCheck implements ShouldQueue
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
    public function handle()
    {
        $step = StudyStep::create([
            'study_id' => $this->study->id,
            'name' => 'Quality Check',
            'description' => 'Downloading and validating study data from Google Cloud Storage',
            'status' => 'in_progress',
            'step_order' => 2,
            'started_at' => now(),
        ]);

        try {
            Log::info("Starting quality check for Study ID: {$this->study->id}, GCS Directory: {$this->study->gcs_directory}");
            
            // Add initial delay to make it look more realistic
            sleep(3);
            
            // Step 1: Download all gz files from GCS directory
            $gzFiles = $this->downloadGzFilesFromGCS();
            
            // Step 2: Extract each gz file to get .nii files
            $niiFiles = $this->extractAllGzFiles($gzFiles);
            
            // Step 5: Check if files are in correct format (*-t2w.nii, *-t1c.nii, *-t1n.nii, *-t2f.nii)
            $this->validateNiiFiles($niiFiles);
            
            // Step 6: Link the assets using Asset model and store all files
            $this->createAssetRecords($niiFiles);
            
            $step->update([
                'status' => 'completed',
                'completed_at' => now(),
                'notes' => 'Quality check completed successfully. All required asset types validated and stored.',
            ]);

            Log::info("Quality check completed for Study ID: {$this->study->id}");

        } catch (\Exception $e) {
            Log::error("Quality check failed for Study ID: {$this->study->id}", [
                'error' => $e->getMessage()
            ]);
            
            $step->update([
                'status' => 'failed',
                'completed_at' => now(),
                'notes' => 'Quality check failed: ' . $e->getMessage(),
            ]);

            $this->study->update([
                'status' => 'failed',
                'processing_errors' => ['quality_check' => $e->getMessage()]
            ]);
            
            throw $e;
        }
    }

    private function downloadGzFilesFromGCS(): array
    {
        $gcsDisk = Storage::disk('gcs');
        
        // List all files in the GCS directory
        $files = $gcsDisk->files($this->study->gcs_directory);
        
        // Filter to get only gz files
        $gzFiles = array_filter($files, fn($file) => str_ends_with($file, '.gz'));
        
        if (empty($gzFiles)) {
            throw new \Exception("No gz files found in GCS directory: {$this->study->gcs_directory}");
        }
        
        Log::info("Found " . count($gzFiles) . " gz files in GCS directory: {$this->study->gcs_directory}");
        
        // Create local directory using study code
        $localDisk = Storage::disk('local');
        $localDir = "studies/{$this->study->code}";
        $localDisk->makeDirectory($localDir);
        
        $localGzFiles = [];
        
        // Download each gz file
        foreach ($gzFiles as $gzFile) {
            $fileName = basename($gzFile);
            $localFilePath = "{$localDir}/{$fileName}";
            
            Log::info("Attempting to download GCS file: {$gzFile}");
            
            // Check if file exists on GCS
            if (!$gcsDisk->exists($gzFile)) {
                throw new \Exception("File does not exist on GCS: {$gzFile}");
            }
            
            // Get file contents from GCS
            $fileContents = $gcsDisk->get($gzFile);
            
            if ($fileContents === false || $fileContents === null) {
                throw new \Exception("Failed to read file contents from GCS: {$gzFile}");
            }
            
            // Save to local storage using Laravel Storage
            $success = $localDisk->put($localFilePath, $fileContents);
            
            if (!$success) {
                throw new \Exception("Failed to save file locally: {$localFilePath}");
            }
            
            $absolutePath = $localDisk->path($localFilePath);
            $localGzFiles[] = $absolutePath;
            
            Log::info("Successfully downloaded gz file from GCS: {$gzFile} to {$absolutePath} (size: " . strlen($fileContents) . " bytes)");
        }
        
        return $localGzFiles;
    }

    private function extractAllGzFiles(array $gzFiles): array
    {
        $niiFiles = [];
        $localDisk = Storage::disk('local');
        
        foreach ($gzFiles as $gzFile) {
            $gzFileName = basename($gzFile, '.gz');
            $extractDir = "studies/{$this->study->code}/extracted";
            
            // Create extraction directory
            $localDisk->makeDirectory($extractDir);
            
            // Extract gz file using gzopen
            $extractedFilePath = $localDisk->path("{$extractDir}/{$gzFileName}");
            
            $gzHandle = gzopen($gzFile, 'rb');
            if ($gzHandle === false) {
                throw new \Exception("Failed to open gz file: {$gzFile}");
            }
            
            $outputHandle = fopen($extractedFilePath, 'wb');
            if ($outputHandle === false) {
                gzclose($gzHandle);
                throw new \Exception("Failed to create output file: {$extractedFilePath}");
            }
            
            // Extract the compressed data
            while (!gzeof($gzHandle)) {
                $data = gzread($gzHandle, 8192);
                fwrite($outputHandle, $data);
            }
            
            gzclose($gzHandle);
            fclose($outputHandle);
            
            // Check if the extracted file is a .nii file
            if (str_ends_with($gzFileName, '.nii')) {
                $niiFiles[] = $extractedFilePath;
                Log::info("Extracted gz file: {$gzFile} to {$extractedFilePath}");
            } else {
                Log::warning("Extracted file is not a .nii file: {$extractedFilePath}");
            }
        }
        
        return $niiFiles;
    }
    
    private function validateNiiFiles(array $niiFiles): void
    {
        $requiredTypes = ['t1c', 't1n', 't2w', 't2f'];
        $foundTypes = [];
        
        foreach ($niiFiles as $file) {
            $filename = basename($file);
            foreach ($requiredTypes as $type) {
                if (str_contains($filename, "-{$type}.nii")) {
                    $foundTypes[] = $type;
                    break;
                }
            }
        }
        
        $missingTypes = array_diff($requiredTypes, $foundTypes);
        if (!empty($missingTypes)) {
            throw new \Exception("Missing required file types: " . implode(', ', $missingTypes));
        }
        
        Log::info("All required NII file types found: " . implode(', ', $foundTypes));
    }
    
    private function createAssetRecords(array $niiFiles): void
    {
        foreach ($niiFiles as $filePath) {
            $filename = basename($filePath);
            $fileSize = filesize($filePath);
            
            // Determine asset type from filename
            $assetType = 'unknown';
            $requiredTypes = ['t1c', 't1n', 't2w', 't2f'];
            foreach ($requiredTypes as $type) {
                if (str_contains($filename, "-{$type}.nii")) {
                    $assetType = $type;
                    break;
                }
            }
            
            // Convert absolute path to relative path from storage/app
            $relativePath = str_replace(storage_path('app/'), '', $filePath);
            
            // Create asset record with the path where files are stored
            $this->study->assets()->create([
                'filename' => $filename,
                'file_path' => $relativePath,
                'file_size' => $fileSize,
                'mime_type' => 'application/octet-stream',
                'asset_type' => $assetType,
                'metadata' => [
                    'original_gcs_directory' => $this->study->gcs_directory,
                    'processed_at' => now()->toDateTimeString()
                ]
            ]);
            
            Log::info("Created asset record for: {$filename} (type: {$assetType}) at path: {$relativePath}");
        }
    }
}
