/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `lead` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `lead` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - Added the required column `ownerId` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `lead` DROP FOREIGN KEY `Lead_assignedToId_fkey`;

-- DropIndex
DROP INDEX `Lead_assignedToId_fkey` ON `lead`;

-- DropIndex
DROP INDEX `Lead_email_key` ON `lead`;

-- AlterTable
ALTER TABLE `lead` DROP COLUMN `assignedToId`,
    ADD COLUMN `ownerId` INTEGER NOT NULL,
    ADD COLUMN `priority` VARCHAR(191) NULL DEFAULT 'Medium',
    ADD COLUMN `source` ENUM('WEBSITE', 'ADS_CAMPAIGN', 'REFERRAL', 'EVENT_OFFLINE', 'SOCIAL_MEDIA') NULL,
    ADD COLUMN `value` DOUBLE NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `status` ENUM('LEAD_IN', 'CONTACT_MADE', 'NEED_IDENTIFIED', 'PROPOSAL_MADE', 'WON', 'LOST', 'DELETE') NOT NULL DEFAULT 'LEAD_IN';

-- AlterTable
ALTER TABLE `role` ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `password` VARCHAR(255) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
