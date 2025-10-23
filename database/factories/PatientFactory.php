<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Patient>
 */
class PatientFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Patient::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        $allergies = [
            'Penicillin',
            'Peanuts',
            'Shellfish',
            'Latex',
            'Dust mites',
            'Pollen',
            'Milk',
            'Eggs',
            'Soy',
            'Tree nuts',
        ];

        $medicalConditions = [
            'Hypertension',
            'Diabetes Type 2',
            'Asthma',
            'High cholesterol',
            'Arthritis',
            'Depression',
            'Anxiety',
            'Migraine',
            'GERD',
            'Hypothyroidism',
        ];

        $medications = [
            'Lisinopril 10mg daily',
            'Metformin 500mg twice daily',
            'Albuterol inhaler as needed',
            'Atorvastatin 20mg daily',
            'Ibuprofen 400mg as needed',
            'Levothyroxine 50mcg daily',
            'Omeprazole 20mg daily',
            'Sertraline 50mg daily',
        ];

        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'date_of_birth' => $this->faker->dateTimeBetween('-90 years', '-18 years')->format('Y-m-d'),
            'gender' => $this->faker->randomElement(['male', 'female']),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_phone' => $this->faker->phoneNumber(),
            'blood_type' => $this->faker->randomElement($bloodTypes),
            'height' => $this->faker->randomFloat(2, 150, 200), // 150-200 cm
            'weight' => $this->faker->randomFloat(2, 45, 150), // 45-150 kg
            'allergies' => $this->faker->boolean(30) ? implode(', ', $this->faker->randomElements($allergies, rand(1, 3))) : null,
            'medical_history' => $this->faker->boolean(60) ? implode(', ', $this->faker->randomElements($medicalConditions, rand(1, 2))) : null,
            'current_medications' => $this->faker->boolean(40) ? implode('; ', $this->faker->randomElements($medications, rand(1, 3))) : null,
            'insurance_provider' => $this->faker->boolean(85) ? $this->faker->randomElement(['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana', 'Kaiser Permanente']) : null,
            'insurance_policy_number' => $this->faker->boolean(85) ? strtoupper($this->faker->bothify('##???####')) : null,
            'primary_physician' => $this->faker->boolean(80) ? 'Dr. ' . $this->faker->name() : null,
            'primary_physician_phone' => $this->faker->boolean(80) ? $this->faker->phoneNumber() : null,
            'smoking_status' => $this->faker->boolean(20), // 20% chance of being a smoker
            'alcohol_consumption' => $this->faker->boolean(60), // 60% chance of consuming alcohol
            'family_medical_history' => $this->faker->boolean(50) ? $this->faker->randomElement([
                'Family history of heart disease',
                'Family history of diabetes',
                'Family history of cancer (breast)',
                'Family history of hypertension',
                'Family history of stroke',
                'Family history of mental health disorders',
                'No significant family medical history',
            ]) : null,
            'notes' => $this->faker->boolean(30) ? $this->faker->paragraph() : null,
        ];
    }

    /**
     * Indicate that the patient is a smoker.
     */
    public function smoker(): static
    {
        return $this->state(fn (array $attributes) => [
            'smoking_status' => true,
        ]);
    }

    /**
     * Indicate that the patient has diabetes.
     */
    public function diabetic(): static
    {
        return $this->state(fn (array $attributes) => [
            'medical_history' => 'Diabetes Type 2',
            'current_medications' => 'Metformin 500mg twice daily',
        ]);
    }

    /**
     * Indicate that the patient has allergies.
     */
    public function withAllergies(): static
    {
        return $this->state(fn (array $attributes) => [
            'allergies' => 'Penicillin, Peanuts, Shellfish',
        ]);
    }

    /**
     * Create an elderly patient.
     */
    public function elderly(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_of_birth' => $this->faker->dateTimeBetween('-90 years', '-65 years')->format('Y-m-d'),
        ]);
    }

    /**
     * Create a young adult patient.
     */
    public function youngAdult(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_of_birth' => $this->faker->dateTimeBetween('-35 years', '-18 years')->format('Y-m-d'),
        ]);
    }
}
