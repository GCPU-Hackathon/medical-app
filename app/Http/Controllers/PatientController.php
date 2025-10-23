<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    /**
     * Display a listing of patients.
     */
    public function index(Request $request): Response
    {
        $patients = Patient::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->gender, function ($query, $gender) {
                $query->where('gender', $gender);
            })
            ->when($request->blood_type, function ($query, $bloodType) {
                $query->where('blood_type', $bloodType);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('patients/index', [
            'patients' => $patients,
            'filters' => $request->only(['search', 'gender', 'blood_type']),
            'stats' => [
                'total' => Patient::count(),
                'male' => Patient::where('gender', 'male')->count(),
                'female' => Patient::where('gender', 'female')->count(),
                'with_allergies' => Patient::whereNotNull('allergies')->count(),
            ]
        ]);
    }

    /**
     * Display the specified patient.
     */
    public function show(Patient $patient): Response
    {
        $patient->load(['studies.studySteps', 'studies.assets']);

        return Inertia::render('patients/show', [
            'patient' => $patient,
            'studies_count' => $patient->studies()->count(),
            'latest_studies' => $patient->studies()
                ->with(['studySteps', 'assets'])
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }

    /**
     * API endpoint to get patients for selection components
     */
    public function apiIndex()
    {
        $patients = Patient::select('id', 'first_name', 'last_name', 'email', 'date_of_birth', 'gender', 'blood_type')
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();

        return response()->json([
            'patients' => $patients,
        ]);
    }
}
