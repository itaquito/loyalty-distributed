import type { Transaction, TransactionID } from "@service/transaction/schema";

export class Repository {
  private data: Map<TransactionID, Transaction> = new Map();

  get(transactionID: TransactionID) {
    return this.data.get(transactionID);
  }

  getMany() {
    return this.data;
  }

  put(transactionID: TransactionID, transaction: Transaction) {
    return this.data.set(transactionID, transaction);
  }

  delete(transactionID: TransactionID) {
    return this.data.delete(transactionID);
  }
}
