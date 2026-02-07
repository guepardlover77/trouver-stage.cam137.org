<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Success response
     */
    protected function success(mixed $data = null, string $message = null, int $code = 200): JsonResponse
    {
        $response = ['success' => true];

        if ($data !== null) {
            $response['data'] = $data;
        }

        if ($message !== null) {
            $response['message'] = $message;
        }

        return response()->json($response, $code);
    }

    /**
     * Error response
     */
    protected function error(string $error, int $code = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $error,
        ], $code);
    }

    /**
     * Paginated response
     */
    protected function paginated(
        array $data,
        int $total,
        int $page,
        int $limit
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'data' => $data,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }
}
