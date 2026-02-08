import { z } from "zod";

export const batchSchemaWithFlavour = z.object({
  productId: z.string().min(1, "Product is required"),
  flavourId: z.string().min(1, "Flavour is required"),
  supplierId: z.string().optional().or(z.literal("")),
  supplierLot: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const batchSchemaWithoutFlavour = z.object({
  productId: z.string().min(1, "Product is required"),
  flavourId: z.string().optional().or(z.literal("")),
  supplierId: z.string().optional().or(z.literal("")),
  supplierLot: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

// Keep backward compatibility alias
export const batchSchema = batchSchemaWithFlavour;

export type BatchFormValues = z.infer<typeof batchSchemaWithFlavour>;
