import type { Repository } from "../../repository/postgres/postgres.ts";
import type { Transaction, TransactionID } from "../../../pkg/schema/transaction.ts";
import type { CustomerGateway } from "../../gateway/customer/http/customer.ts";
import type { CustomerID } from "@service/customer/schema";

import { NotFoundError, CustomerNotFoundError } from "../error.ts";

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

  async put(transactionID: TransactionID, transaction: Transaction) {
    const customer = await this.customerGateway.getCustomer(transaction.customerID);
    if (!customer) throw new CustomerNotFoundError();

    return await this.repository.put(transactionID, transaction);
  }

  async delete(transactionID: TransactionID) {
    const wasDeleted = await this.repository.delete(transactionID);

    if (!wasDeleted) throw new NotFoundError()
  }
}
