"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { flavourSchema } from "@/lib/validators/product";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  return prisma.product.findMany({
    where: { active: true },
    include: {
      flavours: { where: { active: true }, orderBy: { name: "asc" } },
      processStages: {
        where: { active: true },
        orderBy: { order: "asc" },
        include: {
          fields: { where: { active: true }, orderBy: { order: "asc" } },
        },
      },
      _count: {
        select: {
          batches: true,
          flavours: { where: { active: true } },
          processStages: { where: { active: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      flavours: { orderBy: { name: "asc" } },
      processStages: {
        orderBy: { order: "asc" },
        include: {
          fields: { orderBy: { order: "asc" } },
        },
      },
    },
  });
}

export async function createFlavour(productId: string, formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    code: formData.get("code") as string,
  };

  const parsed = flavourSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.flavour.findUnique({
    where: { productId_code: { productId, code: parsed.data.code } },
  });
  if (existing) {
    return { error: { code: ["This code is already used for this product"] } };
  }

  const flavour = await prisma.flavour.create({
    data: {
      productId,
      name: parsed.data.name,
      code: parsed.data.code,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE",
      entityType: "Flavour",
      entityId: flavour.id,
      newValue: parsed.data as object,
    },
  });

  revalidatePath(`/products/${productId}`);
  return { success: true, id: flavour.id };
}

export async function toggleFlavourActive(flavourId: string) {
  const user = await requireAuth();

  const flavour = await prisma.flavour.findUnique({ where: { id: flavourId } });
  if (!flavour) return { error: "Flavour not found" };

  const updated = await prisma.flavour.update({
    where: { id: flavourId },
    data: { active: !flavour.active },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: flavour.active ? "ARCHIVE" : "RESTORE",
      entityType: "Flavour",
      entityId: flavourId,
      oldValue: { active: flavour.active },
      newValue: { active: updated.active },
    },
  });

  revalidatePath(`/products/${flavour.productId}`);
  return { success: true };
}
