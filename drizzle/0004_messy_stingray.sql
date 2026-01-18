DROP INDEX `start_idx` ON `calendar_events`;--> statement-breakpoint
ALTER TABLE `calendar_events` MODIFY COLUMN `eventType` enum('hearing','meeting','deadline','consultation','other') NOT NULL DEFAULT 'other';--> statement-breakpoint
ALTER TABLE `legal_templates` MODIFY COLUMN `variables` text;--> statement-breakpoint
ALTER TABLE `calendar_events` ADD `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled' NOT NULL;--> statement-breakpoint
ALTER TABLE `calendar_events` ADD `startDate` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `calendar_events` ADD `endDate` timestamp NOT NULL;--> statement-breakpoint
CREATE INDEX `start_idx` ON `calendar_events` (`startDate`);--> statement-breakpoint
ALTER TABLE `calendar_events` DROP COLUMN `startTime`;--> statement-breakpoint
ALTER TABLE `calendar_events` DROP COLUMN `endTime`;