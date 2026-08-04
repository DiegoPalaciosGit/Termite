<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HojaViajeraController;
use App\Http\Controllers\HojaStageController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\ProductoCatalogoController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('hojas', HojaViajeraController::class);
    Route::patch('hojas/{hoja}/status', [HojaViajeraController::class, 'updateStatus'])->name('hojas.status');
    Route::post('hojas/{hoja}/stages', [HojaStageController::class, 'store'])->name('hojas.stages.store');
    Route::delete('hojas/{hoja}/stages/{stage}', [HojaStageController::class, 'destroy'])->name('hojas.stages.destroy');

    Route::resource('materiales', MaterialController::class)->parameters(['materiales' => 'material']);
    Route::post('materiales/{material}/entrada', [MaterialController::class, 'entradaStore'])->name('materiales.entrada');
    Route::post('materiales/{material}/salida', [MaterialController::class, 'salidaStore'])->name('materiales.salida');

    Route::get('config/taller', [ConfigController::class, 'tallerShow'])->name('config.taller');
    Route::post('config/taller', [ConfigController::class, 'tallerUpdate'])->name('config.taller.update');

    Route::resource('catalogo', ProductoCatalogoController::class)->only(['index', 'create', 'store', 'edit', 'update']);
});

require __DIR__.'/auth.php';
