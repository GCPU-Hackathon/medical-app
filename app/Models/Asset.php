<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asset extends Model
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
        'metadata' => 'array',
    ];

    /**
     * Get the study that owns the asset.
     */
    public function study(): BelongsTo
    {
        return $this->belongsTo(Study::class);
    }

    /**
     * Get the filename from the GCS path.
     */
    public function getFilenameAttribute(): string
    {
        return basename($this->gcs_path);
    }

    /**
     * Get the file extension from the GCS path.
     */
    public function getExtensionAttribute(): string
    {
        return pathinfo($this->gcs_path, PATHINFO_EXTENSION);
    }

    /**
     * Check if the asset is an image.
     */
    public function isImage(): bool
    {
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        return in_array(strtolower($this->extension), $imageExtensions);
    }

    /**
     * Check if the asset is a DICOM file.
     */
    public function isDicom(): bool
    {
        $dicomExtensions = ['dcm', 'dicom'];
        return in_array(strtolower($this->extension), $dicomExtensions);
    }
}
