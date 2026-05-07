/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `emailVerificationOTP` VARCHAR(191) NULL,
    ADD COLUMN `emailVerificationOTPExpires` DATETIME(3) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `onboardingStep` VARCHAR(191) NOT NULL DEFAULT 'created',
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL,
    ADD COLUMN `resetPasswordExpires` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(191) NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'customer',
    ADD COLUMN `state` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `firstName` VARCHAR(191) NULL,
    MODIFY `lastName` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WishlistItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeId` INTEGER NULL,
    `productName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `discountPrice` DOUBLE NOT NULL DEFAULT 0,
    `discountPercentage` DOUBLE NOT NULL DEFAULT 0,
    `discountType` VARCHAR(191) NOT NULL DEFAULT 'fixed',
    `categoryId` INTEGER NOT NULL,
    `subCategoryId` INTEGER NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `totalSold` INTEGER NOT NULL DEFAULT 0,
    `ratingsAverage` DOUBLE NOT NULL DEFAULT 0,
    `ratingsCount` INTEGER NOT NULL DEFAULT 0,
    `expiryDate` DATETIME(3) NULL,
    `images` JSON NOT NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Store` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendorId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `storeName` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Store_vendorId_key`(`vendorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `parentId` INTEGER NULL,
    `level` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VendorProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `documents` VARCHAR(191) NULL,
    `documentReviewStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `state` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VendorProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `shippingFee` DOUBLE NOT NULL DEFAULT 0,
    `subtotal` DOUBLE NOT NULL DEFAULT 0,
    `totalItems` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cart_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cartId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNumber` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `storeId` INTEGER NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NULL,
    `shippingLabel` VARCHAR(191) NULL,
    `shippingState` VARCHAR(191) NULL,
    `shippingCity` VARCHAR(191) NULL,
    `shippingAddress` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `subtotal` DOUBLE NOT NULL DEFAULT 0,
    `shippingFee` DOUBLE NOT NULL DEFAULT 0,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `currentStatus` VARCHAR(191) NOT NULL DEFAULT 'Order Received',
    `placedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    INDEX `Order_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Order_storeId_createdAt_idx`(`storeId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productCode` VARCHAR(191) NULL,
    `productImage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Delivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `riderName` VARCHAR(191) NULL,
    `riderId` VARCHAR(191) NULL,
    `riderEmail` VARCHAR(191) NULL,
    `riderPhone` VARCHAR(191) NULL,
    `deliveryService` VARCHAR(191) NULL,
    `deliveryLabel` VARCHAR(191) NULL,
    `deliveryState` VARCHAR(191) NULL,
    `deliveryCity` VARCHAR(191) NULL,
    `deliveryAddress` VARCHAR(191) NOT NULL,
    `trackingMapUrl` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Delivery_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryStatusUpdate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED') NOT NULL,
    `location` VARCHAR(191) NULL,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `subtotal` DOUBLE NOT NULL DEFAULT 0,
    `shippingFee` DOUBLE NOT NULL DEFAULT 0,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `paidByCustomer` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'card',
    `provider` VARCHAR(191) NOT NULL DEFAULT 'paystack',
    `transactionRef` VARCHAR(191) NULL,
    `paymentUrl` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `failureReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_orderId_key`(`orderId`),
    UNIQUE INDEX `Payment_transactionRef_key`(`transactionRef`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipientId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `data` JSON NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Notification_recipientId_createdAt_idx`(`recipientId`, `createdAt`),
    INDEX `Notification_recipientId_isRead_idx`(`recipientId`, `isRead`),
    INDEX `Notification_type_createdAt_idx`(`type`, `createdAt`),
    INDEX `Notification_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistItem` ADD CONSTRAINT `WishlistItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistItem` ADD CONSTRAINT `WishlistItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store` ADD CONSTRAINT `Store_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store` ADD CONSTRAINT `Store_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VendorProfile` ADD CONSTRAINT `VendorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryStatusUpdate` ADD CONSTRAINT `DeliveryStatusUpdate_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `Delivery`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
