import { z } from "zod";

export const stageSchema = z.object({
  name: z.string().min(1, "Stage name is required").max(200),
  isQcGate: z.boolean().default(false),
});

export type StageFormValues = z.infer<typeof stageSchema>;

export const fieldSchema = z.object({
  name: z.string().min(1, "Field name is required").max(200),
  labelEn: z.string().min(1, "English label is required").max(200),
  labelHi: z.string().min(1, "Hindi label is required").max(200),
  fieldType: z.enum(["NUMBER", "TEXT", "BOOLEAN", "SELECT", "DATETIME"]),
  unit: z.string().max(50).optional().or(z.literal("")),
  minValue: z.coerce.number().optional().nullable(),
  maxValue: z.coerce.number().optional().nullable(),
  required: z.boolean().default(true),
  options: z.string().max(1000).optional().or(z.literal("")),
});

export type FieldFormValues = z.infer<typeof fieldSchema>;

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)),
});
