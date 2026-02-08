import { z } from "zod";

export const flavourSplitSchema = z.object({
  flavourId: z.string().min(1, "Flavour is required"),
  packCount: z.number().int().min(1, "Pack count must be at least 1"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type FlavourSplitFormValues = z.infer<typeof flavourSplitSchema>;
