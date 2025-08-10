-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for laravel12react
DROP DATABASE IF EXISTS `laravel12react`;
CREATE DATABASE IF NOT EXISTS `laravel12react` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `laravel12react`;

-- Dumping structure for table laravel12react.asset_assignments
DROP TABLE IF EXISTS `asset_assignments`;
CREATE TABLE IF NOT EXISTS `asset_assignments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `asset_id` bigint unsigned NOT NULL,
  `unit_or_department_id` bigint unsigned NOT NULL,
  `assigned_to` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_by` bigint unsigned NOT NULL,
  `date_assigned` date NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `asset_assignments_asset_id_foreign` (`asset_id`),
  KEY `asset_assignments_unit_or_department_id_foreign` (`unit_or_department_id`),
  KEY `asset_assignments_assigned_by_foreign` (`assigned_by`),
  CONSTRAINT `asset_assignments_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `inventory_lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_assignments_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_assignments_unit_or_department_id_foreign` FOREIGN KEY (`unit_or_department_id`) REFERENCES `unit_or_departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.asset_assignments: ~1 rows (approximately)
INSERT INTO `asset_assignments` (`id`, `asset_id`, `unit_or_department_id`, `assigned_to`, `assigned_by`, `date_assigned`, `remarks`, `created_at`, `updated_at`) VALUES
	(1, 1, 2, 'ID Officer', 4, '2024-08-11', NULL, '2025-08-10 17:05:13', NULL);

-- Dumping structure for table laravel12react.asset_models
DROP TABLE IF EXISTS `asset_models`;
CREATE TABLE IF NOT EXISTS `asset_models` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `brand` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` text COLLATE utf8mb4_unicode_ci,
  `category_id` bigint unsigned DEFAULT NULL,
  `status` enum('active','is_archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `asset_models_category_id_foreign` (`category_id`),
  CONSTRAINT `asset_models_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.asset_models: ~2 rows (approximately)
INSERT INTO `asset_models` (`id`, `brand`, `model`, `category_id`, `status`, `created_at`, `updated_at`) VALUES
	(2, 'Lifetime Products', '2980', 1, 'active', '2025-07-25 08:03:28', '2025-07-25 08:03:28'),
	(3, 'Acer', 'KA242Y', 2, 'active', '2025-07-25 10:04:54', '2025-07-25 10:04:54');

-- Dumping structure for table laravel12react.buildings
DROP TABLE IF EXISTS `buildings`;
CREATE TABLE IF NOT EXISTS `buildings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.buildings: ~2 rows (approximately)
INSERT INTO `buildings` (`id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Main Building', 'AUF-MB', 'Main Administration Building used for central operations and storage.', '2025-07-25 07:59:16', '2025-07-25 07:59:16'),
	(2, 'Sports & Cultural Center', 'AUF-SCC', 'Main venue for events and athletics', '2025-07-25 08:45:59', '2025-07-25 08:45:59');

-- Dumping structure for table laravel12react.building_rooms
DROP TABLE IF EXISTS `building_rooms`;
CREATE TABLE IF NOT EXISTS `building_rooms` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `building_id` bigint unsigned NOT NULL,
  `room` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `building_rooms_building_id_foreign` (`building_id`),
  CONSTRAINT `building_rooms_building_id_foreign` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.building_rooms: ~2 rows (approximately)
INSERT INTO `building_rooms` (`id`, `building_id`, `room`, `description`, `created_at`, `updated_at`) VALUES
	(1, 1, 'Room 204', 'Office of Property Custodian', '2025-07-25 07:57:22', '2025-07-25 07:57:22'),
	(2, 2, 'Room 107', 'Lecture and activity room inside SCC', '2025-07-25 08:49:43', '2025-07-25 08:49:43');

-- Dumping structure for table laravel12react.cache
DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.cache: ~0 rows (approximately)

-- Dumping structure for table laravel12react.cache_locks
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.cache_locks: ~0 rows (approximately)

