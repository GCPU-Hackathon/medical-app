<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    /**
     * Cache keys used throughout the application
     */
    const DASHBOARD_STATS = 'dashboard_stats';
    const PATIENT_STATS = 'patient_stats';
    const PATIENTS_API_ALL = 'patients_api_all';
    const STUDIES_INDEX_DATA = 'studies_index_data';
    const GCS_CONNECTION_STATUS = 'gcs_connection_status';
    const GCS_DIRECTORIES_LIST = 'gcs_directories_list';

    /**
     * Clear all application caches
     */
    public static function clearAll(): void
    {
        Cache::flush();
    }

    /**
     * Clear patient-related caches
     */
    public static function clearPatientCaches(): void
    {
        Cache::forget(self::PATIENT_STATS);
        Cache::forget(self::PATIENTS_API_ALL);
        Cache::forget(self::DASHBOARD_STATS);
        
        // Clear individual patient caches (pattern-based)
        self::clearCachePattern('patient_*_details');
        self::clearCachePattern('patients_index_*');
    }

    /**
     * Clear study-related caches
     */
    public static function clearStudyCaches(): void
    {
        Cache::forget(self::STUDIES_INDEX_DATA);
        Cache::forget(self::DASHBOARD_STATS);
        
        // Clear individual study caches
        self::clearCachePattern('study_*_details');
    }

    /**
     * Clear GCS-related caches
     */
    public static function clearGcsCaches(): void
    {
        Cache::forget(self::GCS_CONNECTION_STATUS);
        Cache::forget(self::GCS_DIRECTORIES_LIST);
        Cache::forget(self::DASHBOARD_STATS);
    }

    /**
     * Clear dashboard-specific caches
     */
    public static function clearDashboardCaches(): void
    {
        Cache::forget(self::DASHBOARD_STATS);
        Cache::forget(self::GCS_CONNECTION_STATUS);
    }

    /**
     * Clear cache for a specific patient
     */
    public static function clearPatientCache(int $patientId): void
    {
        Cache::forget("patient_{$patientId}_details");
        self::clearPatientCaches(); // Clear aggregate caches as well
    }

    /**
     * Clear cache for a specific study
     */
    public static function clearStudyCache(int $studyId): void
    {
        Cache::forget("study_{$studyId}_details");
        self::clearStudyCaches(); // Clear aggregate caches as well
    }

    /**
     * Get cache statistics
     */
    public static function getStats(): array
    {
        $cacheKeys = [
            'Dashboard Stats' => self::DASHBOARD_STATS,
            'Patient Stats' => self::PATIENT_STATS,
            'Patients API' => self::PATIENTS_API_ALL,
            'Studies Index' => self::STUDIES_INDEX_DATA,
            'GCS Connection' => self::GCS_CONNECTION_STATUS,
            'GCS Directories' => self::GCS_DIRECTORIES_LIST,
        ];

        $stats = [];
        foreach ($cacheKeys as $label => $key) {
            $stats[$label] = [
                'key' => $key,
                'exists' => Cache::has($key),
                'size' => Cache::has($key) ? strlen(serialize(Cache::get($key))) : 0,
            ];
        }

        return $stats;
    }

    /**
     * Warm up commonly used caches
     */
    public static function warmUp(): void
    {
        // Pre-load patient stats
        Cache::remember(self::PATIENT_STATS, 600, function () {
            return [
                'total' => \App\Models\Patient::count(),
                'male' => \App\Models\Patient::where('gender', 'male')->count(),
                'female' => \App\Models\Patient::where('gender', 'female')->count(),
                'with_allergies' => \App\Models\Patient::whereNotNull('allergies')->count(),
            ];
        });

        // Pre-load patients for API
        Cache::remember(self::PATIENTS_API_ALL, 300, function () {
            return \App\Models\Patient::select('id', 'first_name', 'last_name', 'email', 'date_of_birth', 'gender', 'blood_type')
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get();
        });

        // Pre-load studies data
        Cache::remember(self::STUDIES_INDEX_DATA, 300, function () {
            $studies = \App\Models\Study::with(['patient', 'studySteps', 'assets'])
                ->latest()
                ->paginate(10);

            $stats = [
                'total' => \App\Models\Study::count(),
                'completed' => \App\Models\Study::where('status', 'completed')->count(),
                'in_progress' => \App\Models\Study::where('status', 'in_progress')->count(),
                'pending' => \App\Models\Study::where('status', 'pending')->count(),
            ];

            return [
                'studies' => $studies,
                'stats' => $stats,
            ];
        });
    }

    /**
     * Clear caches matching a pattern (helper method)
     * Note: This is a simplified implementation - in production you might want to use Redis SCAN
     */
    private static function clearCachePattern(string $pattern): void
    {
        // For file/database cache, we'll need to implement pattern matching
        // This is a basic implementation that works with common patterns
        $keys = [];
        
        // Get potential keys based on pattern
        if (strpos($pattern, 'patient_') !== false) {
            // Clear patient-related caches for IDs 1-1000 (adjust as needed)
            for ($i = 1; $i <= 1000; $i++) {
                $keys[] = "patient_{$i}_details";
            }
        }
        
        if (strpos($pattern, 'study_') !== false) {
            // Clear study-related caches for IDs 1-1000 (adjust as needed)
            for ($i = 1; $i <= 1000; $i++) {
                $keys[] = "study_{$i}_details";
            }
        }

        if (strpos($pattern, 'patients_index_') !== false) {
            // Clear paginated patient index caches
            for ($i = 1; $i <= 20; $i++) {
                $keys[] = "patients_index_" . md5("page_{$i}");
            }
        }

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }
}
