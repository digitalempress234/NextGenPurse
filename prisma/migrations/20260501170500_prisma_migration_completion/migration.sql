-- Align the MySQL schema with the completed Prisma migration from MongoDB.

ALTER TABLE `VendorProfile` MODIFY `documents` JSON NULL;

ALTER TABLE `DeliveryStatusUpdate` MODIFY `status` VARCHAR(191) NOT NULL;

CREATE TABLE `Review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,
    `isVerifiedPurchase` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Review_userId_productId_key`(`userId`, `productId`),
    INDEX `Review_productId_createdAt_idx`(`productId`, `createdAt`),
    INDEX `Review_storeId_createdAt_idx`(`storeId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `WishlistItem_userId_productId_key` ON `WishlistItem`(`userId`, `productId`);

ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Review` ADD CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Review` ADD CONSTRAINT `Review_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
