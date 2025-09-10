import type { Repository } from "../../repository/memory/memory.ts";
import type { Transaction, TransactionID } from "../../../pkg/model/transaction.ts";
import type { CustomerGateway } from "../../gateway/customer/http/customer.ts";

import { NotFoundError, CustomerNotFoundError } from "../error.ts";

export class Controller {
  private repository: Repository;
  private customerGateway: CustomerGateway;

  constructor(repository: Repository, customerGateway: CustomerGateway) {
    this.repository = repository;
    this.customerGateway = customerGateway;
  }

  async get(transactionID: TransactionID) {
    const transaction = this.repository.get(transactionID);
    if (!transaction) throw new NotFoundError();

    const customer = await this.customerGateway.getCustomer(transaction.customerID);
    if (!customer) throw new CustomerNotFoundError();


    return { ...transaction, customer };
  }

  getMany() {
    return this.repository.getMany();
  }

  async put(transactionID: TransactionID, transaction: Transaction) {
    const customer = await this.customerGateway.getCustomer(transaction.customerID);
    if (!customer) throw new CustomerNotFoundError();

    return this.repository.put(transactionID, transaction);
  }

  delete(transactionID: TransactionID) {
    const wasDeleted = this.repository.delete(transactionID);

    if (!wasDeleted) throw new NotFoundError()
  }
}