-- Dumping structure for table laravel12react.categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.categories: ~2 rows (approximately)
INSERT INTO `categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Furniture', 'Includes office tables, chairs, and related items.', '2025-07-25 08:02:10', '2025-07-25 08:02:10'),
	(2, 'IT Equipment', 'Includes all types of information technology-related equipment and devices.', '2025-07-25 10:02:48', '2025-07-25 10:02:48');

-- Dumping structure for table laravel12react.email_verification_codes
DROP TABLE IF EXISTS `email_verification_codes`;
CREATE TABLE IF NOT EXISTS `email_verification_codes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `code_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `max_attempts` tinyint unsigned NOT NULL DEFAULT '5',
  `attempts` tinyint unsigned NOT NULL DEFAULT '0',
  `consumed_at` timestamp NULL DEFAULT NULL,
  `sent_to_email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evc_user_state_idx` (`user_id`,`consumed_at`,`expires_at`),
  KEY `evc_expires_idx` (`expires_at`),
  CONSTRAINT `email_verification_codes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.email_verification_codes: ~0 rows (approximately)

-- Dumping structure for table laravel12react.failed_jobs
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.failed_jobs: ~0 rows (approximately)

-- Dumping structure for table laravel12react.inventory_lists
DROP TABLE IF EXISTS `inventory_lists`;
CREATE TABLE IF NOT EXISTS `inventory_lists` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `memorandum_no` int NOT NULL,
  `asset_model_id` bigint unsigned NOT NULL,
  `asset_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'archived',
  `unit_or_department_id` bigint unsigned DEFAULT NULL,
  `building_id` bigint unsigned DEFAULT NULL,
  `building_room_id` bigint unsigned DEFAULT NULL,
  `serial_no` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `date_purchased` date DEFAULT NULL,
  `asset_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `transfer_status` enum('not_transferred','transferred','pending') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_lists_asset_model_id_foreign` (`asset_model_id`),
  KEY `inventory_lists_unit_or_department_id_foreign` (`unit_or_department_id`),
  KEY `inventory_lists_building_id_foreign` (`building_id`),
  KEY `inventory_lists_building_room_id_foreign` (`building_room_id`),
  CONSTRAINT `inventory_lists_asset_model_id_foreign` FOREIGN KEY (`asset_model_id`) REFERENCES `asset_models` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_lists_building_id_foreign` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_lists_building_room_id_foreign` FOREIGN KEY (`building_room_id`) REFERENCES `building_rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_lists_unit_or_department_id_foreign` FOREIGN KEY (`unit_or_department_id`) REFERENCES `unit_or_departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.inventory_lists: ~2 rows (approximately)
INSERT INTO `inventory_lists` (`id`, `memorandum_no`, `asset_model_id`, `asset_name`, `description`, `status`, `unit_or_department_id`, `building_id`, `building_room_id`, `serial_no`, `supplier`, `unit_cost`, `date_purchased`, `asset_type`, `quantity`, `transfer_status`, `created_at`, `updated_at`) VALUES
	(1, 1, 3, 'Monitor', NULL, 'active', 1, 1, 1, 'CN0G1234567890ABCDEF', 'Gilmore Computer Center', 8360.00, '2025-07-26', 'IT Equipment', 3, 'not_transferred', '2025-07-29 01:01:49', '2025-07-29 01:11:47'),
	(2, 2, 2, 'Table', NULL, 'active', 2, 2, 2, 'SD124EQ', 'Ace Hardware', 8763.00, '2025-08-01', 'Furniture', 10, 'not_transferred', '2025-07-29 01:28:59', '2025-07-30 02:34:08');

