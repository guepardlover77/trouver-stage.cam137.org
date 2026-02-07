<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAuthentication
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get admin code from various sources (same as Node.js backend)
        $adminCode = $request->header('X-Admin-Code')
            ?? $request->input('adminCode')
            ?? $request->query('adminCode');

        if (!$adminCode) {
            return response()->json([
                'success' => false,
                'error' => 'Code administrateur requis',
            ], 401);
        }

        $validCode = config('app.admin_code');

        if (!$validCode || !hash_equals($validCode, $adminCode)) {
            return response()->json([
                'success' => false,
                'error' => 'Code administrateur invalide',
            ], 403);
        }

        // Mark request as admin authenticated
        $request->attributes->set('isAdmin', true);

        return $next($request);
    }
}
