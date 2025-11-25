import type { CustomerID, Customer } from "../../../pkg/schema/customer.ts";

import { eq } from "drizzle-orm";
import { db } from "@pkg/db";

import { customers } from "../../../pkg/schema/customer.ts";

export class Repository {
  async get(customerID: CustomerID): Promise<Customer | undefined> {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerID))
      .limit(1);

    return result[0];
  }

  async getMany(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async put(customerID: CustomerID, customer: Customer): Promise<Customer> {
    const result = await db
      .insert(customers)
      .values({
        id: customerID,
        businessID: customer.businessID,
        name: customer.name,
      })
      .onConflictDoUpdate({
        target: customers.id,
        set: {
          businessID: customer.businessID,
          name: customer.name,
        },
      })
      .returning();

    return result[0];
  }

  async delete(customerID: CustomerID): Promise<boolean> {
    const result = await db
      .delete(customers)
      .where(eq(customers.id, customerID));

    return result.rowCount ? result.rowCount > 0 : false;
  }
}
