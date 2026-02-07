import { z } from "zod";

export const batchSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  flavourId: z.string().min(1, "Flavour is required"),
  supplierId: z.string().optional().or(z.literal("")),
  supplierLot: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type BatchFormValues = z.infer<typeof batchSchema>;
