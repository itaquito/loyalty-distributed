import z from "@zod/zod"

export const BusinessIDSchema = z.number().positive();
export type BusinessID = z.infer<typeof BusinessIDSchema>;

export const BusinessSchema = z.object({
  name: z.string(),
})

export type Business = z.infer<typeof BusinessSchema>;
