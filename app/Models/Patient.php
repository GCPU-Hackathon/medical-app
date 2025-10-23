<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    /**
     * Disable mass assignment protection.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date',
        'height' => 'decimal:2',
        'weight' => 'decimal:2',
        'smoking_status' => 'boolean',
        'alcohol_consumption' => 'boolean',
    ];

    /**
     * Get the studies for the patient.
     */
    public function studies(): HasMany
    {
        return $this->hasMany(Study::class);
    }

    /**
     * Get the patient's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the patient's age.
     */
    public function getAgeAttribute(): int
    {
        return $this->date_of_birth->age;
    }

    /**
     * Get the patient's BMI if height and weight are available.
     */
    public function getBmiAttribute(): ?float
    {
        if (!$this->height || !$this->weight) {
            return null;
        }

        $heightInMeters = $this->height / 100;
        return round($this->weight / ($heightInMeters * $heightInMeters), 2);
    }

    /**
     * Get BMI category.
     */
    public function getBmiCategoryAttribute(): ?string
    {
        $bmi = $this->bmi;
        
        if (!$bmi) {
            return null;
        }

        if ($bmi < 18.5) {
            return 'Underweight';
        } elseif ($bmi < 25) {
            return 'Normal weight';
        } elseif ($bmi < 30) {
            return 'Overweight';
        } else {
            return 'Obese';
        }
    }

    /**
     * Check if patient has allergies.
     */
    public function hasAllergies(): bool
    {
        return !empty($this->allergies);
    }

    /**
     * Check if patient is a smoker.
     */
    public function isSmoker(): bool
    {
        return $this->smoking_status;
    }

    /**
     * Check if patient consumes alcohol.
     */
    public function consumesAlcohol(): bool
    {
        return $this->alcohol_consumption;
    }
}
