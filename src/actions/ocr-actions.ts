"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface CommitFieldValue {
  fieldId: string;
  value: string;
  ocrRawValue?: string;
  isCorrected: boolean;
  correctedFrom?: string;
}

export async function getStageRecordForValidation(stageRecordId: string) {
  return prisma.stageRecord.findUnique({
    where: { id: stageRecordId },
    include: {
      batch: {
        include: {
          product: { select: { name: true, code: true } },
          flavour: { select: { name: true } },
        },
      },
      stage: {
        select: { name: true, order: true, isQcGate: true, productId: true },
      },
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
    },
  });
}

export async function commitOcrData(
  stageRecordId: string,
  fields: CommitFieldValue[]
) {
  const user = await requireAuth();

  const stageRecord = await prisma.stageRecord.findUnique({
    where: { id: stageRecordId },
    include: {
      batch: true,
      stage: { select: { isQcGate: true, productId: true } },
    },
  });

  if (!stageRecord) return { error: "Stage record not found" };

  // Upsert measurements and track corrections
  await prisma.$transaction(async (tx) => {
    for (const f of fields) {
      // Check if measurement already exists
      const existing = await tx.measurement.findFirst({
        where: { stageRecordId, fieldId: f.fieldId },
      });

      if (existing) {
        await tx.measurement.update({
          where: { id: existing.id },
          data: {
            value: f.value,
            isCorrected: f.isCorrected,
            correctedFrom: f.correctedFrom ?? null,
          },
        });
      } else {
        await tx.measurement.create({
          data: {
            stageRecordId,
            fieldId: f.fieldId,
            value: f.value,
            ocrRawValue: f.ocrRawValue ?? null,
            isCorrected: f.isCorrected,
            correctedFrom: f.correctedFrom ?? null,
          },
        });
      }
    }

    // Mark stage record as committed
    await tx.stageRecord.update({
      where: { id: stageRecordId },
      data: {
        committedById: user.id,
        committedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Check for out-of-range values and create alerts
    const flowSnapshot = stageRecord.batch.flowSnapshot as Array<{
      stageId: string;
      fields: Array<{
        fieldId: string;
        name: string;
        labelEn: string;
        fieldType: string;
        minValue: number | null;
        maxValue: number | null;
      }>;
    }>;

    const stageSnapshot = flowSnapshot?.find(
      (s) => s.stageId === stageRecord.stageId
    );

    if (stageSnapshot) {
      for (const f of fields) {
        const fieldDef = stageSnapshot.fields.find(
          (fd) => fd.fieldId === f.fieldId
        );
        if (
          fieldDef &&
          fieldDef.fieldType === "NUMBER" &&
          fieldDef.minValue != null &&
          fieldDef.maxValue != null
        ) {
          const numVal = parseFloat(f.value);
          if (
            !isNaN(numVal) &&
            (numVal < fieldDef.minValue || numVal > fieldDef.maxValue)
          ) {
            await tx.alert.create({
              data: {
                batchId: stageRecord.batchId,
                stageRecordId,
                type: "OUT_OF_RANGE",
                severity: "WARNING",
                message: `${fieldDef.labelEn}: ${f.value} is outside range [${fieldDef.minValue}–${fieldDef.maxValue}]`,
              },
            });
          }
        }
      }
    }

    // If this is a QC gate, set batch status to QC_PENDING
    if (stageRecord.stage.isQcGate) {
      await tx.batch.update({
        where: { id: stageRecord.batchId },
        data: { status: "QC_PENDING" },
      });
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "COMMIT_DATA",
      entityType: "StageRecord",
      entityId: stageRecordId,
      newValue: { fieldCount: fields.length },
    },
  });

  revalidatePath(`/batches/${stageRecord.batchId}`);
  revalidatePath(`/batches/${stageRecord.batchId}/validate`);
  return { success: true };
}
