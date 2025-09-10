import z from "@zod/zod"

export const CustomerIDSchema = z.number().positive();
export type CustomerID = z.infer<typeof CustomerIDSchema>;

export const CustomerSchema = z.object({
  name: z.string().nonempty(),
})

export type Customer = z.infer<typeof CustomerSchema>;
