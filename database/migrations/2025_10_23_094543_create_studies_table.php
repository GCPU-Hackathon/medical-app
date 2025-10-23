<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('studies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('code')->unique();
            $table->foreignId('patient_id')->constrained('patients');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled', 'failed']);
            $table->string('gcs_directory')->nullable();
            $table->string('gcs_path')->nullable();
            $table->date('study_date');
            $table->boolean('is_vr')->default(false);
            $table->json('processing_status')->nullable();
            $table->timestamp('processing_started_at')->nullable();
            $table->timestamp('processing_completed_at')->nullable();
            $table->text('processing_errors')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('studies');
    }
};
