<?php

namespace App\Http\Controllers;

use App\Models\Study;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class StudyController extends Controller
{
    /**
     * Display a listing of the studies.
     */
    public function index(): Response
    {
        $studies = Study::with(['patient', 'studySteps', 'assets'])
            ->latest()
            ->paginate(10);

        $stats = [
            'total' => Study::count(),
            'completed' => Study::where('status', 'completed')->count(),
            'in_progress' => Study::where('status', 'in_progress')->count(),
            'pending' => Study::where('status', 'pending')->count(),
        ];

        return Inertia::render('studies/index', [
            'studies' => $studies,
            'stats' => $stats,
        ]);
    }

    /**
     * Display the specified study.
     */
    public function show(Study $study): Response
    {
        $study->load(['patient', 'studySteps.assets', 'assets']);

        return Inertia::render('studies/show', [
            'study' => $study,
        ]);
    }

    /**
     * Store a newly created study.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'gcs_directory' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'study_date' => 'required|date',
        ]);

        $study = Study::create($validated);

        return redirect()->route('studies.index')
            ->with('success', 'Study created successfully!');
    }

    /**
     * API endpoint to get Google Cloud Storage directories
     */
    public function getGcsDirectories()
    {
        $cacheKey = 'gcs_directories_list';
        
        return Cache::remember($cacheKey, 86400, function () { // 10 minutes cache
            try {
                $disk = Storage::disk('gcs');
                $directories = $disk->directories();
                
                $formattedDirectories = [];
                
                foreach ($directories as $directory) {
                    $files = $disk->files($directory);
                    $lastModified = null;
                    
                    // Try to get last modified date from one of the files
                    if (!empty($files)) {
                        try {
                            $lastModified = $disk->lastModified($files[0]);
                            $lastModified = date('Y-m-d H:i:s', $lastModified);
                        } catch (\Exception $e) {
                            // Ignore if we can't get the date
                        }
                    }
                    
                    $formattedDirectories[] = [
                        'name' => basename($directory),
                        'path' => $directory,
                        'file_count' => count($files),
                        'last_modified' => $lastModified,
                    ];
                }
                
                return response()->json([
                    'directories' => $formattedDirectories,
                    'status' => 'success',
                ]);
                
            } catch (\Exception $e) {
                return response()->json([
                    'directories' => [],
                    'status' => 'error',
                    'message' => $e->getMessage(),
                ], 500);
            }
        });
    }
}
