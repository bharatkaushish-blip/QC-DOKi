"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { supplierSchema } from "@/lib/validators/supplier";
import { revalidatePath } from "next/cache";

export async function getSuppliers(includeInactive = false) {
  const where = includeInactive ? {} : { active: true };
  return prisma.supplier.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getSupplier(id: string) {
  return prisma.supplier.findUnique({ where: { id } });
}

export async function createSupplier(formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    contactName: formData.get("contactName") as string,
    contactEmail: formData.get("contactEmail") as string,
    contactPhone: formData.get("contactPhone") as string,
    materialType: formData.get("materialType") as string,
    certifications: formData.get("certifications") as string,
  };

  const parsed = supplierSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const supplier = await prisma.supplier.create({
    data: {
      name: data.name,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      materialType: data.materialType || null,
      certifications: data.certifications || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE",
      entityType: "Supplier",
      entityId: supplier.id,
      newValue: data as object,
    },
  });

  revalidatePath("/suppliers");
  return { success: true, id: supplier.id };
}

export async function updateSupplier(id: string, formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name") as string,
    contactName: formData.get("contactName") as string,
    contactEmail: formData.get("contactEmail") as string,
    contactPhone: formData.get("contactPhone") as string,
    materialType: formData.get("materialType") as string,
    certifications: formData.get("certifications") as string,
  };

  const parsed = supplierSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) {
    return { error: { name: ["Supplier not found"] } };
  }

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      name: data.name,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      materialType: data.materialType || null,
      certifications: data.certifications || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "UPDATE",
      entityType: "Supplier",
      entityId: supplier.id,
      oldValue: existing as object,
      newValue: data as object,
    },
  });

  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${id}/edit`);
  return { success: true };
}

export async function toggleSupplierActive(id: string) {
  const user = await requireAuth();

  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) return { error: "Supplier not found" };

  const updated = await prisma.supplier.update({
    where: { id },
    data: { active: !supplier.active },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: supplier.active ? "ARCHIVE" : "RESTORE",
      entityType: "Supplier",
      entityId: id,
      oldValue: { active: supplier.active },
      newValue: { active: updated.active },
    },
  });

  revalidatePath("/suppliers");
  return { success: true };
}
