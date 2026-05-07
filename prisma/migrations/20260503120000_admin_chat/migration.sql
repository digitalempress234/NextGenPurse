CREATE TABLE `ChatConversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminId` INTEGER NOT NULL,
    `participantId` INTEGER NOT NULL,
    `lastMessageAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ChatConversation_adminId_participantId_key`(`adminId`, `participantId`),
    INDEX `ChatConversation_adminId_lastMessageAt_idx`(`adminId`, `lastMessageAt`),
    INDEX `ChatConversation_participantId_lastMessageAt_idx`(`participantId`, `lastMessageAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ChatMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversationId` INTEGER NOT NULL,
    `senderId` INTEGER NOT NULL,
    `body` TEXT NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChatMessage_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
    INDEX `ChatMessage_senderId_createdAt_idx`(`senderId`, `createdAt`),
    INDEX `ChatMessage_readAt_idx`(`readAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ChatConversation` ADD CONSTRAINT `ChatConversation_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ChatConversation` ADD CONSTRAINT `ChatConversation_participantId_fkey` FOREIGN KEY (`participantId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `ChatConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
