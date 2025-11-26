import { pgTable, serial, integer, pgEnum } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { customers } from "@service/customer/schema";

// Define transaction type enum at database level
export const transactionTypeEnum = pgEnum("transaction_type", ["DEPOSIT", "WITHDRAWAL"]);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  customerID: integer("customer_id").notNull().references(() => customers.id),
  type: transactionTypeEnum("type").notNull(),
  quantity: integer("quantity").notNull(),
});

// Zod schemas generated from Drizzle
export const TransactionSchema = createSelectSchema(transactions);
export type Transaction = z.infer<typeof TransactionSchema>;

export const TransactionIDSchema = z.number().positive();
export type TransactionID = z.infer<typeof TransactionIDSchema>;
