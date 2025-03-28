-- AlterTable
ALTER TABLE "event" ALTER COLUMN "doors_open" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'draft',
ALTER COLUMN "is_public" SET DEFAULT true,
ALTER COLUMN "requires_approval" SET DEFAULT false,
ALTER COLUMN "waiting_list_enabled" SET DEFAULT false;
