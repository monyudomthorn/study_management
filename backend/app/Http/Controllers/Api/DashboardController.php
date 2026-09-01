<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Practice;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function getStats(): JsonResponse
    {
        $subjects = Subject::all();
        $practices = Practice::all();
        $assignments = Assignment::all();
        $teachers = Teacher::all();

        // Dynamic overall progress calculation
        $subjectAvg = $subjects->count() > 0 ? $subjects->avg('progress') : 0;

        $completedPracticesCount = $practices->where('status', 'Completed')->count();
        $practiceRate = $practices->count() > 0 ? ($completedPracticesCount / $practices->count()) * 100 : 0;

        $completedAssignmentsCount = $assignments->where('status', 'Completed')->count();
        $assignmentRate = $assignments->count() > 0 ? ($completedAssignmentsCount / $assignments->count()) * 100 : 0;

        $overallProgress = ($subjects->count() === 0 && $practices->count() === 0 && $assignments->count() === 0)
            ? 0
            : min(100, max(0, round(($subjectAvg * 0.4) + ($practiceRate * 0.3) + ($assignmentRate * 0.3))));

        $recentPractices = Practice::orderBy('created_at', 'desc')->take(5)->get();
        $upcomingAssignments = Assignment::where('status', '!=', 'Completed')
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'overall_progress' => $overallProgress,
                'metrics' => [
                    'subjects_total' => $subjects->count(),
                    'subjects_completed' => $subjects->where('status', 'Completed')->count(),
                    'subjects_in_progress' => $subjects->where('status', 'In Progress')->count(),
                    'teachers_total' => $teachers->count(),
                    'practices_total' => $practices->count(),
                    'practices_completed' => $completedPracticesCount,
                    'practices_in_progress' => $practices->count() - $completedPracticesCount,
                    'assignments_total' => $assignments->count(),
                    'assignments_completed' => $completedAssignmentsCount,
                    'assignments_pending' => $assignments->where('status', 'Pending')->count(),
                    'assignments_in_progress' => $assignments->where('status', 'In Progress')->count(),
                ],
                'recent_practices' => $recentPractices,
                'upcoming_assignments' => $upcomingAssignments,
            ],
        ]);
    }
}
