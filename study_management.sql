-- ==========================================================
-- STUDY MANAGEMENT SYSTEM DATABASE SCHEMA & INITIAL DATA
-- Compatible with MySQL 8.0+ and MySQL Workbench
-- ==========================================================

-- 1. Create and Select Database Schema
CREATE DATABASE IF NOT EXISTS `study_management`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `study_management`;

-- 2. Drop existing tables if re-importing
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `practices`;
DROP TABLE IF EXISTS `subjects`;
DROP TABLE IF EXISTS `teachers`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `password_reset_tokens`;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Create Users Table (Student Profile & Authentication)
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL UNIQUE,
    `role` VARCHAR(255) NOT NULL DEFAULT 'Computer Science Student',
    `university` VARCHAR(255) NOT NULL DEFAULT 'SETEC Institute',
    `student_id` VARCHAR(100) NOT NULL DEFAULT 'SET-2026-8899',
    `telegram` VARCHAR(255) NULL,
    `year` VARCHAR(100) NOT NULL DEFAULT 'Year 3, Semester 2',
    `avatar_text` VARCHAR(10) NOT NULL DEFAULT 'ST',
    `password` VARCHAR(255) NULL,
    `reset_code` VARCHAR(20) NULL,
    `reset_code_expires_at` TIMESTAMP NULL,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Password Reset Tokens Table
CREATE TABLE `password_reset_tokens` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create Teachers Table
CREATE TABLE `teachers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `telegram` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create Subjects Table
CREATE TABLE `subjects` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `teacher` VARCHAR(255) NOT NULL,
    `teacher_id` BIGINT UNSIGNED NULL,
    `description` TEXT NULL,
    `progress` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(50) NOT NULL DEFAULT 'In Progress',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_subjects_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create Practices Table
CREATE TABLE `practices` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `subject_id` BIGINT UNSIGNED NULL,
    `description` TEXT NULL,
    `created_date` DATE NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'In Progress',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_practices_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Create Assignments Table
CREATE TABLE `assignments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `subject_id` BIGINT UNSIGNED NULL,
    `description` TEXT NULL,
    `due_date` DATE NULL,
    `priority` VARCHAR(50) NOT NULL DEFAULT 'Medium',
    `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_assignments_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED INITIAL SAMPLE DATA
-- ==========================================================

-- Insert Default User (Password: password123)
INSERT INTO `users` (`id`, `name`, `email`, `role`, `university`, `student_id`, `telegram`, `year`, `avatar_text`, `password`, `created_at`, `updated_at`)
VALUES
(1, 'SX8 Student', 'sx8@setec.edu.kh', 'MIS Student', 'SETEC Institute', 'M2425-0384', '@setec_sx8', 'Year 2, Semester 1', 'SX', '$2y$12$eA1Hq5kUuIqKjY2YF3Gj..Z9bK9s6sDq7V4wZ0b.EomwR2nQe/z5K', NOW(), NOW());

-- Insert Teachers
INSERT INTO `teachers` (`id`, `name`, `subject`, `telegram`, `description`, `created_at`, `updated_at`)
VALUES
(1, 'Mr. Sokha Chan', 'Web Development & API Design', '@sokhachan_setec', 'Senior lecturer specializing in PHP, Laravel, and Modern Web Architecture.', NOW(), NOW()),
(2, 'Dr. Rithy Meng', 'Database Systems & MySQL Workbench', '@rithymeng_doc', 'Database administrator and professor of relational database management systems.', NOW(), NOW()),
(3, 'Ms. Vanna Chea', 'Software Engineering & System Analysis', '@vannachea_se', 'Lead instructor for Software Lifecycle, Agile frameworks, and System Design.', NOW(), NOW()),
(4, 'Mrs. Sreynich Heng', 'Cloud Computing & DevOps', '@sreynich_heng', 'Expert in containerization, cloud deployment, and Linux administration.', NOW(), NOW());

-- Insert Subjects
INSERT INTO `subjects` (`id`, `name`, `code`, `teacher`, `teacher_id`, `description`, `progress`, `status`, `created_at`, `updated_at`)
VALUES
(1, 'Full-Stack Web Development (Laravel & React)', 'CS302', 'Mr. Sokha Chan', 1, 'Building scalable web applications using Laravel RESTful API backend and React frontend.', 85, 'In Progress', NOW(), NOW()),
(2, 'Database Management Systems (MySQL)', 'DB301', 'Dr. Rithy Meng', 2, 'Relational database modeling, ER diagrams in MySQL Workbench, SQL indexing, and transactions.', 90, 'In Progress', NOW(), NOW()),
(3, 'System Analysis and Design', 'SE204', 'Ms. Vanna Chea', 3, 'Requirements engineering, UML diagrams, architectural patterns, and project scheduling.', 70, 'In Progress', NOW(), NOW()),
(4, 'Cloud Computing & DevOps', 'CC401', 'Mrs. Sreynich Heng', 4, 'Containerization with Docker, CI/CD pipelines, and cloud hosting architecture.', 45, 'In Progress', NOW(), NOW());

-- Insert Practices
INSERT INTO `practices` (`id`, `title`, `subject`, `subject_id`, `description`, `created_date`, `status`, `created_at`, `updated_at`)
VALUES
(1, 'Build REST API with Laravel Controllers & Migrations', 'Full-Stack Web Development (Laravel & React)', 1, 'Create CRUD controllers for Teachers, Subjects, Practices, and Assignments with input validation.', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Completed', NOW(), NOW()),
(2, 'Design Schema & Reverse Engineer in MySQL Workbench', 'Database Management Systems (MySQL)', 2, 'Generate ER diagram, configure foreign keys, and run SQL queries in MySQL Workbench.', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Completed', NOW(), NOW()),
(3, 'Connect React Context with Laravel API Endpoints', 'Full-Stack Web Development (Laravel & React)', 1, 'Integrate frontend DataContext and AuthContext with backend JSON endpoints.', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'In Progress', NOW(), NOW()),
(4, 'Write System Requirement Specification (SRS) Document', 'System Analysis and Design', 3, 'Document functional and non-functional requirements with use-case diagrams.', CURDATE(), 'In Progress', NOW(), NOW());

-- Insert Assignments
INSERT INTO `assignments` (`id`, `title`, `subject`, `subject_id`, `description`, `due_date`, `priority`, `status`, `created_at`, `updated_at`)
VALUES
(1, 'Study Management System - Final Project Submission', 'Full-Stack Web Development (Laravel & React)', 1, 'Complete full-stack implementation with PHP Laravel backend, MySQL Workbench database, and React UI.', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'High', 'In Progress', NOW(), NOW()),
(2, 'MySQL Database Optimization & Query Tuning Report', 'Database Management Systems (MySQL)', 2, 'Analyze EXPLAIN query plans, configure composite indexes, and write summary report.', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'High', 'Pending', NOW(), NOW()),
(3, 'Agile Sprint Planning & User Story Mapping', 'System Analysis and Design', 3, 'Create Jira/Trello sprint backlog with acceptance criteria and story point estimation.', DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'Medium', 'Pending', NOW(), NOW()),
(4, 'Dockerize Laravel Backend & React Frontend', 'Cloud Computing & DevOps', 4, 'Write multi-stage Dockerfile and docker-compose.yml for local development and deployment.', DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'Low', 'Pending', NOW(), NOW());
