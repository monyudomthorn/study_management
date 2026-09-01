<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Subject::query()->with('teacherRelation');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('teacher', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('teacher') && $request->teacher !== 'All') {
            $query->where('teacher', $request->teacher);
        }

        $subjects = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $subjects,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100',
            'teacher' => 'required|string|max:255',
            'teacher_id' => 'nullable|exists:teachers,id',
            'description' => 'nullable|string',
            'progress' => 'nullable|integer|min:0|max:100',
            'status' => 'nullable|string|in:In Progress,Completed,Upcoming',
        ]);

        if (empty($validated['teacher_id'])) {
            $teacher = Teacher::where('name', $validated['teacher'])->first();
            if ($teacher) {
                $validated['teacher_id'] = $teacher->id;
            }
        }

        $validated['progress'] = $validated['progress'] ?? 0;
        $validated['status'] = $validated['status'] ?? 'In Progress';

        $subject = Subject::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subject created successfully',
            'data' => $subject->load('teacherRelation'),
        ], 201);
    }

    public function show(Subject $subject): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $subject->load(['teacherRelation', 'practices', 'assignments']),
        ]);
    }

    public function update(Request $request, Subject $subject): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:100',
            'teacher' => 'sometimes|required|string|max:255',
            'teacher_id' => 'nullable|exists:teachers,id',
            'description' => 'nullable|string',
            'progress' => 'nullable|integer|min:0|max:100',
            'status' => 'nullable|string|in:In Progress,Completed,Upcoming',
        ]);

        if (isset($validated['teacher']) && empty($validated['teacher_id'])) {
            $teacher = Teacher::where('name', $validated['teacher'])->first();
            if ($teacher) {
                $validated['teacher_id'] = $teacher->id;
            }
        }

        $subject->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subject updated successfully',
            'data' => $subject->load('teacherRelation'),
        ]);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $subject->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subject deleted successfully',
        ]);
    }
}
