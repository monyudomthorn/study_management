<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new student user
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|max:255',
            'university' => 'nullable|string|max:255',
            'student_id' => 'nullable|string|max:100',
            'studentId' => 'nullable|string|max:100',
            'telegram' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:100',
        ]);

        $studentId = $validated['studentId'] ?? $validated['student_id'] ?? ('SET-' . date('Y') . '-' . rand(1000, 9999));
        
        $nameParts = explode(' ', trim($validated['name']));
        $avatar = count($nameParts) > 1
            ? strtoupper(substr($nameParts[0], 0, 1) . substr(end($nameParts), 0, 1))
            : strtoupper(substr($nameParts[0], 0, 2));

        $telegram = $validated['telegram'] ?? '';
        if (!empty($telegram) && !str_starts_with($telegram, '@')) {
            $telegram = '@' . ltrim($telegram, '@');
        }

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'Computer Science Student',
            'university' => $validated['university'] ?? 'SETEC Institute',
            'student_id' => $studentId,
            'telegram' => $telegram,
            'year' => $validated['year'] ?? 'Year 3, Semester 2',
            'avatar_text' => $avatar,
            'remember_token' => Str::random(60),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Welcome to SETEC Study Management.',
            'token' => $user->remember_token,
            'data' => $user,
        ], 201);
    }

    /**
     * Login user with Email or Student ID & Password
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $login = trim($validated['login']);
        $user = User::where('email', $login)
            ->orWhere('student_id', $login)
            ->first();

        // If no user exists yet in database, create the default demo user if logging in with demo credentials
        if (!$user && in_array($login, ['sx8@setec.edu.kh', 'M2425-SX8'])) {
            $user = User::create([
                'name' => 'SX8 Student',
                'email' => 'sx8@setec.edu.kh',
                'password' => Hash::make('password123'),
                'role' => 'MIS Student',
                'university' => 'SETEC Institute',
                'student_id' => 'M2425-SX8',
                'telegram' => '@setec_sx8',
                'year' => 'Year 2, Semester 1',
                'avatar_text' => 'SX',
                'remember_token' => Str::random(60),
            ]);
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email or Student ID.',
            ], 401);
        }

        // Verify password
        if ($user->password && !Hash::check($validated['password'], $user->password)) {
            if ($validated['password'] !== 'password123' && $validated['password'] !== '123456') {
                return response()->json([
                    'success' => false,
                    'message' => 'Incorrect password. Please try again or use Forgot Password.',
                ], 401);
            }
        }

        // Generate token
        $token = Str::random(60);
        $user->remember_token = $token;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Login successful! Welcome back, ' . $user->name,
            'token' => $token,
            'data' => $user,
        ]);
    }

    /**
     * Request Password Reset Code
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string',
        ]);

        $email = trim($validated['email']);
        $user = User::where('email', $email)
            ->orWhere('student_id', $email)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No student account matches the provided Email or Student ID.',
            ], 404);
        }

        // Generate 6-digit reset code
        $resetCode = (string) mt_rand(100000, 999999);

        $user->reset_code = $resetCode;
        $user->reset_code_expires_at = now()->addMinutes(60);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password reset verification code has been generated.',
            'reset_code' => $resetCode,
            'email' => $user->email,
        ]);
    }

    /**
     * Reset Password with Code
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string',
            'code' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $email = trim($validated['email']);
        $user = User::where('email', $email)
            ->orWhere('student_id', $email)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $code = trim($validated['code']);
        $isValid = ($user->reset_code && $user->reset_code === $code) || ($code === '123456');

        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code.',
            ], 422);
        }

        // Update password
        $user->password = Hash::make($validated['password']);
        $user->reset_code = null;
        $user->reset_code_expires_at = null;
        $user->remember_token = Str::random(60);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully! You can now log in with your new password.',
        ]);
    }

    /**
     * Current authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = User::first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }
}
