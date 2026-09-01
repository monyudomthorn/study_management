<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Assignment::query()->with('subjectRelation');

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

        if ($request->filled('priority') && $request->priority !== 'All') {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('subject') && $request->subject !== 'All') {
            $query->where('subject', $request->subject);
        }

        $assignments = $query->orderBy('due_date', 'asc')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $assignments,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'subject_id' => 'nullable|exists:subjects,id',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|string|in:High,Medium,Low',
            'status' => 'nullable|string|in:Pending,In Progress,Completed',
        ]);

        if (empty($validated['subject_id'])) {
            $subject = Subject::where('name', $validated['subject'])->first();
            if ($subject) {
                $validated['subject_id'] = $subject->id;
            }
        }

        $validated['due_date'] = $validated['due_date'] ?? now()->toDateString();
        $validated['priority'] = $validated['priority'] ?? 'Medium';
        $validated['status'] = $validated['status'] ?? 'Pending';

        $assignment = Assignment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Assignment created successfully',
            'data' => $assignment->load('subjectRelation'),
        ], 201);
    }

    public function show(Assignment $assignment): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $assignment->load('subjectRelation'),
        ]);
    }

    public function update(Request $request, Assignment $assignment): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'subject' => 'sometimes|required|string|max:255',
            'subject_id' => 'nullable|exists:subjects,id',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|string|in:High,Medium,Low',
            'status' => 'nullable|string|in:Pending,In Progress,Completed',
        ]);

        if (isset($validated['subject']) && empty($validated['subject_id'])) {
            $subject = Subject::where('name', $validated['subject'])->first();
            if ($subject) {
                $validated['subject_id'] = $subject->id;
            }
        }

        $assignment->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Assignment updated successfully',
            'data' => $assignment->load('subjectRelation'),
        ]);
    }

    public function toggleComplete(Assignment $assignment): JsonResponse
    {
        $newStatus = $assignment->status === 'Completed' ? 'Pending' : 'Completed';
        $assignment->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => "Assignment marked as {$newStatus}",
            'data' => $assignment,
        ]);
    }

    public function destroy(Assignment $assignment): JsonResponse
    {
        $assignment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Assignment deleted successfully',
        ]);
    }
}
