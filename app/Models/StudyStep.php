<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyStep extends Model
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
        'study_id' => 'integer',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    /**
     * Get the study that owns the study step.
     */
    public function study(): BelongsTo
    {
        return $this->belongsTo(Study::class);
    }

    /**
     * Check if the study step is running.
     */
    public function isRunning(): bool
    {
        return $this->status === 'RUNNING';
    }

    /**
     * Check if the study step is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'COMPLETED';
    }

    /**
     * Check if the study step has failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'FAILED';
    }

    /**
     * Get the duration of the step in seconds.
     */
    public function getDurationAttribute(): ?int
    {
        if (!$this->started_at || !$this->ended_at) {
            return null;
        }

        return $this->ended_at->diffInSeconds($this->started_at);
    }

    /**
     * Scope a query to only include steps of a given type.
     */
    public function scopeOfType($query, string $stepName)
    {
        return $query->where('step_name', $stepName);
    }

    /**
     * Scope a query to only include completed steps.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'COMPLETED');
    }

    /**
     * Scope a query to only include failed steps.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'FAILED');
    }

    /**
     * Scope a query to only include running steps.
     */
    public function scopeRunning($query)
    {
        return $query->where('status', 'RUNNING');
    }
}
