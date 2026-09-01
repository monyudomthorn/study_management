<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Practice;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Demo Student User (SX8 Student)
        $user = User::updateOrCreate(
            ['email' => 'sx8@setec.edu.kh'],
            [
                'name' => 'SX8 Student',
                'role' => 'MIS Student',
                'university' => 'SETEC Institute',
                'student_id' => 'M2425-0384',
                'telegram' => '@setec_sx8',
                'year' => 'Year 2, Semester 1',
                'avatar_text' => 'SX',
                'password' => Hash::make('password123'),
                'remember_token' => Str::random(60),
            ]
        );

        // 2. Teachers
        $teacher1 = Teacher::updateOrCreate(
            ['name' => 'Mr. Sokha Chan'],
            [
                'subject' => 'Web Development & API Design',
                'telegram' => '@sokhachan_setec',
                'description' => 'Senior lecturer specializing in PHP, Laravel, and Modern Web Architecture.',
            ]
        );

        $teacher2 = Teacher::updateOrCreate(
            ['name' => 'Dr. Rithy Meng'],
            [
                'subject' => 'Database Systems & MySQL Workbench',
                'telegram' => '@rithymeng_doc',
                'description' => 'Database administrator and professor of relational database management systems.',
            ]
        );

        $teacher3 = Teacher::updateOrCreate(
            ['name' => 'Ms. Vanna Chea'],
            [
                'subject' => 'Software Engineering & System Analysis',
                'telegram' => '@vannachea_se',
                'description' => 'Lead instructor for Software Lifecycle, Agile frameworks, and System Design.',
            ]
        );

        $teacher4 = Teacher::updateOrCreate(
            ['name' => 'Mrs. Sreynich Heng'],
            [
                'subject' => 'Cloud Computing & DevOps',
                'telegram' => '@sreynich_heng',
                'description' => 'Expert in containerization, cloud deployment, and Linux administration.',
            ]
        );

        // 3. Subjects
        $sub1 = Subject::updateOrCreate(
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

        $sub2 = Subject::updateOrCreate(
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

        $sub3 = Subject::updateOrCreate(
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

        $sub4 = Subject::updateOrCreate(
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

        // 4. Practices
        Practice::updateOrCreate(
            ['title' => 'Build REST API with Laravel Controllers & Migrations'],
            [
                'subject' => $sub1->name,
                'subject_id' => $sub1->id,
                'description' => 'Create CRUD controllers for Teachers, Subjects, Practices, and Assignments with input validation.',
                'created_date' => now()->subDays(5)->format('Y-m-d'),
                'status' => 'Completed',
            ]
        );

        Practice::updateOrCreate(
            ['title' => 'Design Schema & Reverse Engineer in MySQL Workbench'],
            [
                'subject' => $sub2->name,
                'subject_id' => $sub2->id,
                'description' => 'Generate ER diagram, configure foreign keys, and run SQL queries in MySQL Workbench.',
                'created_date' => now()->subDays(3)->format('Y-m-d'),
                'status' => 'Completed',
            ]
        );

        Practice::updateOrCreate(
            ['title' => 'Connect React Context with Laravel API Endpoints'],
            [
                'subject' => $sub1->name,
                'subject_id' => $sub1->id,
                'description' => 'Integrate frontend DataContext and AuthContext with backend JSON endpoints.',
                'created_date' => now()->subDays(1)->format('Y-m-d'),
                'status' => 'In Progress',
            ]
        );

        Practice::updateOrCreate(
            ['title' => 'Write System Requirement Specification (SRS) Document'],
            [
                'subject' => $sub3->name,
                'subject_id' => $sub3->id,
                'description' => 'Document functional and non-functional requirements with use-case diagrams.',
                'created_date' => now()->format('Y-m-d'),
                'status' => 'In Progress',
            ]
        );

        // 5. Assignments
        Assignment::updateOrCreate(
            ['title' => 'Study Management System - Final Project Submission'],
            [
                'subject' => $sub1->name,
                'subject_id' => $sub1->id,
                'description' => 'Complete full-stack implementation with PHP Laravel backend, MySQL Workbench database, and React UI.',
                'due_date' => now()->addDays(7)->format('Y-m-d'),
                'priority' => 'High',
                'status' => 'In Progress',
            ]
        );

        Assignment::updateOrCreate(
            ['title' => 'MySQL Database Optimization & Query Tuning Report'],
            [
                'subject' => $sub2->name,
                'subject_id' => $sub2->id,
                'description' => 'Analyze EXPLAIN query plans, configure composite indexes, and write summary report.',
                'due_date' => now()->addDays(4)->format('Y-m-d'),
                'priority' => 'High',
                'status' => 'Pending',
            ]
        );

        Assignment::updateOrCreate(
            ['title' => 'Agile Sprint Planning & User Story Mapping'],
            [
                'subject' => $sub3->name,
                'subject_id' => $sub3->id,
                'description' => 'Create Jira/Trello sprint backlog with acceptance criteria and story point estimation.',
                'due_date' => now()->addDays(12)->format('Y-m-d'),
                'priority' => 'Medium',
                'status' => 'Pending',
            ]
        );

        Assignment::updateOrCreate(
            ['title' => 'Dockerize Laravel Backend & React Frontend'],
            [
                'subject' => $sub4->name,
                'subject_id' => $sub4->id,
                'description' => 'Write multi-stage Dockerfile and docker-compose.yml for local development and deployment.',
                'due_date' => now()->addDays(18)->format('Y-m-d'),
                'priority' => 'Low',
                'status' => 'Pending',
            ]
        );
    }
}
