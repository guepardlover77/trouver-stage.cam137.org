<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    use ApiResponse;

    /**
     * Health check endpoint
     * GET /api/v1/health
     */
    public function __invoke(): JsonResponse
    {
        try {
            // Check database connection
            DB::connection()->getPdo();

            return $this->success([
                'status' => 'healthy',
                'database' => 'connected',
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return $this->error('Database connection failed', 503);
        }
    }
}
