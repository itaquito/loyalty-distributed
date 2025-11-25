import type { TransactionID, Transaction } from "../../../pkg/schema/transaction.ts";
import type { CustomerID } from "@service/customer/schema";

import { eq } from "drizzle-orm";
import { db } from "@pkg/db";

import { transactions } from "../../../pkg/schema/transaction.ts";

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

  async getByCustomerID(customerID: CustomerID): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.customerID, customerID));
  }

  async put(transactionID: TransactionID, transaction: Transaction): Promise<Transaction> {
    const result = await db
      .insert(transactions)
      .values({
        id: transactionID,
        customerID: transaction.customerID,
        type: transaction.type,
        quantity: transaction.quantity,
      })
      .onConflictDoUpdate({
        target: transactions.id,
        set: {
          customerID: transaction.customerID,
          type: transaction.type,
          quantity: transaction.quantity,
        },
      })
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
