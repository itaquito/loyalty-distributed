import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { businesses } from "@service/business/schema";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  businessID: integer("business_id").notNull().references(() => businesses.id),
  name: text("name").notNull(),
});

// Zod schemas generated from Drizzle
export const CustomerSchema = createSelectSchema(customers);
export type Customer = z.infer<typeof CustomerSchema>;

export const CustomerIDSchema = z.number().positive();
export type CustomerID = z.infer<typeof CustomerIDSchema>;
