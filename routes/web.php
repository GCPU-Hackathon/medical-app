<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
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
});

Route::get('/test', function(){
    $files = Storage::disk('gcs')->files();
    dd($files);
});

require __DIR__.'/settings.php';
