import { z } from "zod";

export const flavourSchema = z.object({
  name: z.string().min(1, "Flavour name is required").max(200),
  code: z
    .string()
    .min(1, "Code is required")
    .max(10)
    .regex(/^[A-Z0-9]+$/, "Code must be uppercase letters/numbers only"),
});

export type FlavourFormValues = z.infer<typeof flavourSchema>;
