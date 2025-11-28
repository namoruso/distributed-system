<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles  Roles permitidos (admin, user)
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $userRole = $request->attributes->get('user_role');

        if (!$userRole) {
            return response()->json([
                'success' => false,
                'message' => 'User role not found in token'
            ], 403);
        }

        if (!in_array($userRole, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this resource',
                'required_roles' => $roles,
                'your_role' => $userRole
            ], 403);
        }

        return $next($request);
    }
}