<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_config', function (Blueprint $table) {
            $table->id();
            $table->decimal('rate_carpintero', 8, 2)->default(88.00);
            $table->decimal('rate_laqueador', 8, 2)->default(77.00);
            $table->decimal('rate_cnc', 8, 2)->default(66.00);
            $table->decimal('rate_auxiliar_carp', 8, 2)->default(48.00);
            $table->decimal('rate_auxiliar_laq', 8, 2)->default(45.00);
            $table->decimal('rate_administrativo', 8, 2)->default(75.00);
            $table->decimal('monthly_rent', 10, 2)->default(0);
            $table->decimal('monthly_electricity', 10, 2)->default(0);
            $table->decimal('monthly_machinery_depreciation', 10, 2)->default(0);
            $table->decimal('min_margin_pct', 5, 2)->default(35.00);
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_config');
    }
};
