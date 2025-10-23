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
     * Show the form for creating a new patient.
     */
    public function create(): Response
    {
        return Inertia::render('patients/create');
    }

    /**
     * Store a newly created patient in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:patients',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'blood_type' => 'nullable|string|max:10',
            'height' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'allergies' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'current_medications' => 'nullable|string',
            'smoking_status' => 'boolean',
            'alcohol_consumption' => 'boolean',
            'family_medical_history' => 'nullable|string',
        ]);

        $patient = Patient::create($validated);

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Patient created successfully.');
    }

    /**
     * Show the form for editing the specified patient.
     */
    public function edit(Patient $patient): Response
    {
        return Inertia::render('patients/edit', [
            'patient' => $patient,
        ]);
    }

    /**
     * Update the specified patient in storage.
     */
    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:patients,email,' . $patient->id,
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'blood_type' => 'nullable|string|max:10',
            'height' => 'nullable|numeric|min:0',
            'weight' => 'nullable|numeric|min:0',
            'allergies' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'current_medications' => 'nullable|string',
            'smoking_status' => 'boolean',
            'alcohol_consumption' => 'boolean',
            'family_medical_history' => 'nullable|string',
        ]);

        $patient->update($validated);

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Patient updated successfully.');
    }

    /**
     * Remove the specified patient from storage.
     */
    public function destroy(Patient $patient)
    {
        $patient->delete();

        return redirect()->route('patients.index')
            ->with('success', 'Patient deleted successfully.');
    }
}
