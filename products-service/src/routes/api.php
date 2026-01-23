<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'service' => 'Products Service',
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String()
    ]);
});

Route::post('/products/update-stock', [ProductController::class, 'updateStock']);

Route::middleware('jwt.auth')->group(function () {

    Route::get('/verify-token', function (Illuminate\Http\Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Token is valid',
            'user_id' => $request->attributes->get('user_id'),
            'user_email' => $request->attributes->get('user_email'),
            'user_role' => $request->attributes->get('user_role'),
        ]);
    });

    Route::middleware(['role:user,admin'])->group(function () {
        Route::get('/products', [ProductController::class, 'index']);         
        Route::get('/products/{id}', [ProductController::class, 'show']);
        Route::post('/products/validate-stock', [ProductController::class, 'validateStock']);
        
        Route::middleware(['role:admin'])->group(function () {
            Route::post('/products', [ProductController::class, 'store']);         
            Route::put('/products/{id}', [ProductController::class, 'update']);   
            Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        });
    });
});