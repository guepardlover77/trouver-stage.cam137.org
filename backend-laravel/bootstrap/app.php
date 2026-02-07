<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\ThrottleRequestsException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->renderable(function (ThrottleRequestsException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Trop de requêtes. Réessayez dans quelques instants.',
                ], 429);
            }
        });

        $exceptions->renderable(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Route non trouvée',
                ], 404);
            }
        });

        $exceptions->renderable(function (MethodNotAllowedHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Méthode HTTP non autorisée',
                ], 405);
            }
        });

        $exceptions->renderable(function (HttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => $e->getMessage() ?: 'Une erreur est survenue',
                ], $e->getStatusCode());
            }
        });

        $exceptions->renderable(function (\Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                $response = [
                    'success' => false,
                    'error' => config('app.debug') ? $e->getMessage() : 'Erreur serveur interne',
                ];

                if (config('app.debug')) {
                    $response['exception'] = get_class($e);
                    $response['trace'] = array_slice($e->getTrace(), 0, 5);
                }

                return response()->json($response, 500);
            }
        });
    })->create();
