<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return redirect('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/test', function(){
    $files = Storage::disk('gcs')->files();
    dd($files);
});

require __DIR__.'/settings.php';
