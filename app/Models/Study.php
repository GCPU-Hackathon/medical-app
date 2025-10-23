<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Study extends Model
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
        'patient_id' => 'integer',
    ];

    /**
     * Get the patient that owns the study.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the study steps for the study.
     */
    public function studySteps(): HasMany
    {
        return $this->hasMany(StudyStep::class);
    }

    /**
     * Get the assets for the study.
     */
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    /**
     * Check if the study is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'READY';
    }

    /**
     * Check if the study is processing.
     */
    public function isProcessing(): bool
    {
        return $this->status === 'PROCESSING';
    }

    /**
     * Check if the study has failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'FAILED';
    }

    /**
     * Check if the study is new.
     */
    public function isNew(): bool
    {
        return $this->status === 'NEW';
    }
}
