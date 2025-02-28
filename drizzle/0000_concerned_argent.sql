CREATE TABLE `email_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sender` text NOT NULL,
	`email_count` integer DEFAULT 0,
	`last_email_date` integer,
	`average_response_time` integer,
	`total_attachments_size` integer DEFAULT 0,
	`categories` text
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message_id` text NOT NULL,
	`thread_id` text,
	`subject` text,
	`from` text NOT NULL,
	`to` text NOT NULL,
	`received_at` integer NOT NULL,
	`labels` text,
	`attachments_size` integer DEFAULT 0,
	`category` text,
	`importance` integer DEFAULT 0,
	`is_archived` integer DEFAULT false,
	`is_deleted` integer DEFAULT false,
	`ai_analysis` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `emails_message_id_unique` ON `emails` (`message_id`);--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`auto_archive_rules` text,
	`auto_label_rules` text,
	`default_importance` integer DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_user_id_unique` ON `user_preferences` (`user_id`);