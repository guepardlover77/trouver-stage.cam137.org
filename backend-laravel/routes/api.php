<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Middleware\AdminAuthentication;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api by default in Laravel.
| We add /v1 prefix to match the existing API structure.
|
*/

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    // Health check
    Route::get('/health', HealthController::class);

    // Auth routes (rate limiting strict anti brute-force)
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/auth/verify', [AuthController::class, 'verify']);
    });

    // Location routes - Public
    Route::get('/locations', [LocationController::class, 'index']);
    Route::get('/locations/types', [LocationController::class, 'types']);
    Route::get('/locations/cities', [LocationController::class, 'cities']);
    Route::get('/locations/{id}', [LocationController::class, 'show']);

    // Location routes - Protected (require admin code + rate limiting admin)
    Route::middleware([AdminAuthentication::class, 'throttle:admin'])->group(function () {
        Route::post('/locations', [LocationController::class, 'store']);
        Route::put('/locations/{id}', [LocationController::class, 'update']);
        Route::delete('/locations/{id}', [LocationController::class, 'destroy']);
        Route::get('/locations/trashed', [LocationController::class, 'trashed']);
        Route::post('/locations/{id}/restore', [LocationController::class, 'restore']);
    });
});
