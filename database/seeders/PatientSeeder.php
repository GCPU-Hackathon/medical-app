<?php

namespace Database\Seeders;

use App\Models\Patient;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Patient::factory()->count(25)->create();
        
        Patient::factory()
            ->elderly()
            ->count(10)
            ->create();
        
        Patient::factory()
            ->youngAdult()
            ->count(15)
            ->create();
        
        Patient::factory()
            ->diabetic()
            ->count(5)
            ->create();
        
        Patient::factory()
            ->withAllergies()
            ->count(8)
            ->create();
        
        Patient::factory()
            ->smoker()
            ->count(5)
            ->create();
        
        // Create some specific test patients for development
        Patient::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'date_of_birth' => '1980-05-15',
            'gender' => 'male',
            'blood_type' => 'O+',
            'height' => 175.0,
            'weight' => 70.0,
            'allergies' => 'Penicillin',
            'medical_history' => 'Hypertension',
            'current_medications' => 'Lisinopril 10mg daily',
            'smoking_status' => false,
            'alcohol_consumption' => true,
        ]);
        
        Patient::factory()->create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@example.com',
            'date_of_birth' => '1992-11-22',
            'gender' => 'female',
            'blood_type' => 'A+',
            'height' => 165.0,
            'weight' => 60.0,
            'allergies' => null,
            'medical_history' => null,
            'current_medications' => null,
            'smoking_status' => false,
            'alcohol_consumption' => false,
        ]);
        
        Patient::factory()->create([
            'first_name' => 'Robert',
            'last_name' => 'Johnson',
            'email' => 'robert.johnson@example.com',
            'date_of_birth' => '1945-03-10',
            'gender' => 'male',
            'blood_type' => 'B-',
            'height' => 180.0,
            'weight' => 85.0,
            'allergies' => 'Shellfish, Peanuts',
            'medical_history' => 'Diabetes Type 2, High cholesterol, Arthritis',
            'current_medications' => 'Metformin 500mg twice daily; Atorvastatin 20mg daily; Ibuprofen 400mg as needed',
            'smoking_status' => true,
            'alcohol_consumption' => true,
            'family_medical_history' => 'Family history of diabetes and heart disease',
        ]);
    }
}
