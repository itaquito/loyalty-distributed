import type { TransactionID, Transaction } from "@service/transaction/schema";
import type { CustomerID } from "@service/customer/schema";

import { eq } from "drizzle-orm";
import { db } from "@pkg/db";

import { transactions } from "@service/transaction/schema";

export class Repository {
  async get(transactionID: TransactionID): Promise<Transaction | undefined> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionID))
      .limit(1);

    return result[0];
  }

  async getMany(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

   getByCustomerID(customerID: CustomerID): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.customerID, customerID));
  }

  async create(customerID: number, type: "DEPOSIT" | "WITHDRAWAL", quantity: number): Promise<Transaction | undefined> {
    const result = await db
      .insert(transactions)
      .values({
        customerID,
        type,
        quantity,
      })
      .returning();

    return result[0];
  }

  async update(transactionID: TransactionID, transaction: Transaction): Promise<Transaction | undefined> {
    const result = await db
      .update(transactions)
      .set({
        customerID: transaction.customerID,
        type: transaction.type,
        quantity: transaction.quantity,
      })
      .where(eq(transactions.id, transactionID))
      .returning();

    return result[0];
  }

  async delete(transactionID: TransactionID): Promise<boolean> {
    const result = await db
      .delete(transactions)
      .where(eq(transactions.id, transactionID));

    return result.rowCount ? result.rowCount > 0 : false;
  }
}
