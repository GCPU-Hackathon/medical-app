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
    }
}
