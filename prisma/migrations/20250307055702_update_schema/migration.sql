/*
  Warnings:

  - You are about to drop the column `eventId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `organizerId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saleStartTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketTypeId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_userId_fkey`;

-- DropIndex
DROP INDEX `Ticket_eventId_fkey` ON `Ticket`;

-- DropIndex
DROP INDEX `Ticket_userId_fkey` ON `Ticket`;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `organizerId` VARCHAR(191) NOT NULL,
    ADD COLUMN `saleStartTime` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Ticket` DROP COLUMN `eventId`,
    DROP COLUMN `price`,
    ADD COLUMN `ticketTypeId` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `TicketType` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TicketType_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_organizerId_fkey` FOREIGN KEY (`organizerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketType` ADD CONSTRAINT `TicketType_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_ticketTypeId_fkey` FOREIGN KEY (`ticketTypeId`) REFERENCES `TicketType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
