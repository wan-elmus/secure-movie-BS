
CREATE DATABASE movie_blog;

USE movie_blog;

-- Table to store users
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  otp_secret VARCHAR(16) NULL,
  otp_enabled BOOLEAN DEFAULT 0
);

-- Table to store posts
CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  author_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (author_id) -- Add an index on author_id for better query performance
);

-- Table to store OTP for users
CREATE TABLE IF NOT EXISTS otp_verification (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    type ENUM('registration', '2fa_enrollment') NOT NULL,
    expiration_time TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (user_id) -- Add an index on user_id for better query performance
);
