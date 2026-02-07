-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('CREATED', 'IN_PROGRESS', 'QC_PENDING', 'QC_APPROVED', 'QC_REJECTED', 'PACKAGED', 'SHIPPED', 'RECALLED');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('NUMBER', 'TEXT', 'BOOLEAN', 'SELECT', 'DATETIME');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('OUT_OF_RANGE', 'GATE_FAIL', 'TIMEOUT', 'LOW_CONFIDENCE');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "Disposition" AS ENUM ('PROCEED', 'REWORK', 'HOLD', 'REJECT');

-- CreateEnum
CREATE TYPE "OcrStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MANAGER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "material_type" TEXT,
    "certifications" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flavours" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flavours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_stages" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "is_qc_gate" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_fields" (
    "id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "label_hi" TEXT NOT NULL,
    "field_type" "FieldType" NOT NULL,
    "unit" TEXT,
    "min_value" DOUBLE PRECISION,
    "max_value" DOUBLE PRECISION,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "options" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stage_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "batch_code" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "flavour_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "supplier_lot" TEXT,
    "status" "BatchStatus" NOT NULL DEFAULT 'CREATED',
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "flow_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_records" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "recorded_by_id" TEXT,
    "committed_by_id" TEXT,
    "committed_at" TIMESTAMP(3),
    "form_photo_urls" TEXT[],
    "ocr_confidence_avg" DOUBLE PRECISION,
    "ocr_status" "OcrStatus" NOT NULL DEFAULT 'PENDING',
    "ocr_raw_result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "stage_record_id" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "ocr_raw_value" TEXT,
    "ocr_confidence" DOUBLE PRECISION,
    "is_corrected" BOOLEAN NOT NULL DEFAULT false,
    "corrected_from" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_approvals" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "stage_record_id" TEXT NOT NULL,
    "approver_name" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "taste_passed" BOOLEAN,
    "taste_notes" TEXT,
    "texture_passed" BOOLEAN,
    "texture_notes" TEXT,
    "smell_passed" BOOLEAN,
    "smell_notes" TEXT,
    "visual_passed" BOOLEAN,
    "visual_notes" TEXT,
    "water_activity" DOUBLE PRECISION,
    "ph_level" DOUBLE PRECISION,
    "disposition" "Disposition",
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qc_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "stage_record_id" TEXT,
    "measurement_id" TEXT,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "acknowledged_by_id" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_templates" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template_json" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE UNIQUE INDEX "flavours_product_id_code_key" ON "flavours"("product_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "process_stages_product_id_order_key" ON "process_stages"("product_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "stage_fields_stage_id_order_key" ON "stage_fields"("stage_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "batches_batch_code_key" ON "batches"("batch_code");

-- CreateIndex
CREATE INDEX "batches_status_idx" ON "batches"("status");

-- CreateIndex
CREATE INDEX "batches_created_at_idx" ON "batches"("created_at");

-- CreateIndex
CREATE INDEX "batches_product_id_idx" ON "batches"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "stage_records_batch_id_stage_id_key" ON "stage_records"("batch_id", "stage_id");

-- CreateIndex
CREATE UNIQUE INDEX "qc_approvals_stage_record_id_key" ON "qc_approvals"("stage_record_id");

-- CreateIndex
CREATE INDEX "alerts_batch_id_idx" ON "alerts"("batch_id");

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "flavours" ADD CONSTRAINT "flavours_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_stages" ADD CONSTRAINT "process_stages_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_fields" ADD CONSTRAINT "stage_fields_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "process_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_flavour_id_fkey" FOREIGN KEY ("flavour_id") REFERENCES "flavours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_records" ADD CONSTRAINT "stage_records_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_records" ADD CONSTRAINT "stage_records_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "process_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_records" ADD CONSTRAINT "stage_records_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_records" ADD CONSTRAINT "stage_records_committed_by_id_fkey" FOREIGN KEY ("committed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_stage_record_id_fkey" FOREIGN KEY ("stage_record_id") REFERENCES "stage_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "stage_fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_approvals" ADD CONSTRAINT "qc_approvals_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_approvals" ADD CONSTRAINT "qc_approvals_stage_record_id_fkey" FOREIGN KEY ("stage_record_id") REFERENCES "stage_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_stage_record_id_fkey" FOREIGN KEY ("stage_record_id") REFERENCES "stage_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "measurements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_acknowledged_by_id_fkey" FOREIGN KEY ("acknowledged_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_templates" ADD CONSTRAINT "form_templates_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
