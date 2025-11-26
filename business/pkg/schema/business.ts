import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

// Zod schemas generated from Drizzle
export const BusinessSchema = createSelectSchema(businesses);
export type Business = z.infer<typeof BusinessSchema>;

export const BusinessIDSchema = z.number().positive();
export type BusinessID = z.infer<typeof BusinessIDSchema>;
