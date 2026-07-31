-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 30, 2026 at 08:05 AM
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
-- Database: `waresafe_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `access_cards`
--

CREATE TABLE `access_cards` (
  `card_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `alert_id` bigint(20) UNSIGNED NOT NULL,
  `attack_id` bigint(20) UNSIGNED DEFAULT NULL,
  `alert_type` varchar(100) NOT NULL,
  `sensor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alerts`
--

INSERT INTO `alerts` (`alert_id`, `attack_id`, `alert_type`, `sensor_id`, `timestamp`) VALUES
(1, 1, 'Data Flooding', 1, '2026-04-12 21:50:11');

-- --------------------------------------------------------

--
-- Table structure for table `attack_scenarios`
--

CREATE TABLE `attack_scenarios` (
  `attack_id` bigint(20) UNSIGNED NOT NULL,
  `attack_type` varchar(255) NOT NULL,
  `target_component` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attack_scenarios`
--

INSERT INTO `attack_scenarios` (`attack_id`, `attack_type`, `target_component`, `description`, `timestamp`) VALUES
(1, 'Replay Attack', 'ESP32 Gateway, IR Sensor & Door', 'Fake authorized access', '2026-04-04 16:28:36'),
(2, 'Vibration Spoofing', 'ESP32 Gateway, Vibration Sensor', 'False danger alarm', '2026-07-30 06:02:59'),
(3, 'Flooding Attack', 'ESP32 Gateway, MQTT Communication', 'Spam with alarms', '2026-07-30 06:04:19'),
(4, 'Security Suppression', 'ESP32 Gateway, mRFID Authentication', 'Authentication bypass', '2026-07-30 06:05:03');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Table structure for table `devices`
--

CREATE TABLE `devices` (
  `device_id` bigint(20) UNSIGNED NOT NULL,
  `device_type` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `zone_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `devices`
--

INSERT INTO `devices` (`device_id`, `device_type`, `status`, `zone_id`, `created_at`, `updated_at`) VALUES
(1, 'ESP32A', 'Active', 1, NULL, NULL),
(2, 'ESP32B', 'Active', 2, NULL, NULL),
(3, 'ESP32', 'Active', 1, '0000-00-00 00:00:00', '0000-00-00 00:00:00');

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
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_04_04_141355_create_zones_table', 1),
(5, '2026_04_04_145028_create_devices_table', 1),
(6, '2026_04_04_145140_create_sensors_table', 1),
(7, '2026_04_04_153849_create_sensor_data_table', 1),
(8, '2026_04_04_161340_create_access_cards_table', 1),
(9, '2026_04_04_161353_create_user_activity_logs_table', 1),
(10, '2026_04_04_162338_create_attack_scenarios_table', 1),
(11, '2026_04_04_162502_create_alerts_table', 1),
(12, '2026_04_04_181427_create_personal_access_tokens_table', 2);

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
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sensors`
--

CREATE TABLE `sensors` (
  `sensor_id` bigint(20) UNSIGNED NOT NULL,
  `sensor_type` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `device_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sensors`
--

INSERT INTO `sensors` (`sensor_id`, `sensor_type`, `status`, `device_id`, `created_at`, `updated_at`) VALUES
(1, 'IR', 'Active', 1, NULL, NULL),
(2, 'Door Reed A', 'Active', 1, NULL, NULL),
(3, 'Vibration ', 'Active', 1, NULL, NULL),
(4, 'Buzzer A', 'Active', 1, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(5, 'RFID', 'Active', 2, NULL, NULL),
(6, 'Door Reed B', 'Active', 2, NULL, NULL),
(7, 'LCD Display', 'Active', 2, NULL, NULL),
(8, 'LED lgiht', 'Active', 2, NULL, NULL),
(9, 'Buzzer B', 'Active', 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sensor_data`
--

CREATE TABLE `sensor_data` (
  `data_id` bigint(20) UNSIGNED NOT NULL,
  `value` varchar(255) NOT NULL,
  `sensor_id` bigint(20) UNSIGNED NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sensor_data`
--

INSERT INTO `sensor_data` (`data_id`, `value`, `sensor_id`, `timestamp`) VALUES
(1, '0', 4, '2026-04-02 09:37:35'),
(2, '3', 1, '2026-04-02 12:36:35'),
(3, '3', 1, '2026-04-01 18:59:35'),
(4, '5', 4, '2026-04-03 07:40:35'),
(5, '0', 2, '2026-04-02 13:14:35'),
(6, '4', 4, '2026-04-02 12:49:35'),
(7, '3', 1, '2026-04-01 16:43:35'),
(8, '5', 3, '2026-04-02 19:05:35'),
(9, '0', 2, '2026-04-03 01:10:35'),
(10, '5', 2, '2026-04-01 14:16:35'),
(11, 'normal', 1, '0000-00-00 00:00:00');

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
('1B3DgCkalutKSQ0rkeyBd1jzO9gY2XBYC0F3JWYB', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiblFheG9tZTM4V21DZ09xVm93V0J4QnFDMkZBNldmY2V0T2lhRWVCUyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1777733125);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Security Admin', 'admin@waresafe.local', 'password123', 'Admin', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_activity_logs`
--

CREATE TABLE `user_activity_logs` (
  `log_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `action_type` varchar(255) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_activity_logs`
--

INSERT INTO `user_activity_logs` (`log_id`, `user_id`, `action_type`, `timestamp`) VALUES
(1, 1, 'Security Admin login', '2026-04-05 17:26:33'),
(2, 1, 'Security Admin login', '2026-04-05 17:37:53'),
(3, 1, 'Security Admin logout', '2026-04-05 17:38:00'),
(4, 1, 'Security Admin login', '2026-04-06 20:15:21'),
(5, 1, 'Security Admin login', '2026-04-06 20:15:22'),
(6, 1, 'Security Admin logout', '2026-04-06 20:15:39'),
(7, 1, 'Security Admin login', '2026-04-06 20:16:57'),
(8, 1, 'Security Admin login', '2026-04-08 04:54:38'),
(9, 1, 'Security Admin login', '2026-04-08 04:54:41'),
(10, 1, 'Security Admin login', '2026-04-08 04:55:24'),
(11, 1, 'Security Admin login', '2026-04-08 04:56:07'),
(12, 1, 'Security Admin login', '2026-04-08 05:07:17'),
(13, 1, 'Security Admin logout', '2026-04-08 05:10:57'),
(14, 1, 'Security Admin logout', '2026-04-08 05:10:58'),
(15, 1, 'Security Admin login', '2026-04-08 05:25:28'),
(16, 1, 'Security Admin login', '2026-04-08 05:33:14'),
(17, 1, 'Security Admin login', '2026-04-08 05:51:18'),
(18, 1, 'Security Admin logout', '2026-04-08 05:51:47'),
(19, 1, 'Security Admin login', '2026-04-08 05:51:51'),
(20, 1, 'Security Admin login', '2026-04-08 05:55:42'),
(21, 1, 'Security Admin login', '2026-04-08 06:00:18'),
(22, 1, 'Security Admin login', '2026-04-08 06:11:46'),
(23, 1, 'Security Admin login', '2026-04-08 06:11:50'),
(24, 1, 'Security Admin logout', '2026-04-08 06:13:14'),
(25, 1, 'Security Admin login', '2026-04-08 06:13:18'),
(26, 1, 'Security Admin logout', '2026-04-12 04:37:04'),
(27, 1, 'Security Admin logout', '2026-04-12 04:37:04'),
(28, 1, 'Security Admin login', '2026-04-12 04:37:10'),
(29, 1, 'Security Admin logout', '2026-04-12 08:30:44'),
(30, 1, 'Security Admin login', '2026-04-12 08:31:53'),
(31, 1, 'Security Admin logout', '2026-04-12 08:33:28'),
(32, 1, 'Security Admin login', '2026-04-12 08:33:52'),
(33, 1, 'Security Admin logout', '2026-04-12 08:34:14'),
(34, 1, 'Security Admin login', '2026-04-12 08:34:45'),
(35, 1, 'Security Admin logout', '2026-04-12 08:35:09'),
(36, 1, 'Security Admin login', '2026-04-12 08:36:08'),
(37, 1, 'Security Admin logout', '2026-05-02 07:47:15'),
(38, 1, 'Security Admin login', '2026-05-02 07:49:38');

-- --------------------------------------------------------

--
-- Table structure for table `zones`
--

CREATE TABLE `zones` (
  `zone_id` bigint(20) UNSIGNED NOT NULL,
  `zone_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `zones`
--

INSERT INTO `zones` (`zone_id`, `zone_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Office', 'First floor office', NULL, NULL),
(2, 'Warehouse', 'Second floor warehouse', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_cards`
--
ALTER TABLE `access_cards`
  ADD PRIMARY KEY (`card_id`),
  ADD KEY `access_cards_user_id_foreign` (`user_id`);

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`alert_id`),
  ADD KEY `fk_alert_attack` (`attack_id`),
  ADD KEY `fk_alert_sensor` (`sensor_id`);

--
-- Indexes for table `attack_scenarios`
--
ALTER TABLE `attack_scenarios`
  ADD PRIMARY KEY (`attack_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`device_id`),
  ADD KEY `devices_zone_id_foreign` (`zone_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

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
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `sensors`
--
ALTER TABLE `sensors`
  ADD PRIMARY KEY (`sensor_id`),
  ADD KEY `sensors_device_id_foreign` (`device_id`);

--
-- Indexes for table `sensor_data`
--
ALTER TABLE `sensor_data`
  ADD PRIMARY KEY (`data_id`),
  ADD KEY `sensor_data_sensor_id_foreign` (`sensor_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `user_activity_logs_user_id_foreign` (`user_id`);

--
-- Indexes for table `zones`
--
ALTER TABLE `zones`
  ADD PRIMARY KEY (`zone_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_cards`
--
ALTER TABLE `access_cards`
  MODIFY `card_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `alert_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attack_scenarios`
--
ALTER TABLE `attack_scenarios`
  MODIFY `attack_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
  MODIFY `device_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sensors`
--
ALTER TABLE `sensors`
  MODIFY `sensor_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `sensor_data`
--
ALTER TABLE `sensor_data`
  MODIFY `data_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  MODIFY `log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `zones`
--
ALTER TABLE `zones`
  MODIFY `zone_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `access_cards`
--
ALTER TABLE `access_cards`
  ADD CONSTRAINT `access_cards_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `fk_alert_attack` FOREIGN KEY (`attack_id`) REFERENCES `attack_scenarios` (`attack_id`),
  ADD CONSTRAINT `fk_alert_sensor` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `devices`
--
ALTER TABLE `devices`
  ADD CONSTRAINT `devices_zone_id_foreign` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`zone_id`);

--
-- Constraints for table `sensors`
--
ALTER TABLE `sensors`
  ADD CONSTRAINT `sensors_device_id_foreign` FOREIGN KEY (`device_id`) REFERENCES `devices` (`device_id`);

--
-- Constraints for table `sensor_data`
--
ALTER TABLE `sensor_data`
  ADD CONSTRAINT `sensor_data_sensor_id_foreign` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`);

--
-- Constraints for table `user_activity_logs`
--
ALTER TABLE `user_activity_logs`
  ADD CONSTRAINT `user_activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
