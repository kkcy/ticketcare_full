-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('individual', 'company', 'organization');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "PayoutFrequency" AS ENUM ('weekly', 'biweekly', 'monthly');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('regular', 'premium', 'corporate');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('draft', 'published', 'cancelled', 'sold_out');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'completed', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('reserved', 'purchased', 'cancelled', 'used');

-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('active', 'expired', 'converted', 'abandoned');

-- CreateTable
CREATE TABLE "organiser" (
    "id" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "account_name" TEXT,
    "account_number" TEXT,
    "bank_name" TEXT,
    "routing_number" TEXT,
    "verification_status" "VerificationStatus" NOT NULL,
    "payout_frequency" "PayoutFrequency" NOT NULL,
    "commission_rate" DECIMAL(65,30) NOT NULL,
    "email_notifications" BOOLEAN NOT NULL,
    "sms_notifications" BOOLEAN NOT NULL,
    "push_notifications" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "total_capacity" INTEGER,
    "amenities" TEXT[],
    "parking" BOOLEAN,
    "accessibility" BOOLEAN,
    "food" BOOLEAN,
    "drinks" BOOLEAN,
    "images" TEXT[],
    "age_restriction" INTEGER,
    "dresscode" TEXT,
    "custom_rules" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "type" "CustomerType" NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "event_types" TEXT[],
    "email_notifications" BOOLEAN NOT NULL,
    "sms_notifications" BOOLEAN NOT NULL,
    "push_notifications" BOOLEAN NOT NULL,
    "last_login" TIMESTAMP(3),
    "balance" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" BIGSERIAL NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "venue_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT[],
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "doors_open" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "requires_approval" BOOLEAN NOT NULL,
    "waiting_list_enabled" BOOLEAN NOT NULL,
    "refund_policy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_date" (
    "id" BIGSERIAL NOT NULL,
    "event_id" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_date_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slot" (
    "id" BIGSERIAL NOT NULL,
    "event_date_id" BIGINT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "doors_open" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_type" (
    "id" BIGSERIAL NOT NULL,
    "event_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "max_per_order" INTEGER NOT NULL,
    "min_per_order" INTEGER NOT NULL,
    "sale_start_time" TIMESTAMP(3) NOT NULL,
    "sale_end_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" BIGSERIAL NOT NULL,
    "time_slot_id" BIGINT NOT NULL,
    "ticket_type_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" BIGSERIAL NOT NULL,
    "time_slot_id" BIGINT NOT NULL,
    "ticket_type_id" BIGINT NOT NULL,
    "order_id" BIGINT,
    "status" "TicketStatus" NOT NULL,
    "purchase_date" TIMESTAMP(3),
    "owner_name" TEXT,
    "owner_email" TEXT,
    "owner_phone" TEXT,
    "qr_code" TEXT NOT NULL,
    "eventId" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT,
    "status" "CartStatus" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" BIGSERIAL NOT NULL,
    "cart_id" TEXT NOT NULL,
    "time_slot_id" BIGINT NOT NULL,
    "ticket_type_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" BIGSERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    "ordered_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organiser_stripe_customer_id_key" ON "organiser"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "organiser_slug_key" ON "organiser"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "venue_slug_key" ON "venue"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "customer_stripe_customer_id_key" ON "customer"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_slug_key" ON "event"("slug");

-- CreateIndex
CREATE INDEX "event_organizer_id_idx" ON "event"("organizer_id");

-- CreateIndex
CREATE INDEX "event_date_event_id_idx" ON "event_date"("event_id");

-- CreateIndex
CREATE INDEX "time_slot_event_date_id_idx" ON "time_slot"("event_date_id");

-- CreateIndex
CREATE INDEX "ticket_type_event_id_idx" ON "ticket_type"("event_id");

-- CreateIndex
CREATE INDEX "inventory_time_slot_id_idx" ON "inventory"("time_slot_id");

-- CreateIndex
CREATE INDEX "inventory_ticket_type_id_idx" ON "inventory"("ticket_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_time_slot_id_ticket_type_id_key" ON "inventory"("time_slot_id", "ticket_type_id");

-- CreateIndex
CREATE INDEX "ticket_time_slot_id_idx" ON "ticket"("time_slot_id");

-- CreateIndex
CREATE INDEX "ticket_ticket_type_id_idx" ON "ticket"("ticket_type_id");

-- CreateIndex
CREATE INDEX "ticket_order_id_idx" ON "ticket"("order_id");

-- CreateIndex
CREATE INDEX "cart_customer_id_idx" ON "cart"("customer_id");

-- CreateIndex
CREATE INDEX "cart_item_cart_id_idx" ON "cart_item"("cart_id");

-- CreateIndex
CREATE INDEX "cart_item_time_slot_id_idx" ON "cart_item"("time_slot_id");

-- CreateIndex
CREATE INDEX "cart_item_ticket_type_id_idx" ON "cart_item"("ticket_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cart_id_time_slot_id_ticket_type_id_key" ON "cart_item"("cart_id", "time_slot_id", "ticket_type_id");

-- CreateIndex
CREATE INDEX "order_customerId_idx" ON "order"("customerId");

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_date" ADD CONSTRAINT "event_date_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slot" ADD CONSTRAINT "time_slot_event_date_id_fkey" FOREIGN KEY ("event_date_id") REFERENCES "event_date"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_type" ADD CONSTRAINT "ticket_type_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "time_slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "time_slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "time_slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
