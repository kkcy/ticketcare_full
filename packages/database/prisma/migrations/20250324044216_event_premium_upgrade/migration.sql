/*
  Warnings:

  - You are about to drop the column `event_credits` on the `organizer` table. All the data in the column will be lost.
  - You are about to drop the column `event_credits_used` on the `organizer` table. All the data in the column will be lost.
  - You are about to drop the column `is_premium` on the `organizer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EventPremiumUpgradeStatus" AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- AlterTable
ALTER TABLE "organizer" DROP COLUMN "event_credits",
DROP COLUMN "event_credits_used",
DROP COLUMN "is_premium";

-- CreateTable
CREATE TABLE "event_premium_upgrade" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "premium_tier_id" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "EventPremiumUpgradeStatus" NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_premium_upgrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_premium_upgrade_event_id_idx" ON "event_premium_upgrade"("event_id");

-- CreateIndex
CREATE INDEX "event_premium_upgrade_organizer_id_idx" ON "event_premium_upgrade"("organizer_id");

-- CreateIndex
CREATE INDEX "event_premium_upgrade_premium_tier_id_idx" ON "event_premium_upgrade"("premium_tier_id");

-- AddForeignKey
ALTER TABLE "event_premium_upgrade" ADD CONSTRAINT "event_premium_upgrade_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_premium_upgrade" ADD CONSTRAINT "event_premium_upgrade_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_premium_upgrade" ADD CONSTRAINT "event_premium_upgrade_premium_tier_id_fkey" FOREIGN KEY ("premium_tier_id") REFERENCES "premium_tier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
