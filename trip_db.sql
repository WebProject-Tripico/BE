CREATE DATABASE tripico;
USE tripico;

CREATE TABLE `users` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(40),
  `email` VARCHAR(40) UNIQUE,
  `password` VARCHAR(40),
  `created_at` DATETIME
);

CREATE TABLE `tourist_spots` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100),
  `description` TEXT,
  `latitude` DOUBLE,
  `longitude` DOUBLE,
  `address` VARCHAR(255),
  `image_url` TEXT,
  `created_at` DATETIME
);

CREATE TABLE `trip_courses` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT,
  `start_date` DATE,
  `end_date` DATE,
  `number_of_people` INT,
  `recommendation_type` VARCHAR(20),
  `created_at` DATETIME
);

CREATE TABLE `trip_items` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `course_id` BIGINT,
  `place_id` BIGINT,
  `day_number` INT,
  `sequence` INT,
  `expected_time` TIME
);

ALTER TABLE `trip_courses` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
ALTER TABLE `trip_items` ADD FOREIGN KEY (`course_id`) REFERENCES `trip_courses` (`id`);
ALTER TABLE `trip_items` ADD FOREIGN KEY (`place_id`) REFERENCES `tourist_spots` (`id`);