"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Disposition } from "@prisma/client";

interface QcApprovalData {
  batchId: string;
  stageRecordId: string;
  approverName: string;
  result: "APPROVED" | "REJECTED";
  tastePassed?: boolean;
  tasteNotes?: string;
  texturePassed?: boolean;
  textureNotes?: string;
  smellPassed?: boolean;
  smellNotes?: string;
  visualPassed?: boolean;
  visualNotes?: string;
  waterActivity?: number;
  phLevel?: number;
  disposition?: Disposition;
}

export async function submitQcApproval(data: QcApprovalData) {
  const user = await requireAuth();

  const stageRecord = await prisma.stageRecord.findUnique({
    where: { id: data.stageRecordId },
    include: { qcApproval: true },
  });

  if (!stageRecord) return { error: "Stage record not found" };
  if (stageRecord.qcApproval) return { error: "QC approval already submitted" };

  await prisma.$transaction(async (tx) => {
    // Create QC approval record
    await tx.qCApproval.create({
      data: {
        batchId: data.batchId,
        stageRecordId: data.stageRecordId,
        approverName: data.approverName,
        result: data.result,
        tastePassed: data.tastePassed,
        tasteNotes: data.tasteNotes ?? null,
        texturePassed: data.texturePassed,
        textureNotes: data.textureNotes ?? null,
        smellPassed: data.smellPassed,
        smellNotes: data.smellNotes ?? null,
        visualPassed: data.visualPassed,
        visualNotes: data.visualNotes ?? null,
        waterActivity: data.waterActivity ?? null,
        phLevel: data.phLevel ?? null,
        disposition: data.disposition ?? null,
      },
    });

    // Update batch status based on result
    if (data.result === "APPROVED") {
      await tx.batch.update({
        where: { id: data.batchId },
        data: { status: "QC_APPROVED" },
      });
    } else {
      await tx.batch.update({
        where: { id: data.batchId },
        data: { status: "QC_REJECTED" },
      });

      // Create alert for QC failure
      await tx.alert.create({
        data: {
          batchId: data.batchId,
          stageRecordId: data.stageRecordId,
          type: "GATE_FAIL",
          severity: "CRITICAL",
          message: `QC gate failed. Disposition: ${data.disposition ?? "N/A"}. Approver: ${data.approverName}`,
        },
      });
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: `QC_${data.result}`,
      entityType: "QCApproval",
      entityId: data.stageRecordId,
      newValue: {
        result: data.result,
        approverName: data.approverName,
        disposition: data.disposition,
      },
    },
  });

  revalidatePath(`/batches/${data.batchId}`);
  return { success: true };
}

export async function acknowledgeAlert(alertId: string, note?: string) {
  const user = await requireAuth();

  const alert = await prisma.alert.findUnique({ where: { id: alertId } });
  if (!alert) return { error: "Alert not found" };
  if (alert.acknowledgedAt) return { error: "Alert already acknowledged" };

  await prisma.alert.update({
    where: { id: alertId },
    data: {
      acknowledgedById: user.id,
      acknowledgedAt: new Date(),
      acknowledgedNote: note ?? null,
    },
  });

  revalidatePath(`/batches/${alert.batchId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
