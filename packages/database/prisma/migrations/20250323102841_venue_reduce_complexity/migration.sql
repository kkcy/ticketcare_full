/*
  Warnings:

  - You are about to drop the column `accessibility` on the `venue` table. All the data in the column will be lost.
  - You are about to drop the column `age_restriction` on the `venue` table. All the data in the column will be lost.
  - You are about to drop the column `amenities` on the `venue` table. All the data in the column will be lost.
  - You are about to drop the column `custom_rules` on the `venue` table. All the data in the column will be lost.
  - You are about to drop the column `dresscode` on the `venue` table. All the data in the column will be lost.
  - You are about to drop the column `drinks` on the `venue` table. All the data in the column will be lost.
  - You are about to drop the column `food` on the `venue` table. All the data in the column will be lost.
  - You are about to drop the column `parking` on the `venue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "venue" DROP COLUMN "accessibility",
DROP COLUMN "age_restriction",
DROP COLUMN "amenities",
DROP COLUMN "custom_rules",
DROP COLUMN "dresscode",
DROP COLUMN "drinks",
DROP COLUMN "food",
DROP COLUMN "parking";
