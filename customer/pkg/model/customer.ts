import z from "@zod/zod"

import { BusinessIDSchema } from "@service/business/model";

export const CustomerIDSchema = z.number().positive();
export type CustomerID = z.infer<typeof CustomerIDSchema>;

export const CustomerSchema = z.object({
  businessID: BusinessIDSchema,
  name: z.string().nonempty(),
})

export type Customer = z.infer<typeof CustomerSchema>;