-- Dumping structure for table laravel12react.inventory_schedulings
DROP TABLE IF EXISTS `inventory_schedulings`;
CREATE TABLE IF NOT EXISTS `inventory_schedulings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `building_id` bigint unsigned DEFAULT NULL,
  `building_room_id` bigint unsigned DEFAULT NULL,
  `unit_or_department_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `designated_employee` bigint unsigned DEFAULT NULL,
  `assigned_by` bigint unsigned DEFAULT NULL,
  `inventory_schedule` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actual_date_of_inventory` date DEFAULT NULL,
  `checked_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `received_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduling_status` enum('Completed','Pending','Overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_schedulings_building_id_foreign` (`building_id`),
  KEY `inventory_schedulings_building_room_id_foreign` (`building_room_id`),
  KEY `inventory_schedulings_unit_or_department_id_foreign` (`unit_or_department_id`),
  KEY `inventory_schedulings_user_id_foreign` (`user_id`),
  KEY `inventory_schedulings_designated_employee_foreign` (`designated_employee`),
  KEY `inventory_schedulings_assigned_by_foreign` (`assigned_by`),
  CONSTRAINT `inventory_schedulings_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_schedulings_building_id_foreign` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_schedulings_building_room_id_foreign` FOREIGN KEY (`building_room_id`) REFERENCES `building_rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_schedulings_designated_employee_foreign` FOREIGN KEY (`designated_employee`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_schedulings_unit_or_department_id_foreign` FOREIGN KEY (`unit_or_department_id`) REFERENCES `unit_or_departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `inventory_schedulings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.inventory_schedulings: ~0 rows (approximately)
INSERT INTO `inventory_schedulings` (`id`, `building_id`, `building_room_id`, `unit_or_department_id`, `user_id`, `designated_employee`, `assigned_by`, `inventory_schedule`, `actual_date_of_inventory`, `checked_by`, `verified_by`, `received_by`, `scheduling_status`, `description`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 1, NULL, 1, 1, '2025-07', NULL, NULL, NULL, NULL, 'Pending', NULL, '2025-08-09 04:21:41', '2025-08-09 04:21:41');

-- Dumping structure for table laravel12react.jobs
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.jobs: ~0 rows (approximately)

-- Dumping structure for table laravel12react.job_batches
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.job_batches: ~0 rows (approximately)

-- Dumping structure for table laravel12react.migrations
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.migrations: ~16 rows (approximately)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(11, '0001_01_01_000000_create_users_table', 1),
	(12, '0001_01_01_000001_create_cache_table', 1),
	(13, '0001_01_01_000002_create_jobs_table', 1),
	(17, '2025_07_07_055435_create_categories_table', 2),
	(18, '2025_07_07_080844_create_unit_or_departments_table', 3),
	(19, '2025_07_07_084717_create_buildings_table', 4),
	(20, '2025_07_07_085405_create_building_rooms_table', 5),
	(21, '2025_07_07_052815_create_asset_models_table', 6),
	(26, '2025_07_02_035357_create_inventory_lists_table', 7),
	(32, '2025_07_31_071543_create_inventory_schedulings_table', 8),
	(33, '2025_08_02_111125_create_transfers_table', 8),
	(34, '2025_08_02_114335_create_transfer_asset_table', 8),
	(35, '2025_08_08_184149_add_deleted_at_to_transfers_table', 8),
	(36, '2025_08_09_133953_create_roles_table', 9),
	(37, '2025_08_10_040156_create_email_verification_codes_table', 9),
	(52, '2025_08_10_094145_create_asset_assignments_table', 10),
	(59, '2025_08_10_114014_create_turnover_disposals_table', 11),
	(60, '2025_08_10_164344_create_turnover_disposal_assets_table', 11);

-- Dumping structure for table laravel12react.password_reset_tokens
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.password_reset_tokens: ~0 rows (approximately)

-- Dumping structure for table laravel12react.roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role` enum('PMO Staff','PMO Head','Vice President for Administration') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PMO Staff',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.roles: ~0 rows (approximately)

-- Dumping structure for table laravel12react.sessions
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.sessions: ~2 rows (approximately)
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
	('fq08pDvd0NHvKI4KRrVTgeQ8Sv3OIJF613S30oJk', 4, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiU2FmVk9oY3Q3ekhWYzhVaFhHYzJKU2xoNDU1bUlpZDdFZGdXUmRxMSI7czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6NDtzOjk6Il9wcmV2aW91cyI7YToxOntzOjM6InVybCI7czozOToiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3R1cm5vdmVyLWRpc3Bvc2FsIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754857362);

-- Dumping structure for table laravel12react.transfers
DROP TABLE IF EXISTS `transfers`;
CREATE TABLE IF NOT EXISTS `transfers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `current_building_room` bigint unsigned NOT NULL,
  `current_organization` bigint unsigned NOT NULL,
  `receiving_building_room` bigint unsigned NOT NULL,
  `receiving_organization` bigint unsigned NOT NULL,
  `designated_employee` bigint unsigned NOT NULL,
  `assigned_by` bigint unsigned NOT NULL,
  `scheduled_date` date NOT NULL,
  `actual_transfer_date` date DEFAULT NULL,
  `received_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('upcoming','in_progress','overdue','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'upcoming',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transfers_current_building_room_foreign` (`current_building_room`),
  KEY `transfers_current_organization_foreign` (`current_organization`),
  KEY `transfers_receiving_building_room_foreign` (`receiving_building_room`),
  KEY `transfers_receiving_organization_foreign` (`receiving_organization`),
  KEY `transfers_designated_employee_foreign` (`designated_employee`),
  KEY `transfers_assigned_by_foreign` (`assigned_by`),
  CONSTRAINT `transfers_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfers_current_building_room_foreign` FOREIGN KEY (`current_building_room`) REFERENCES `building_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfers_current_organization_foreign` FOREIGN KEY (`current_organization`) REFERENCES `unit_or_departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfers_designated_employee_foreign` FOREIGN KEY (`designated_employee`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfers_receiving_building_room_foreign` FOREIGN KEY (`receiving_building_room`) REFERENCES `building_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfers_receiving_organization_foreign` FOREIGN KEY (`receiving_organization`) REFERENCES `unit_or_departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.transfers: ~2 rows (approximately)
INSERT INTO `transfers` (`id`, `current_building_room`, `current_organization`, `receiving_building_room`, `receiving_organization`, `designated_employee`, `assigned_by`, `scheduled_date`, `actual_transfer_date`, `received_by`, `status`, `remarks`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 1, 1, 2, 2, 2, 3, '2025-08-20', '2025-08-18', 'Raemart', 'in_progress', 'testing', '2025-08-09 04:33:28', '2025-08-09 04:33:28', NULL),
	(2, 2, 2, 1, 2, 1, 3, '2025-08-09', NULL, NULL, 'upcoming', NULL, '2025-08-09 05:09:30', '2025-08-09 05:09:30', NULL);

-- Dumping structure for table laravel12react.transfer_assets
DROP TABLE IF EXISTS `transfer_assets`;
CREATE TABLE IF NOT EXISTS `transfer_assets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `transfer_id` bigint unsigned NOT NULL,
  `asset_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transfer_assets_transfer_id_foreign` (`transfer_id`),
  KEY `transfer_assets_asset_id_foreign` (`asset_id`),
  CONSTRAINT `transfer_assets_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `inventory_lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transfer_assets_transfer_id_foreign` FOREIGN KEY (`transfer_id`) REFERENCES `transfers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.transfer_assets: ~2 rows (approximately)
INSERT INTO `transfer_assets` (`id`, `transfer_id`, `asset_id`, `created_at`, `updated_at`) VALUES
	(1, 1, 2, '2025-08-09 04:33:28', '2025-08-09 04:33:28'),
	(5, 2, 1, '2025-08-09 08:45:25', '2025-08-09 08:45:25');

-- Dumping structure for table laravel12react.turnover_disposals
DROP TABLE IF EXISTS `turnover_disposals`;
CREATE TABLE IF NOT EXISTS `turnover_disposals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `issuing_office_id` bigint unsigned NOT NULL,
  `type` enum('turnover','disposal') COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiving_office_id` bigint unsigned NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `personnel_in_charge_id` bigint unsigned NOT NULL,
  `document_date` date NOT NULL,
  `status` enum('pending_review','approved','rejected','cancelled','completed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `turnover_disposals_issuing_office_id_foreign` (`issuing_office_id`),
  KEY `turnover_disposals_receiving_office_id_foreign` (`receiving_office_id`),
  KEY `turnover_disposals_personnel_in_charge_id_foreign` (`personnel_in_charge_id`),
  CONSTRAINT `turnover_disposals_issuing_office_id_foreign` FOREIGN KEY (`issuing_office_id`) REFERENCES `unit_or_departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `turnover_disposals_personnel_in_charge_id_foreign` FOREIGN KEY (`personnel_in_charge_id`) REFERENCES `asset_assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `turnover_disposals_receiving_office_id_foreign` FOREIGN KEY (`receiving_office_id`) REFERENCES `unit_or_departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.turnover_disposals: ~1 rows (approximately)
INSERT INTO `turnover_disposals` (`id`, `issuing_office_id`, `type`, `receiving_office_id`, `description`, `personnel_in_charge_id`, `document_date`, `status`, `remarks`, `created_at`, `updated_at`) VALUES
	(1, 1, 'turnover', 2, NULL, 1, '2025-08-10', 'pending_review', NULL, '2025-08-10 20:08:03', NULL);

-- Dumping structure for table laravel12react.turnover_disposal_assets
DROP TABLE IF EXISTS `turnover_disposal_assets`;
CREATE TABLE IF NOT EXISTS `turnover_disposal_assets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `turnover_disposal_id` bigint unsigned NOT NULL,
  `asset_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `turnover_disposal_assets_turnover_disposal_id_foreign` (`turnover_disposal_id`),
  KEY `turnover_disposal_assets_asset_id_foreign` (`asset_id`),
  CONSTRAINT `turnover_disposal_assets_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `inventory_lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `turnover_disposal_assets_turnover_disposal_id_foreign` FOREIGN KEY (`turnover_disposal_id`) REFERENCES `turnover_disposals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.turnover_disposal_assets: ~1 rows (approximately)
INSERT INTO `turnover_disposal_assets` (`id`, `turnover_disposal_id`, `asset_id`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, '2025-08-10 20:25:22', NULL);

-- Dumping structure for table laravel12react.unit_or_departments
DROP TABLE IF EXISTS `unit_or_departments`;
CREATE TABLE IF NOT EXISTS `unit_or_departments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.unit_or_departments: ~2 rows (approximately)
INSERT INTO `unit_or_departments` (`id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Property and Supply Office', 'PSO', 'Responsible for asset management and furniture inventory including tables and chairs.', '2025-07-25 09:32:07', '2025-07-25 09:32:07'),
	(2, 'Management Information Systems and Services', 'MISS', 'Handles all IT-related operations and support', '2025-07-25 09:37:26', '2025-07-25 09:37:26');

-- Dumping structure for table laravel12react.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table laravel12react.users: ~4 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'Jansen Venal', 'jansenearl@yahoo.com', NULL, '$2y$12$VgaDB/20/jDwocojGFpqYeS7/eE1e51KEExm8zqFs/qdkw5Suw7ci', NULL, '2025-07-06 03:43:14', '2025-07-06 03:43:14'),
	(2, 'Venal Jansen', 'venaljansen@yahoo.com', NULL, '$2y$12$t2v31aYWtppT.Wrgt6F18.9Tw4RcPNrYlEnusBfux1Sq4lCXwB0Ti', NULL, '2025-07-31 01:05:39', '2025-07-31 01:05:39'),
	(3, 'Test User', 'testuser@gmail.com', NULL, '$2y$12$1QGkHtj8.mzElbKpU7G1heKYazUhv0F/wTkmre/JdhyaXdmhk/WQa', 'jBGAFx0SEL8pOJAdgrTgdiU6F5IMp33NQQEKTqwTbCiHAmJTUjZXRjHEmyuG', '2025-08-02 05:45:24', '2025-08-02 05:45:24'),
	(4, 'Keihle Pascual', 'pascual.keihlediannegyraser@student.auf.edu.ph', '2025-08-10 09:22:23', '$2y$12$xOEOKs8ybL72wB/jfQlzIuJX.30QmcQS1MkCDLtaJdlu8nV93E5/G', '3m6xQxFmpFiegGxj5S17t1ISTUtJXrvpbB9icy2N2RK5Gar9on5g2zkKBtsK', '2025-08-10 01:21:10', '2025-08-10 01:21:10');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
