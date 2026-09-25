-- ============================================================
-- OMW CRM Database Migration Script
-- Contains all new CRM tables created for the project
-- Database Engine: MySQL / MariaDB
-- ============================================================

-- 1. Table: crm_users (CRM Staff & Super Admin Users)
CREATE TABLE IF NOT EXISTS `crm_users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(100) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `is_admin` TINYINT(1) DEFAULT 0,
  `avatar` VARCHAR(10) DEFAULT NULL,
  `permissions` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_crm_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: leave_requests (Worker Leave Requests & Approvals)
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `worker_name` VARCHAR(255) NOT NULL,
  `leave_type` VARCHAR(100) NOT NULL,
  `start_date` VARCHAR(50) NOT NULL,
  `end_date` VARCHAR(50) NOT NULL,
  `reason` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: attendance_logs (Daily Worker Check-in/Check-out Logs)
CREATE TABLE IF NOT EXISTS `attendance_logs` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `worker_id` VARCHAR(50) DEFAULT NULL,
  `worker_name` VARCHAR(255) NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `check_in` VARCHAR(50) DEFAULT NULL,
  `check_out` VARCHAR(50) DEFAULT NULL,
  `total_hours` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_attendance_worker_date` (`worker_name`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: activity_logs (CRM User Activity Audit Trail)
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `action_type` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: support_tickets (Customer Support Tickets & Live Chat Inquiries)
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` VARCHAR(50) NOT NULL,
  `customer` VARCHAR(255) NOT NULL,
  `contact` VARCHAR(100) DEFAULT NULL,
  `title` TEXT NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `assignedExecutive` VARCHAR(100) DEFAULT NULL,
  `escalationLevel` VARCHAR(50) DEFAULT NULL,
  `resolutionNotes` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Open',
  `priority` VARCHAR(50) DEFAULT 'Medium',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_support_tickets_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
