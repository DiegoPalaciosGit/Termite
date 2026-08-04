<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hoja_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hoja_viajera_id')->constrained('hojas_viajeras')->cascadeOnDelete();
            $table->string('stage', 30);
            $table->string('worker_name', 100)->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hoja_stages');
    }
};
