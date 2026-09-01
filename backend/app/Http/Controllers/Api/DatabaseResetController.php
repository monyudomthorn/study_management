<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Practice;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class DatabaseResetController extends Controller
{
    public function resetAndSeed(): JsonResponse
    {
        try {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            Assignment::truncate();
            Practice::truncate();
            Subject::truncate();
            Teacher::truncate();
            User::truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        } catch (\Exception $e) {
            // If running on sqlite/other
            Assignment::query()->delete();
            Practice::query()->delete();
            Subject::query()->delete();
            Teacher::query()->delete();
            User::query()->delete();
        }

        Artisan::call('db:seed', ['--force' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Database successfully reset and seeded with default university data.',
        ]);
    }
}
