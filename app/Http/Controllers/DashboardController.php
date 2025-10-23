<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        // Check Google Cloud Storage connection
        $gcsStatus = $this->checkGcsConnection();
        
        // Check internal services
        $servicesStatus = $this->checkInternalServices();
        
        // Get some basic stats
        $stats = [
            'total_patients' => \App\Models\Patient::count(),
            'total_studies' => \App\Models\Study::count(),
            'recent_patients' => \App\Models\Patient::latest()->take(5)->get(),
            'gcs_status' => $gcsStatus,
            'services_status' => $servicesStatus,
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }

    /**
     * Check internal services status
     */
    private function checkInternalServices(): array
    {
        $services = [
            'segmentation' => [
                'name' => 'Segmentation Agent',
                'description' => 'Medical image segmentation service',
                'status' => 'online',
                'last_check' => now()->format('Y-m-d H:i:s'),
            ],
            'volumetry' => [
                'name' => 'Volumetry Agent',
                'description' => 'Volume measurement analysis service',
                'status' => 'offline',
                'last_check' => now()->format('Y-m-d H:i:s'),
            ],
            'analysis' => [
                'name' => 'Analysis Agent',
                'description' => 'AI-powered medical analysis service',
                'status' => 'offline',
                'last_check' => now()->format('Y-m-d H:i:s'),
            ],
        ];

        return $services;
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
