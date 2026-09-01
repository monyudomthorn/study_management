<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Gracefully attempt MySQL connection; if credentials or database need setup, fallback to SQLite
        if (config('database.default') === 'mysql') {
            try {
                DB::connection('mysql')->getPdo();
            } catch (\Throwable $e) {
                Log::warning('MySQL connection unavailable, falling back to SQLite: ' . $e->getMessage());
                config(['database.default' => 'sqlite']);
            }
        }
    }
}
