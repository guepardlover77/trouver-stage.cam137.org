<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Verify admin code
     * POST /api/v1/auth/verify
     */
    public function verify(Request $request): JsonResponse
    {
        $code = $request->input('code');

        if (!$code) {
            return $this->error('Code requis', 400);
        }

        $validCode = config('app.admin_code');

        if ($validCode && hash_equals($validCode, $code)) {
            return $this->success(null, 'Code valide');
        }

        return $this->error('Code invalide', 401);
    }
}
