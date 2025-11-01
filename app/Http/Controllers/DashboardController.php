<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\HealthCheckService;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        $stats = [
            'total_patients' => \App\Models\Patient::count(),
            'total_studies' => \App\Models\Study::count(),
            'recent_patients' => \App\Models\Patient::latest()->take(5)->get(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'gcs_status' => Inertia::defer(fn () => $this->checkGcsConnection(), 'gcs'),
            'segmentation_status' => Inertia::defer(fn () => $this->checkSegmentationService(), 'segmentation'),
            'volumetry_status' => Inertia::defer(fn () => $this->checkVolumetryService(), 'volumetry'), 
            'analysis_status' => Inertia::defer(fn () => $this->checkAnalysisService(), 'analysis'),
            'overall_status' => Inertia::defer(function () {
                $segmentation = $this->checkSegmentationService();
                $volumetry = $this->checkVolumetryService();
                $analysis = $this->checkAnalysisService();
                
                $services = [
                    'segmentation' => $segmentation,
                    'volumetry' => $volumetry,
                    'analysis' => $analysis,
                ];
                
                return HealthCheckService::getOverallStatus($services);
            }, 'overall'),
        ]);
    }

    /**
     * Check segmentation service only
     */
    private function checkSegmentationService(): array
    {
        return HealthCheckService::checkServiceHealth('http://brats:8000/health', 10);
    }

    /**
     * Check volumetry service only  
     */
    private function checkVolumetryService(): array
    {
        return HealthCheckService::checkServiceHealth('http://volumetry-agent:8000/health', 10);
    }

    /**
     * Check analysis service only
     */
    private function checkAnalysisService(): array
    {
        return HealthCheckService::checkServiceHealth('https://medchatbot:8000/health', 10);
    }

    /**
     * Check Google Cloud Storage connection status
     */
    private function checkGcsConnection(): array
    {
        try {
            $disk = Storage::disk('gcs');
            
            $directories = $disk->directories();
            
            $bucketName = config('filesystems.disks.gcs.bucket');
            $projectId = config('filesystems.disks.gcs.project_id');
            $bucketUrl = $bucketName ? "gs://{$bucketName}" : null;
            
            return [
                'status' => 'online',
                'message' => 'Connected to Google Cloud Storage',
                'directories' => count($directories),
                'mri_scans' => count($directories),
                'bucket_name' => $bucketName,
                'bucket_url' => $bucketUrl,
                'project_id' => $projectId,
                'checked_at' => now()->format('Y-m-d H:i:s'),
            ];
            
        } catch (Exception $e) {
            return [
                'status' => 'offline',
                'message' => 'Failed to connect to Google Cloud Storage',
                'error' => $e->getMessage(),
                'bucket_name' => config('filesystems.disks.gcs.bucket'),
                'checked_at' => now()->format('Y-m-d H:i:s'),
            ];
        }
    }
}
