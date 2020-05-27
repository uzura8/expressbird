CREATE DATABASE gc_db DEFAULT CHARACTER SET utf8;
use gc_db;

CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NULL,
  `type` enum('normal', 'anonymous', 'admin') NOT NULL DEFAULT 'normal',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0:active, 1:deleted',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user_auth` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_UNIQUE_idx` (`user_id`),
  UNIQUE KEY `email_UNIQUE_idx` (`email`),
  CONSTRAINT `user_auth_user_id_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `service_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_code` varchar(64) NOT NULL,
  `service_user_id` varchar(128) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_UNIQUE_idx` (`user_id`),
  UNIQUE KEY `service_code_service_user_id_UNIQUE_idx` (`service_code`, `service_user_id`),
  CONSTRAINT `service_user_user_id_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `chat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('public', 'private', 'support') NOT NULL DEFAULT 'public',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NULL,
  `body` text COLLATE utf8mb4_unicode_ci NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `chat_comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chat_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chat_comment_chat_id_chat_id` FOREIGN KEY (`chat_id`) REFERENCES `chat` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `chat` VALUES (0, 'public', NULL, NULL, 1, NOW(), NOW());
