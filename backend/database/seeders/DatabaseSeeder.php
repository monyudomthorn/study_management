<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Practice;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed User Profile
        $user = User::updateOrCreate(
            ['email' => 'monyudom@setec.edu.kh'],
            [
                'name' => 'Monyudom Thorn',
                'role' => 'MIS Student',
                'university' => 'SETEC Institute',
                'student_id' => 'M2425-0384',
                'telegram' => '@monyudomthorn',
                'year' => 'Year 2, Semester 1',
                'avatar_text' => 'MT',
            ]
        );

        // 2. Seed Teachers
        $teacher1 = Teacher::firstOrCreate(
            ['name' => 'Mr. Sokha Chan'],
            [
                'subject' => 'Web Development & API Design',
                'telegram' => '@sokhachan_setec',
                'description' => 'Senior lecturer specializing in PHP, Laravel, and Modern Web Architecture.',
            ]
        );

        $teacher2 = Teacher::firstOrCreate(
            ['name' => 'Dr. Rithy Meng'],
            [
                'subject' => 'Database Systems & MySQL Workbench',
                'telegram' => '@rithymeng_doc',
                'description' => 'Database administrator and professor of relational database management systems.',
            ]
        );

        $teacher3 = Teacher::firstOrCreate(
            ['name' => 'Ms. Vanna Chea'],
            [
                'subject' => 'Software Engineering & System Analysis',
                'telegram' => '@vannachea_se',
                'description' => 'Lead instructor for Software Lifecycle, Agile frameworks, and System Design.',
            ]
        );

        $teacher4 = Teacher::firstOrCreate(
            ['name' => 'Mrs. Sreynich Heng'],
            [
                'subject' => 'Cloud Computing & DevOps',
                'telegram' => '@sreynich_heng',
                'description' => 'Expert in containerization, cloud deployment, and Linux administration.',
            ]
        );

        // 3. Seed Subjects
        $sub1 = Subject::firstOrCreate(
            ['code' => 'CS302'],
            [
                'name' => 'Full-Stack Web Development (Laravel & React)',
                'teacher' => $teacher1->name,
                'teacher_id' => $teacher1->id,
                'description' => 'Building scalable web applications using Laravel RESTful API backend and React frontend.',
                'progress' => 85,
                'status' => 'In Progress',
            ]
        );

        $sub2 = Subject::firstOrCreate(
            ['code' => 'DB301'],
            [
                'name' => 'Database Management Systems (MySQL)',
                'teacher' => $teacher2->name,
                'teacher_id' => $teacher2->id,
                'description' => 'Relational database modeling, ER diagrams in MySQL Workbench, SQL indexing, and transactions.',
                'progress' => 90,
                'status' => 'In Progress',
            ]
        );

        $sub3 = Subject::firstOrCreate(
            ['code' => 'SE204'],
            [
                'name' => 'System Analysis and Design',
                'teacher' => $teacher3->name,
                'teacher_id' => $teacher3->id,
                'description' => 'Requirements engineering, UML diagrams, architectural patterns, and project scheduling.',
                'progress' => 70,
                'status' => 'In Progress',
            ]
        );

        $sub4 = Subject::firstOrCreate(
            ['code' => 'CC401'],
            [
                'name' => 'Cloud Computing & DevOps',
                'teacher' => $teacher4->name,
                'teacher_id' => $teacher4->id,
                'description' => 'Containerization with Docker, CI/CD pipelines, and cloud hosting architecture.',
                'progress' => 45,
                'status' => 'In Progress',
            ]
        );

        // 4. Seed Practices
        Practice::firstOrCreate(
            ['title' => 'Build REST API with Laravel Controllers & Migrations'],
            [
                'subject' => $sub1->name,
                'subject_id' => $sub1->id,
                'description' => 'Create CRUD controllers for Teachers, Subjects, Practices, and Assignments with input validation.',
                'created_date' => now()->subDays(5)->toDateString(),
                'status' => 'Completed',
            ]
        );

        Practice::firstOrCreate(
            ['title' => 'Design Schema & Reverse Engineer in MySQL Workbench'],
            [
                'subject' => $sub2->name,
                'subject_id' => $sub2->id,
                'description' => 'Generate ER diagram, configure foreign keys, and run SQL queries in MySQL Workbench.',
                'created_date' => now()->subDays(3)->toDateString(),
                'status' => 'Completed',
            ]
        );

        Practice::firstOrCreate(
            ['title' => 'Connect React Context with Laravel API Endpoints'],
            [
                'subject' => $sub1->name,
                'subject_id' => $sub1->id,
                'description' => 'Integrate frontend DataContext and AuthContext with backend JSON endpoints.',
                'created_date' => now()->subDays(1)->toDateString(),
                'status' => 'In Progress',
            ]
        );

        Practice::firstOrCreate(
            ['title' => 'Write System Requirement Specification (SRS) Document'],
            [
                'subject' => $sub3->name,
                'subject_id' => $sub3->id,
                'description' => 'Document functional and non-functional requirements with use-case diagrams.',
                'created_date' => now()->toDateString(),
                'status' => 'In Progress',
            ]
        );

        // 5. Seed Assignments
        Assignment::firstOrCreate(
            ['title' => 'Study Management System - Final Project Submission'],
            [
                'subject' => $sub1->name,
                'subject_id' => $sub1->id,
                'description' => 'Complete full-stack implementation with PHP Laravel backend, MySQL Workbench database, and React UI.',
                'due_date' => now()->addDays(7)->toDateString(),
                'priority' => 'High',
                'status' => 'In Progress',
            ]
        );

        Assignment::firstOrCreate(
            ['title' => 'MySQL Database Optimization & Query Tuning Report'],
            [
                'subject' => $sub2->name,
                'subject_id' => $sub2->id,
                'description' => 'Analyze EXPLAIN query plans, configure composite indexes, and write summary report.',
                'due_date' => now()->addDays(4)->toDateString(),
                'priority' => 'High',
                'status' => 'Pending',
            ]
        );

        Assignment::firstOrCreate(
            ['title' => 'Agile Sprint Planning & User Story Mapping'],
            [
                'subject' => $sub3->name,
                'subject_id' => $sub3->id,
                'description' => 'Create Jira/Trello sprint backlog with acceptance criteria and story point estimation.',
                'due_date' => now()->addDays(12)->toDateString(),
                'priority' => 'Medium',
                'status' => 'Pending',
            ]
        );

        Assignment::firstOrCreate(
            ['title' => 'Dockerize Laravel Backend & React Frontend'],
            [
                'subject' => $sub4->name,
                'subject_id' => $sub4->id,
                'description' => 'Write multi-stage Dockerfile and docker-compose.yml for local development and deployment.',
                'due_date' => now()->addDays(18)->toDateString(),
                'priority' => 'Low',
                'status' => 'Pending',
            ]
        );
    }
}
