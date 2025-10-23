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
        Schema::create('study_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_id')->constrained('studies');
            $table->enum('step_name', ['QUALITY_CHECK', 'SEGMENTATION', 'VOLUMETERY', 'LLM_ANALYSIS']);
            $table->enum('status', ['RUNNING', 'COMPLETED', 'FAILED']);
            $table->datetime('started_at')->nullable();
            $table->datetime('ended_at')->nullable();
            $table->text('message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_steps');
    }
};
