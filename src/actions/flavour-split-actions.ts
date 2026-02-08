"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { flavourSplitSchema } from "@/lib/validators/flavour-split";
import { DEFERRED_FLAVOUR_PRODUCT_CODES } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function addFlavourSplit(
  batchId: string,
  data: { flavourId: string; packCount: number; notes?: string }
) {
  const user = await requireAuth();

  const parsed = flavourSplitSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { product: { select: { code: true } } },
  });
  if (!batch) return { error: "Batch not found" };

  if (
    !DEFERRED_FLAVOUR_PRODUCT_CODES.includes(
      batch.product.code as (typeof DEFERRED_FLAVOUR_PRODUCT_CODES)[number]
    )
  ) {
    return { error: "Flavour splits only apply to Chicken Chips and Pork Puffs" };
  }

  const split = await prisma.batchFlavourSplit.create({
    data: {
      batchId,
      flavourId: parsed.data.flavourId,
      packCount: parsed.data.packCount,
      notes: parsed.data.notes || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE",
      entityType: "BatchFlavourSplit",
      entityId: split.id,
      newValue: {
        batchId,
        flavourId: parsed.data.flavourId,
        packCount: parsed.data.packCount,
      },
    },
  });

  revalidatePath(`/batches/${batchId}`);
  revalidatePath("/dashboard");
  return { success: true, id: split.id };
}

export async function deleteFlavourSplit(splitId: string) {
  const user = await requireAuth();

  const split = await prisma.batchFlavourSplit.findUnique({
    where: { id: splitId },
    select: { id: true, batchId: true, flavourId: true, packCount: true },
  });
  if (!split) return { error: "Split not found" };

  await prisma.batchFlavourSplit.delete({ where: { id: splitId } });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "DELETE",
      entityType: "BatchFlavourSplit",
      entityId: splitId,
      oldValue: {
        batchId: split.batchId,
        flavourId: split.flavourId,
        packCount: split.packCount,
      },
    },
  });

  revalidatePath(`/batches/${split.batchId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
