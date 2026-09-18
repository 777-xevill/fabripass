CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL,
	`snapshot` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `activity_owner` ON `activity` (`owner`);--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`product_id` text NOT NULL,
	`payload` text NOT NULL,
	`object_key` text
);
--> statement-breakpoint
CREATE INDEX `evidence_owner_product` ON `evidence` (`owner`,`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`sku` text NOT NULL,
	`batch` text NOT NULL,
	`payload` text NOT NULL,
	`version` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_owner_sku_batch` ON `products` (`owner`,`sku`,`batch`);--> statement-breakpoint
CREATE TABLE `workspaces` (
	`owner` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL
);
