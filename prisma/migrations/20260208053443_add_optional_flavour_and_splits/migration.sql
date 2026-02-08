-- DropForeignKey
ALTER TABLE "batches" DROP CONSTRAINT "batches_flavour_id_fkey";

-- AlterTable
ALTER TABLE "batches" ALTER COLUMN "flavour_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "flavour_required" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "batch_flavour_splits" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "flavour_id" TEXT NOT NULL,
    "pack_count" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_flavour_splits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_flavour_id_fkey" FOREIGN KEY ("flavour_id") REFERENCES "flavours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_flavour_splits" ADD CONSTRAINT "batch_flavour_splits_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_flavour_splits" ADD CONSTRAINT "batch_flavour_splits_flavour_id_fkey" FOREIGN KEY ("flavour_id") REFERENCES "flavours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
