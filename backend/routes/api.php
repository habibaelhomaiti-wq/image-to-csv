<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ExportController;
use App\Http\Controllers\Api\V1\PlatformController;
use App\Http\Controllers\Api\V1\ProductListController;
use App\Http\Controllers\Api\V1\DashboardController;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/products/bulk-delete', [ProductController::class, 'bulkDelete']);
        Route::apiResource('products', ProductController::class);
        Route::apiResource('product-lists', ProductListController::class);
        Route::post('/products/analyze', [ProductController::class, 'store']); // Alias for analyze
        Route::apiResource('platforms', PlatformController::class)->only(['index', 'update']);

        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/exports', [ExportController::class, 'index']);
        Route::post('/exports', [ExportController::class, 'store']);
        Route::post('/exports/list', [ExportController::class, 'storeList']);
        Route::get('/exports/{id}/download', [ExportController::class, 'download']);
    });
});
