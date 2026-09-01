<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    public function getProfile(): JsonResponse
    {
        $user = User::first();

        if (!$user) {
            $user = User::create([
                'name' => 'Monyudom Thorn',
                'role' => 'Computer Science Student',
                'university' => 'SETEC Institute',
                'student_id' => 'SET-2026-8899',
                'telegram' => '@monyudomthorn',
                'year' => 'Year 3, Semester 2',
                'avatar_text' => 'MT',
                'email' => 'monyudom@setec.edu.kh',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'university' => 'nullable|string|max:255',
            'student_id' => 'nullable|string|max:100',
            'studentId' => 'nullable|string|max:100',
            'telegram' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:100',
            'avatar_text' => 'nullable|string|max:10',
            'avatarText' => 'nullable|string|max:10',
            'email' => 'nullable|email|max:255',
        ]);

        if (isset($validated['studentId'])) {
            $validated['student_id'] = $validated['studentId'];
            unset($validated['studentId']);
        }

        if (isset($validated['avatarText'])) {
            $validated['avatar_text'] = $validated['avatarText'];
            unset($validated['avatarText']);
        }

        if (empty($validated['avatar_text']) && !empty($validated['name'])) {
            $parts = explode(' ', trim($validated['name']));
            $first = $parts[0][0] ?? '';
            $last = count($parts) > 1 ? end($parts)[0] : '';
            $validated['avatar_text'] = strtoupper($first . $last);
        }

        if (!empty($validated['telegram']) && !str_starts_with($validated['telegram'], '@')) {
            $validated['telegram'] = '@' . ltrim($validated['telegram'], '@');
        }

        $user = User::first();
        if ($user) {
            $user->update($validated);
        } else {
            $user = User::create($validated);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user,
        ]);
    }
}
