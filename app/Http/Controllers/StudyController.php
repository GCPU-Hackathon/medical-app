<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessStudyPipeline;
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
        $studies = Study::with(['patient'])
            ->latest()
            ->withCount('studySteps', 'assets')
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
        $study->load(['patient', 'studySteps', 'assets']);

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

        $validated['code'] = Study::generateCode();
        
        $study = Study::create($validated);

        ProcessStudyPipeline::dispatch($study);

        return redirect()->route('studies.show', $study)
            ->with('success', 'Study created successfully and processing has been started!');
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

    /**
     * Get study data for API polling
     */
    public function apiShow(Study $study)
    {
        $study->load(['patient', 'studySteps' => function($query) {
            $query->orderBy('step_order');
        }]);
        
        return response()->json($study);
    }

    /**
     * Cancel a running study
     */
    public function cancel(Study $study)
    {
        if ($study->status === 'in_progress') {
            $study->update([
                'status' => 'cancelled',
                'processing_completed_at' => now()
            ]);
            
            // Update any running steps
            $study->studySteps()
                ->where('status', 'in_progress')
                ->update([
                    'status' => 'cancelled',
                    'completed_at' => now(),
                    'notes' => 'Study cancelled by user'
                ]);
        }
        
        return redirect()->back()->with('success', 'Study has been cancelled.');
    }
}
