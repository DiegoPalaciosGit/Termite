<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products_catalog', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('sale_price', 10, 2);
            $table->decimal('estimated_cost', 10, 2)->default(0);
            $table->decimal('margin_pct', 5, 2)->default(0);
            $table->string('margin_status', 10)->default('verde');
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products_catalog');
    }
};
