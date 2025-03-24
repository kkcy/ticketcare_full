-- AlterTable
ALTER TABLE "order" ADD COLUMN     "event_id" TEXT;

-- CreateIndex
CREATE INDEX "order_event_id_idx" ON "order"("event_id");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
