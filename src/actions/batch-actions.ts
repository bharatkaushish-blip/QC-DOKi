"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { batchSchema } from "@/lib/validators/batch";
import { generateBatchCode } from "@/lib/batch-code";
import { revalidatePath } from "next/cache";
import { BatchStatus } from "@prisma/client";

export async function getBatches(filters?: {
  status?: BatchStatus;
  productId?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.productId) where.productId = filters.productId;

  return prisma.batch.findMany({
    where,
    include: {
      product: { select: { name: true, code: true } },
      flavour: { select: { name: true, code: true } },
      supplier: { select: { name: true } },
      createdBy: { select: { name: true } },
      _count: {
        select: {
          stageRecords: { where: { completedAt: { not: null } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBatchWithDetails(id: string) {
  return prisma.batch.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, code: true } },
      flavour: { select: { id: true, name: true, code: true } },
      supplier: { select: { id: true, name: true } },
      createdBy: { select: { name: true } },
      stageRecords: {
        include: {
          stage: { select: { name: true, order: true, isQcGate: true } },
          measurements: {
            include: {
              field: {
                select: {
                  id: true,
                  name: true,
                  labelEn: true,
                  labelHi: true,
                  fieldType: true,
                  unit: true,
                  minValue: true,
                  maxValue: true,
                  required: true,
                },
              },
            },
          },
          qcApproval: true,
        },
        orderBy: { stage: { order: "asc" } },
      },
      alerts: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function createBatch(formData: FormData) {
  const user = await requireAuth();

  const raw = {
    productId: formData.get("productId") as string,
    flavourId: formData.get("flavourId") as string,
    supplierId: formData.get("supplierId") as string,
    supplierLot: formData.get("supplierLot") as string,
    notes: formData.get("notes") as string,
  };

  const parsed = batchSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  // Get product with process stages for snapshot
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    include: {
      processStages: {
        where: { active: true },
        orderBy: { order: "asc" },
        include: {
          fields: {
            where: { active: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!product) {
    return { error: { productId: ["Product not found"] } };
  }

  if (product.processStages.length === 0) {
    return {
      error: {
        productId: ["Product has no process stages configured. Configure the flow first."],
      },
    };
  }

  const batchCode = await generateBatchCode(product.code);

  // Create flow snapshot
  const flowSnapshot = product.processStages.map((stage) => ({
    stageId: stage.id,
    name: stage.name,
    order: stage.order,
    isQcGate: stage.isQcGate,
    version: stage.version,
    fields: stage.fields.map((field) => ({
      fieldId: field.id,
      name: field.name,
      labelEn: field.labelEn,
      labelHi: field.labelHi,
      fieldType: field.fieldType,
      unit: field.unit,
      minValue: field.minValue,
      maxValue: field.maxValue,
      required: field.required,
      options: field.options,
    })),
  }));

  // Create batch with pre-created stage records in a transaction
  const batch = await prisma.$transaction(async (tx) => {
    const newBatch = await tx.batch.create({
      data: {
        batchCode,
        productId: data.productId,
        flavourId: data.flavourId,
        supplierId: data.supplierId || null,
        supplierLot: data.supplierLot || null,
        notes: data.notes || null,
        createdById: user.id,
        flowSnapshot: flowSnapshot,
        status: "CREATED",
      },
    });

    // Pre-create empty stage records for each stage in the flow
    for (const stage of product.processStages) {
      await tx.stageRecord.create({
        data: {
          batchId: newBatch.id,
          stageId: stage.id,
        },
      });
    }

    return newBatch;
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE",
      entityType: "Batch",
      entityId: batch.id,
      newValue: { batchCode, productId: data.productId, flavourId: data.flavourId },
    },
  });

  revalidatePath("/batches");
  return { success: true, id: batch.id };
}

export async function deleteBatch(batchId: string) {
  const user = await requireAuth();

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) return { error: "Batch not found" };

  // Delete in transaction: measurements → stageRecords → qcApprovals → alerts → batch
  await prisma.$transaction(async (tx) => {
    // Delete measurements for all stage records of this batch
    const stageRecordIds = await tx.stageRecord.findMany({
      where: { batchId },
      select: { id: true },
    });
    const srIds = stageRecordIds.map((sr) => sr.id);

    await tx.measurement.deleteMany({ where: { stageRecordId: { in: srIds } } });
    await tx.qCApproval.deleteMany({ where: { stageRecordId: { in: srIds } } });
    await tx.stageRecord.deleteMany({ where: { batchId } });
    await tx.alert.deleteMany({ where: { batchId } });
    await tx.batch.delete({ where: { id: batchId } });
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "DELETE",
      entityType: "Batch",
      entityId: batchId,
      oldValue: { batchCode: batch.batchCode, status: batch.status },
    },
  });

  revalidatePath("/batches");
  return { success: true };
}

export async function updateBatchStatus(batchId: string, newStatus: BatchStatus) {
  const user = await requireAuth();

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) return { error: "Batch not found" };

  const oldStatus = batch.status;

  await prisma.batch.update({
    where: { id: batchId },
    data: { status: newStatus },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "STATUS_CHANGE",
      entityType: "Batch",
      entityId: batchId,
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
    },
  });

  revalidatePath(`/batches/${batchId}`);
  revalidatePath("/batches");
  return { success: true };
}
