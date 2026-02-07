"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { stageSchema, fieldSchema } from "@/lib/validators/stage";
import { revalidatePath } from "next/cache";
import { FieldType } from "@prisma/client";

export async function createStage(productId: string, formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    isQcGate: formData.get("isQcGate") === "true",
  };

  const parsed = stageSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Get next order number
  const maxOrder = await prisma.processStage.aggregate({
    where: { productId },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const stage = await prisma.processStage.create({
    data: {
      productId,
      name: parsed.data.name,
      isQcGate: parsed.data.isQcGate,
      order: nextOrder,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE",
      entityType: "ProcessStage",
      entityId: stage.id,
      newValue: { ...parsed.data, order: nextOrder } as object,
    },
  });

  revalidatePath(`/products/${productId}/flow`);
  return { success: true, id: stage.id };
}

export async function updateStage(stageId: string, formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    isQcGate: formData.get("isQcGate") === "true",
  };

  const parsed = stageSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.processStage.findUnique({ where: { id: stageId } });
  if (!existing) return { error: { name: ["Stage not found"] } };

  await prisma.processStage.update({
    where: { id: stageId },
    data: {
      name: parsed.data.name,
      isQcGate: parsed.data.isQcGate,
      version: { increment: 1 },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "UPDATE",
      entityType: "ProcessStage",
      entityId: stageId,
      oldValue: { name: existing.name, isQcGate: existing.isQcGate },
      newValue: parsed.data as object,
    },
  });

  revalidatePath(`/products/${existing.productId}/flow`);
  return { success: true };
}

export async function toggleStageActive(stageId: string) {
  const user = await requireAuth();

  const stage = await prisma.processStage.findUnique({ where: { id: stageId } });
  if (!stage) return { error: "Stage not found" };

  await prisma.processStage.update({
    where: { id: stageId },
    data: { active: !stage.active, version: { increment: 1 } },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: stage.active ? "ARCHIVE" : "RESTORE",
      entityType: "ProcessStage",
      entityId: stageId,
      oldValue: { active: stage.active },
      newValue: { active: !stage.active },
    },
  });

  revalidatePath(`/products/${stage.productId}/flow`);
  return { success: true };
}

export async function createField(stageId: string, formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    labelEn: formData.get("labelEn") as string,
    labelHi: formData.get("labelHi") as string,
    fieldType: formData.get("fieldType") as string,
    unit: formData.get("unit") as string,
    minValue: formData.get("minValue") ? Number(formData.get("minValue")) : null,
    maxValue: formData.get("maxValue") ? Number(formData.get("maxValue")) : null,
    required: formData.get("required") === "true",
    options: formData.get("options") as string,
  };

  const parsed = fieldSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const stage = await prisma.processStage.findUnique({ where: { id: stageId } });
  if (!stage) return { error: { name: ["Stage not found"] } };

  const maxOrder = await prisma.stageField.aggregate({
    where: { stageId },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const field = await prisma.stageField.create({
    data: {
      stageId,
      name: parsed.data.name,
      labelEn: parsed.data.labelEn,
      labelHi: parsed.data.labelHi,
      fieldType: parsed.data.fieldType as FieldType,
      unit: parsed.data.unit || null,
      minValue: parsed.data.minValue ?? null,
      maxValue: parsed.data.maxValue ?? null,
      required: parsed.data.required,
      options: parsed.data.options || null,
      order: nextOrder,
    },
  });

  // Bump stage version
  await prisma.processStage.update({
    where: { id: stageId },
    data: { version: { increment: 1 } },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE",
      entityType: "StageField",
      entityId: field.id,
      newValue: parsed.data as object,
    },
  });

  revalidatePath(`/products/${stage.productId}/flow`);
  return { success: true, id: field.id };
}

export async function updateField(fieldId: string, formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    labelEn: formData.get("labelEn") as string,
    labelHi: formData.get("labelHi") as string,
    fieldType: formData.get("fieldType") as string,
    unit: formData.get("unit") as string,
    minValue: formData.get("minValue") ? Number(formData.get("minValue")) : null,
    maxValue: formData.get("maxValue") ? Number(formData.get("maxValue")) : null,
    required: formData.get("required") === "true",
    options: formData.get("options") as string,
  };

  const parsed = fieldSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.stageField.findUnique({
    where: { id: fieldId },
    include: { stage: true },
  });
  if (!existing) return { error: { name: ["Field not found"] } };

  await prisma.stageField.update({
    where: { id: fieldId },
    data: {
      name: parsed.data.name,
      labelEn: parsed.data.labelEn,
      labelHi: parsed.data.labelHi,
      fieldType: parsed.data.fieldType as FieldType,
      unit: parsed.data.unit || null,
      minValue: parsed.data.minValue ?? null,
      maxValue: parsed.data.maxValue ?? null,
      required: parsed.data.required,
      options: parsed.data.options || null,
    },
  });

  await prisma.processStage.update({
    where: { id: existing.stageId },
    data: { version: { increment: 1 } },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "UPDATE",
      entityType: "StageField",
      entityId: fieldId,
      oldValue: {
        name: existing.name,
        labelEn: existing.labelEn,
        fieldType: existing.fieldType,
      },
      newValue: parsed.data as object,
    },
  });

  revalidatePath(`/products/${existing.stage.productId}/flow`);
  return { success: true };
}

export async function toggleFieldActive(fieldId: string) {
  const user = await requireAuth();

  const field = await prisma.stageField.findUnique({
    where: { id: fieldId },
    include: { stage: true },
  });
  if (!field) return { error: "Field not found" };

  await prisma.stageField.update({
    where: { id: fieldId },
    data: { active: !field.active },
  });

  await prisma.processStage.update({
    where: { id: field.stageId },
    data: { version: { increment: 1 } },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: field.active ? "ARCHIVE" : "RESTORE",
      entityType: "StageField",
      entityId: fieldId,
      oldValue: { active: field.active },
      newValue: { active: !field.active },
    },
  });

  revalidatePath(`/products/${field.stage.productId}/flow`);
  return { success: true };
}
