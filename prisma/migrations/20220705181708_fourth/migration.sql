/*
  Warnings:

  - Added the required column `adminId` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Products` ADD COLUMN `adminId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
