CREATE TABLE `demo_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`product` text NOT NULL,
	`checkpoint` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `demo_events_session_time` ON `demo_events` (`session`,`created_at`);--> statement-breakpoint
CREATE TABLE `pilot_inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
