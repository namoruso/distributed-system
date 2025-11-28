<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Token not provided'
            ], 401);
        }

        try {
            $secret = env('JWT_SECRET');
            $algorithm = env('JWT_ALGO', 'HS256');
            
            $decoded = JWT::decode($token, new Key($secret, $algorithm));

            if (!isset($decoded->sub)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token structure'
                ], 401);
            }

            $request->attributes->add([
                'user_id' => $decoded->sub,
                'user_email' => $decoded->correo ?? null,
                'user_role' => $decoded->rol ?? 'user', 
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token is invalid or expired',
                'error' => $e->getMessage()
            ], 401);
        }

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization');
        
        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return null;
        }

        return substr($header, 7);
    }
}