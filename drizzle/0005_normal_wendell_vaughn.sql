CREATE TABLE `client_auth` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`passwordHash` text NOT NULL,
	`inviteToken` varchar(100),
	`inviteExpiry` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_auth_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_auth_clientId_unique` UNIQUE(`clientId`),
	CONSTRAINT `client_auth_inviteToken_unique` UNIQUE(`inviteToken`)
);
--> statement-breakpoint
CREATE TABLE `client_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderType` enum('lawyer','client') NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `client_idx` ON `client_auth` (`clientId`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `client_auth` (`inviteToken`);--> statement-breakpoint
CREATE INDEX `client_idx` ON `client_messages` (`clientId`);--> statement-breakpoint
CREATE INDEX `read_idx` ON `client_messages` (`isRead`);