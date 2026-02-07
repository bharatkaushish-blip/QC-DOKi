import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(200),
  contactName: z.string().max(200).optional().or(z.literal("")),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().max(50).optional().or(z.literal("")),
  materialType: z.string().max(200).optional().or(z.literal("")),
  certifications: z.string().max(500).optional().or(z.literal("")),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
