import type { Repository } from "../../repository/memory/memory.ts";
import type { Transaction, TransactionID } from "../../../pkg/model/transaction.ts";

export class Controller {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  get(transactionID: TransactionID) {
    const transaction = this.repository.get(transactionID);

    if (!transaction) throw new NotFoundError();
    return transaction;
  }

  getMany() {
    return this.repository.getMany();
  }

  put(transactionID: TransactionID, transaction: Transaction) {
    return this.repository.put(transactionID, transaction);
  }

  delete(transactionID: TransactionID) {
    const wasDeleted = this.repository.delete(transactionID);

    if (!wasDeleted) throw new NotFoundError()
  }
}
