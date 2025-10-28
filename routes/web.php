<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\StudyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return redirect('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('patients', [PatientController::class, 'index'])->name('patients.index');
    Route::get('patients/{patient}', [PatientController::class, 'show'])->name('patients.show');

    Route::get('studies', [StudyController::class, 'index'])->name('studies.index');
    Route::post('studies', [StudyController::class, 'store'])->name('studies.store');
    Route::get('studies/{study}', [StudyController::class, 'show'])->name('studies.show');
    Route::post('studies/{study}/cancel', [StudyController::class, 'cancel'])->name('studies.cancel');
    Route::post('studies/{study}/send-to-vr', [StudyController::class, 'sendToVR'])->name('studies.send-to-vr');
    Route::get('studies/{study}/assets/{asset}/download', [StudyController::class, 'downloadAsset'])->name('studies.assets.download');

    // API routes for modal components
    Route::prefix('api')->group(function () {
        Route::get('patients', [PatientController::class, 'apiIndex']);
        Route::get('gcs/directories', [StudyController::class, 'getGcsDirectories']);
    });
});

// Public API routes (no auth required)
Route::get('/active', [StudyController::class, 'active'])->name('api.studies.active');

require __DIR__.'/settings.php';
