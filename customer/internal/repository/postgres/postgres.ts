import type { CustomerID, Customer } from "@service/customer/schema";

import { eq } from "drizzle-orm";
import { db } from "@pkg/db";

import { customers } from "@service/customer/schema";

export class Repository {
  async get(customerID: CustomerID): Promise<Customer | undefined> {
    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerID))
      .limit(1);

    return result[0];
  }

  getMany(): Promise<Customer[]> {
    return db.select().from(customers);
  }

  async create(customerID: CustomerID, customer: Customer): Promise<Customer | undefined> {
    const result = await db
      .insert(customers)
      .values({
        id: customerID,
        businessID: customer.businessID,
        name: customer.name,
      })
      .returning();

    return result[0];
  }

  async update(customerID: CustomerID, customer: Customer): Promise<Customer | undefined> {
    const result = await db
      .update(customers)
      .set({
        businessID: customer.businessID,
        name: customer.name,
      })
      .where(eq(customers.id, customerID))
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
