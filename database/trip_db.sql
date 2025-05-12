CREATE DATABASE IF NOT EXISTS tripico DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tripico;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100),
  `password` VARCHAR(100),
  `created_at` DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tourist_spots` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `content_id` VARCHAR(50) UNIQUE,
  `name` VARCHAR(100),
  `description` TEXT,
  `latitude` DOUBLE,
  `longitude` DOUBLE,
  `address` VARCHAR(255),
  `image_url` TEXT,
  `created_at` DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `trip_courses` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` VARCHAR(50),
  `start_date` DATE,
  `end_date` DATE,
  `number_of_people` INT,
  `recommendation_type` VARCHAR(20),
  `created_at` DATETIME,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `trip_items` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `course_id` BIGINT,
  `place_id` BIGINT,
  `day_number` INT,
  `sequence` INT,
  `expected_time` TIME,
  FOREIGN KEY (`course_id`) REFERENCES `trip_courses` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`place_id`) REFERENCES `tourist_spots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
