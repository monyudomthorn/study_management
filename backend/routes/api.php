<?php

use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DatabaseResetController;
use App\Http\Controllers\Api\PracticeController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\UserProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for Study Management System
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// User Profile
Route::get('/user/profile', [UserProfileController::class, 'getProfile']);
Route::post('/user/profile', [UserProfileController::class, 'updateProfile']);
Route::put('/user/profile', [UserProfileController::class, 'updateProfile']);

// Teachers CRUD
Route::apiResource('teachers', TeacherController::class);

// Subjects CRUD
Route::apiResource('subjects', SubjectController::class);

// Practice Tasks CRUD + Toggle
Route::apiResource('practices', PracticeController::class);
Route::patch('/practices/{practice}/toggle', [PracticeController::class, 'toggleComplete']);

// Assignments CRUD + Toggle
Route::apiResource('assignments', AssignmentController::class);
Route::patch('/assignments/{assignment}/toggle', [AssignmentController::class, 'toggleComplete']);

// Dashboard Stats & Analytics
Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

// Reset and Seed Database
Route::post('/seed-default', [DatabaseResetController::class, 'resetAndSeed']);
