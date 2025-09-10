import z from "@zod/zod"

import { CustomerIDSchema } from "@service/customer/model";

export const TransactionIDSchema = z.number().positive();
export type TransactionID = z.infer<typeof TransactionIDSchema>;

export const TransactionSchema = z.object({
  customerID: CustomerIDSchema,
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
  quantity: z.number().positive()
})

export type Transaction = z.infer<typeof TransactionSchema>;
