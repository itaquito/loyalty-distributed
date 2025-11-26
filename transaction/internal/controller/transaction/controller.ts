import type { Repository } from "@service/transaction/internal/repository/postgres/postgres.js";
import type { Transaction, TransactionID } from "@service/transaction/schema";
import type { CustomerID } from "@service/customer/schema";

import { NotFoundError } from "@service/transaction/internal/controller/error.js";

export class Controller {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  async get(transactionID: TransactionID) {
    const transaction = await this.repository.get(transactionID);
    if (!transaction) throw new NotFoundError();

    return transaction;
  }

  async getMany() {
    return await this.repository.getMany();
  }

  async getByCustomerID(customerID: CustomerID) {
    return await this.repository.getByCustomerID(customerID);
  }

  async create(customerID: number, type: "DEPOSIT" | "WITHDRAWAL", quantity: number) {
    return await this.repository.create(customerID, type, quantity);
  }

  async update(transactionID: TransactionID, transaction: Transaction) {
    const existing = await this.repository.get(transactionID);
    if (!existing) throw new NotFoundError();

    return await this.repository.update(transactionID, transaction);
  }

  async delete(transactionID: TransactionID) {
    const wasDeleted = await this.repository.delete(transactionID);

    if (!wasDeleted) throw new NotFoundError()
  }
}
