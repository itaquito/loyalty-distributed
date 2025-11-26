import type { Repository } from "@service/transaction/internal/repository/postgres/postgres.js";
import type { Transaction, TransactionID } from "@service/transaction/schema";
import type { CustomerGateway } from "@service/transaction/internal/gateway/customer/http/customer.js";
import type { CustomerID } from "@service/customer/schema";

import { NotFoundError, CustomerNotFoundError } from "@service/transaction/internal/controller/error.js";

export class Controller {
  private repository: Repository;
  private customerGateway: CustomerGateway;

  constructor(repository: Repository, customerGateway: CustomerGateway) {
    this.repository = repository;
    this.customerGateway = customerGateway;
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

  async create(transactionID: TransactionID, transaction: Transaction) {
    const customer = await this.customerGateway.getCustomer(transaction.customerID);
    if (!customer) throw new CustomerNotFoundError();

    return await this.repository.create(transactionID, transaction);
  }

  async update(transactionID: TransactionID, transaction: Transaction) {
    const existing = await this.repository.get(transactionID);
    if (!existing) throw new NotFoundError();

    const customer = await this.customerGateway.getCustomer(transaction.customerID);
    if (!customer) throw new CustomerNotFoundError();

    return await this.repository.update(transactionID, transaction);
  }

  async delete(transactionID: TransactionID) {
    const wasDeleted = await this.repository.delete(transactionID);

    if (!wasDeleted) throw new NotFoundError()
  }
}
