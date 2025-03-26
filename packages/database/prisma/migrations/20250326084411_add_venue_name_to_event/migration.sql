-- AlterTable
ALTER TABLE "event" ADD COLUMN     "venue_name" TEXT,
ALTER COLUMN "venue_id" DROP NOT NULL;
