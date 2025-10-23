<?php

namespace App\Http\Controllers;

use App\Models\Study;
use Illuminate\Http\Request;
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
}
