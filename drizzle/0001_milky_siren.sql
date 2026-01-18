CREATE TABLE `ai_extractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`extractionType` varchar(50) NOT NULL,
	`extractedData` text NOT NULL,
	`confidence` decimal(5,2),
	`reviewedBy` int,
	`isApproved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_extractions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int,
	`title` text NOT NULL,
	`description` text,
	`eventType` varchar(50) NOT NULL,
	`location` text,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`attendees` text,
	`reminderMinutes` int DEFAULT 30,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`userId` int NOT NULL,
	`activityType` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `case_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseNumber` varchar(50) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`clientId` int NOT NULL,
	`caseType` varchar(100) NOT NULL,
	`status` enum('active','pending','closed','archived') NOT NULL DEFAULT 'active',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`court` text,
	`judge` text,
	`opposingParty` text,
	`opposingLawyer` text,
	`filingDate` timestamp,
	`hearingDate` timestamp,
	`closingDate` timestamp,
	`assignedTo` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cases_id` PRIMARY KEY(`id`),
	CONSTRAINT `cases_caseNumber_unique` UNIQUE(`caseNumber`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`address` text,
	`nationalId` varchar(20),
	`companyName` text,
	`companyRegistration` varchar(50),
	`type` enum('individual','company') NOT NULL DEFAULT 'individual',
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_access_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`userId` int,
	`clientId` int,
	`action` varchar(50) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_access_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`fileKey` text NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` text NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`category` varchar(100),
	`tags` text,
	`version` int NOT NULL DEFAULT 1,
	`parentDocumentId` int,
	`uploadedBy` int NOT NULL,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`userId` int NOT NULL,
	`description` text NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`category` varchar(100),
	`date` timestamp NOT NULL,
	`receiptUrl` text,
	`isBillable` boolean NOT NULL DEFAULT true,
	`invoiceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`caseId` int NOT NULL,
	`clientId` int NOT NULL,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`subtotal` decimal(10,2) NOT NULL,
	`taxRate` decimal(5,2) NOT NULL DEFAULT '15.00',
	`taxAmount` decimal(10,2) NOT NULL,
	`discount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total` decimal(10,2) NOT NULL,
	`notes` text,
	`dueDate` timestamp,
	`paidDate` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `legal_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`templateContent` text NOT NULL,
	`variables` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legal_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) NOT NULL,
	`relatedId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`clientId` int NOT NULL,
	`shareToken` varchar(64) NOT NULL,
	`password` varchar(255),
	`permissions` enum('view','download','edit') NOT NULL DEFAULT 'view',
	`expiresAt` timestamp,
	`accessCount` int NOT NULL DEFAULT 0,
	`lastAccessedAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shared_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `shared_documents_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`assignedTo` int,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`dueDate` timestamp,
	`completedAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `time_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`userId` int NOT NULL,
	`description` text NOT NULL,
	`hours` decimal(5,2) NOT NULL,
	`rate` decimal(10,2),
	`amount` decimal(10,2),
	`date` timestamp NOT NULL,
	`isBillable` boolean NOT NULL DEFAULT true,
	`invoiceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `time_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','lawyer','client') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
CREATE INDEX `document_idx` ON `ai_extractions` (`documentId`);--> statement-breakpoint
CREATE INDEX `case_idx` ON `calendar_events` (`caseId`);--> statement-breakpoint
CREATE INDEX `start_idx` ON `calendar_events` (`startTime`);--> statement-breakpoint
CREATE INDEX `case_idx` ON `case_activities` (`caseId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `case_activities` (`userId`);--> statement-breakpoint
CREATE INDEX `case_number_idx` ON `cases` (`caseNumber`);--> statement-breakpoint
CREATE INDEX `client_idx` ON `cases` (`clientId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `cases` (`status`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `clients` (`email`);--> statement-breakpoint
CREATE INDEX `phone_idx` ON `clients` (`phone`);--> statement-breakpoint
CREATE INDEX `document_idx` ON `document_access_log` (`documentId`);--> statement-breakpoint
CREATE INDEX `case_idx` ON `documents` (`caseId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `documents` (`category`);--> statement-breakpoint
CREATE INDEX `case_idx` ON `expenses` (`caseId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `expenses` (`userId`);--> statement-breakpoint
CREATE INDEX `invoice_idx` ON `expenses` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `invoice_number_idx` ON `invoices` (`invoiceNumber`);--> statement-breakpoint
CREATE INDEX `case_idx` ON `invoices` (`caseId`);--> statement-breakpoint
CREATE INDEX `client_idx` ON `invoices` (`clientId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `read_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `shared_documents` (`shareToken`);--> statement-breakpoint
CREATE INDEX `document_idx` ON `shared_documents` (`documentId`);--> statement-breakpoint
CREATE INDEX `case_idx` ON `tasks` (`caseId`);--> statement-breakpoint
CREATE INDEX `assigned_idx` ON `tasks` (`assignedTo`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `case_idx` ON `time_entries` (`caseId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `time_entries` (`userId`);--> statement-breakpoint
CREATE INDEX `invoice_idx` ON `time_entries` (`invoiceId`);