<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Practice;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PracticeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Practice::query()->with('subjectRelation');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->filled('subject') && $request->subject !== 'All') {
            $query->where('subject', $request->subject);
        }

        $practices = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $practices,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'subject_id' => 'nullable|exists:subjects,id',
            'description' => 'nullable|string',
            'created_date' => 'nullable|date',
            'status' => 'nullable|string|in:In Progress,Completed',
        ]);

        if (empty($validated['subject_id'])) {
            $subject = Subject::where('name', $validated['subject'])->first();
            if ($subject) {
                $validated['subject_id'] = $subject->id;
            }
        }

        $validated['created_date'] = $validated['created_date'] ?? now()->toDateString();
        $validated['status'] = $validated['status'] ?? 'In Progress';

        $practice = Practice::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Practice task created successfully',
            'data' => $practice->load('subjectRelation'),
        ], 201);
    }

    public function show(Practice $practice): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $practice->load('subjectRelation'),
        ]);
    }

    public function update(Request $request, Practice $practice): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'subject' => 'sometimes|required|string|max:255',
            'subject_id' => 'nullable|exists:subjects,id',
            'description' => 'nullable|string',
            'created_date' => 'nullable|date',
            'status' => 'nullable|string|in:In Progress,Completed',
        ]);

        if (isset($validated['subject']) && empty($validated['subject_id'])) {
            $subject = Subject::where('name', $validated['subject'])->first();
            if ($subject) {
                $validated['subject_id'] = $subject->id;
            }
        }

        $practice->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Practice task updated successfully',
            'data' => $practice->load('subjectRelation'),
        ]);
    }

    public function toggleComplete(Practice $practice): JsonResponse
    {
        $newStatus = $practice->status === 'Completed' ? 'In Progress' : 'Completed';
        $practice->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => "Practice marked as {$newStatus}",
            'data' => $practice,
        ]);
    }

    public function destroy(Practice $practice): JsonResponse
    {
        $practice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Practice task deleted successfully',
        ]);
    }
}
