-- EduBook — sql/schema.sql
--
-- Only needed if you switch php/config.php to DB_DRIVER = 'mysql'. The
-- default SQLite mode creates its own equivalent schema automatically in
-- php/data/edubook.sqlite — you do not need to run this file for that.
--
-- Creates the `edubook` database plus the `users` and `password_resets`
-- tables referenced throughout the PHP backend and README.

CREATE DATABASE IF NOT EXISTS edubook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edubook;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_resets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_resets_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_password_resets_user ON password_resets (user_id);
