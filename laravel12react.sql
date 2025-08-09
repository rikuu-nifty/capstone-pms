-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 05, 2025 at 06:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laravel12react`
--

-- --------------------------------------------------------

--
-- Table structure for table `asset_models`
--

CREATE TABLE `asset_models` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `model` text DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('active','is_archived') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `asset_models`
--

INSERT INTO `asset_models` (`id`, `brand`, `model`, `category_id`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Lifetime Products', '2980', 1, 'active', '2025-07-25 08:03:28', '2025-07-25 08:03:28'),
(3, 'Acer', 'KA242Y', 2, 'active', '2025-07-25 10:04:54', '2025-07-25 10:04:54');

-- --------------------------------------------------------

--
-- Table structure for table `buildings`
--

CREATE TABLE `buildings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `buildings`
--

INSERT INTO `buildings` (`id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Main Building', 'AUF-MB', 'Main Administration Building used for central operations and storage.', '2025-07-25 07:59:16', '2025-07-25 07:59:16'),
(2, 'Sports & Cultural Center', 'AUF-SCC', 'Main venue for events and athletics', '2025-07-25 08:45:59', '2025-07-25 08:45:59');

-- --------------------------------------------------------

--
-- Table structure for table `building_rooms`
--

CREATE TABLE `building_rooms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `building_id` bigint(20) UNSIGNED NOT NULL,
  `room` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `building_rooms`
--

INSERT INTO `building_rooms` (`id`, `building_id`, `room`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 'Room 204', 'Office of Property Custodian', '2025-07-25 07:57:22', '2025-07-25 07:57:22'),
(2, 2, 'Room 107', 'Lecture and activity room inside SCC', '2025-07-25 08:49:43', '2025-07-25 08:49:43');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel_cache_test@gmail.com|127.0.0.1', 'i:1;', 1754142341),
('laravel_cache_test@gmail.com|127.0.0.1:timer', 'i:1754142341;', 1754142341),
('laravel_cache_venaljansen30@yahoo.com|127.0.0.1', 'i:2;', 1752601939),
('laravel_cache_venaljansen30@yahoo.com|127.0.0.1:timer', 'i:1752601939;', 1752601939);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Furniture', 'Includes office tables, chairs, and related items.', '2025-07-25 08:02:10', '2025-07-25 08:02:10'),
(2, 'IT Equipment', 'Includes all types of information technology-related equipment and devices.', '2025-07-25 10:02:48', '2025-07-25 10:02:48');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_lists`
--

CREATE TABLE `inventory_lists` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `memorandum_no` int(11) NOT NULL,
  `asset_model_id` bigint(20) UNSIGNED NOT NULL,
  `asset_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','archived') NOT NULL DEFAULT 'archived',
  `unit_or_department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `building_id` bigint(20) UNSIGNED DEFAULT NULL,
  `building_room_id` bigint(20) UNSIGNED DEFAULT NULL,
  `serial_no` text NOT NULL,
  `supplier` varchar(255) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `date_purchased` date DEFAULT NULL,
  `asset_type` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `transfer_status` enum('not_transferred','transferred','pending') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventory_lists`
--

INSERT INTO `inventory_lists` (`id`, `memorandum_no`, `asset_model_id`, `asset_name`, `description`, `status`, `unit_or_department_id`, `building_id`, `building_room_id`, `serial_no`, `supplier`, `unit_cost`, `date_purchased`, `asset_type`, `quantity`, `transfer_status`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 'Monitor', NULL, 'archived', 1, 1, 1, 'CN0G1234567890ABCDEF', 'Gilmore Computer Center', 8360.00, '2025-07-26', 'IT Equipment', 3, 'not_transferred', '2025-07-29 01:01:49', '2025-07-29 01:11:47'),
(2, 2, 2, 'Table', NULL, 'active', 2, 2, 2, 'SD124EQ', 'Ace Hardware', 8763.00, '2025-08-01', 'Furniture', 10, 'not_transferred', '2025-07-29 01:28:59', '2025-07-30 02:34:08');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_schedulings`
--

CREATE TABLE `inventory_schedulings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `building_id` bigint(20) UNSIGNED DEFAULT NULL,
  `building_room_id` bigint(20) UNSIGNED DEFAULT NULL,
  `unit_or_department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `designated_employee` bigint(20) UNSIGNED DEFAULT NULL,
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `inventory_schedule` date NOT NULL,
  `actual_date_of_inventory` date DEFAULT NULL,
  `checked_by` varchar(255) DEFAULT NULL,
  `verified_by` varchar(255) DEFAULT NULL,
  `received_by` varchar(255) DEFAULT NULL,
  `scheduling_status` enum('completed','pending','overdue') NOT NULL DEFAULT 'pending',
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

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
(27, '2025_07_31_071543_create_inventory_schedulings_table', 8),
(28, '2025_08_02_111125_create_transfers_table', 9),
(30, '2025_08_02_114335_create_transfer_asset_table', 10);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('OgrJmByjEirFqUbfL5QwGRvK6hE9TG7vYVHXeaPQ', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiVlpFemM0akM1VmVzNGR5bjNxTjN1Qk1QUmtpbkl3RVY2UTl0c3hXZyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC90cmFuc2ZlcnMiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aTozO30=', 1754409991);

-- --------------------------------------------------------

--
-- Table structure for table `transfers`
--

CREATE TABLE `transfers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `current_building_room` bigint(20) UNSIGNED NOT NULL,
  `current_organization` bigint(20) UNSIGNED NOT NULL,
  `receiving_building_room` bigint(20) UNSIGNED NOT NULL,
  `receiving_organization` bigint(20) UNSIGNED NOT NULL,
  `designated_employee` bigint(20) UNSIGNED NOT NULL,
  `assigned_by` bigint(20) UNSIGNED NOT NULL,
  `scheduled_date` date NOT NULL,
  `actual_transfer_date` date DEFAULT NULL,
  `received_by` varchar(255) DEFAULT NULL,
  `status` enum('upcoming','in_progress','overdue','completed') NOT NULL DEFAULT 'upcoming',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transfers`
--

INSERT INTO `transfers` (`id`, `current_building_room`, `current_organization`, `receiving_building_room`, `receiving_organization`, `designated_employee`, `assigned_by`, `scheduled_date`, `actual_transfer_date`, `received_by`, `status`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 2, 2, 1, '2025-08-01', NULL, NULL, 'upcoming', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `transfer_assets`
--

CREATE TABLE `transfer_assets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transfer_id` bigint(20) UNSIGNED NOT NULL,
  `asset_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transfer_assets`
--

INSERT INTO `transfer_assets` (`id`, `transfer_id`, `asset_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2025-08-05 14:40:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `unit_or_departments`
--

CREATE TABLE `unit_or_departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `unit_or_departments`
--

INSERT INTO `unit_or_departments` (`id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Property and Supply Office', 'PSO', 'Responsible for asset management and furniture inventory including tables and chairs.', '2025-07-25 09:32:07', '2025-07-25 09:32:07'),
(2, 'Management Information Systems and Services', 'MISS', 'Handles all IT-related operations and support', '2025-07-25 09:37:26', '2025-07-25 09:37:26');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Jansen Venal', 'jansenearl@yahoo.com', NULL, '$2y$12$VgaDB/20/jDwocojGFpqYeS7/eE1e51KEExm8zqFs/qdkw5Suw7ci', NULL, '2025-07-06 03:43:14', '2025-07-06 03:43:14'),
(2, 'Venal Jansen', 'venaljansen@yahoo.com', NULL, '$2y$12$t2v31aYWtppT.Wrgt6F18.9Tw4RcPNrYlEnusBfux1Sq4lCXwB0Ti', NULL, '2025-07-31 01:05:39', '2025-07-31 01:05:39'),
(3, 'Test User', 'testuser@gmail.com', NULL, '$2y$12$1QGkHtj8.mzElbKpU7G1heKYazUhv0F/wTkmre/JdhyaXdmhk/WQa', 'ddqHmBxNvX6QJn21QMEhI2ezwX2bMM7IqfxdQAjjXe5XrionBGDClDkY5WwY', '2025-08-02 05:45:24', '2025-08-02 05:45:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `asset_models`
--
ALTER TABLE `asset_models`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asset_models_category_id_foreign` (`category_id`);

--
-- Indexes for table `buildings`
--
ALTER TABLE `buildings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `building_rooms`
--
ALTER TABLE `building_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `building_rooms_building_id_foreign` (`building_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `inventory_lists`
--
ALTER TABLE `inventory_lists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_lists_asset_model_id_foreign` (`asset_model_id`),
  ADD KEY `inventory_lists_unit_or_department_id_foreign` (`unit_or_department_id`),
  ADD KEY `inventory_lists_building_id_foreign` (`building_id`),
  ADD KEY `inventory_lists_building_room_id_foreign` (`building_room_id`);

--
-- Indexes for table `inventory_schedulings`
--
ALTER TABLE `inventory_schedulings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_schedulings_building_id_foreign` (`building_id`),
  ADD KEY `inventory_schedulings_building_room_id_foreign` (`building_room_id`),
  ADD KEY `inventory_schedulings_unit_or_department_id_foreign` (`unit_or_department_id`),
  ADD KEY `inventory_schedulings_user_id_foreign` (`user_id`),
  ADD KEY `inventory_schedulings_designated_employee_foreign` (`designated_employee`),
  ADD KEY `inventory_schedulings_assigned_by_foreign` (`assigned_by`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `transfers`
--
ALTER TABLE `transfers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transfers_current_building_room_foreign` (`current_building_room`),
  ADD KEY `transfers_current_organization_foreign` (`current_organization`),
  ADD KEY `transfers_receiving_building_room_foreign` (`receiving_building_room`),
  ADD KEY `transfers_receiving_organization_foreign` (`receiving_organization`),
  ADD KEY `transfers_designated_employee_foreign` (`designated_employee`),
  ADD KEY `transfers_assigned_by_foreign` (`assigned_by`);

--
-- Indexes for table `transfer_assets`
--
ALTER TABLE `transfer_assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transfer_assets_transfer_id_foreign` (`transfer_id`),
  ADD KEY `transfer_assets_asset_id_foreign` (`asset_id`);

--
-- Indexes for table `unit_or_departments`
--
ALTER TABLE `unit_or_departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `asset_models`
--
ALTER TABLE `asset_models`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `buildings`
--
ALTER TABLE `buildings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `building_rooms`
--
ALTER TABLE `building_rooms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_lists`
--
ALTER TABLE `inventory_lists`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `inventory_schedulings`
--
ALTER TABLE `inventory_schedulings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `transfers`
--
ALTER TABLE `transfers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transfer_assets`
--
ALTER TABLE `transfer_assets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `unit_or_departments`
--
ALTER TABLE `unit_or_departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `asset_models`
--
ALTER TABLE `asset_models`
  ADD CONSTRAINT `asset_models_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `building_rooms`
--
ALTER TABLE `building_rooms`
  ADD CONSTRAINT `building_rooms_building_id_foreign` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`);

--
-- Constraints for table `inventory_lists`
--
ALTER TABLE `inventory_lists`
  ADD CONSTRAINT `inventory_lists_asset_model_id_foreign` FOREIGN KEY (`asset_model_id`) REFERENCES `asset_models` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_lists_building_id_foreign` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_lists_building_room_id_foreign` FOREIGN KEY (`building_room_id`) REFERENCES `building_rooms` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_lists_unit_or_department_id_foreign` FOREIGN KEY (`unit_or_department_id`) REFERENCES `unit_or_departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventory_schedulings`
--
ALTER TABLE `inventory_schedulings`
  ADD CONSTRAINT `inventory_schedulings_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_schedulings_building_id_foreign` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_schedulings_building_room_id_foreign` FOREIGN KEY (`building_room_id`) REFERENCES `building_rooms` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_schedulings_designated_employee_foreign` FOREIGN KEY (`designated_employee`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_schedulings_unit_or_department_id_foreign` FOREIGN KEY (`unit_or_department_id`) REFERENCES `unit_or_departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_schedulings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transfers`
--
ALTER TABLE `transfers`
  ADD CONSTRAINT `transfers_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transfers_current_building_room_foreign` FOREIGN KEY (`current_building_room`) REFERENCES `building_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transfers_current_organization_foreign` FOREIGN KEY (`current_organization`) REFERENCES `unit_or_departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transfers_designated_employee_foreign` FOREIGN KEY (`designated_employee`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transfers_receiving_building_room_foreign` FOREIGN KEY (`receiving_building_room`) REFERENCES `building_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transfers_receiving_organization_foreign` FOREIGN KEY (`receiving_organization`) REFERENCES `unit_or_departments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transfer_assets`
--
ALTER TABLE `transfer_assets`
  ADD CONSTRAINT `transfer_assets_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `inventory_lists` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transfer_assets_transfer_id_foreign` FOREIGN KEY (`transfer_id`) REFERENCES `transfers` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
