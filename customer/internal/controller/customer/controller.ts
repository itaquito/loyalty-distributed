import type { Repository } from "../../repository/postgres/postgres.ts";
import type { Customer, CustomerID } from "../../../pkg/schema/customer.ts";
import type { BusinessGateway } from "../../gateway/business/http/business.ts";
import type { TransactionGateway } from "../../gateway/transaction/http/transaction.ts";

import { NotFoundError, BusinessNotFoundError } from "../error.ts";

export class Controller {
  private repository: Repository;
  private businessGateway: BusinessGateway;
  private transactionGateway: TransactionGateway;

  constructor(repository: Repository, businessGateway: BusinessGateway, transactionGateway: TransactionGateway) {
    this.repository = repository;
    this.businessGateway = businessGateway;
    this.transactionGateway = transactionGateway;
  }

  async get(customerID: CustomerID) {
    const customer = await this.repository.get(customerID);
    if (!customer) throw new NotFoundError();

    const business = await this.businessGateway.getBusiness(customer.businessID);
    if (!business) throw new BusinessNotFoundError();

    const transactions = await this.transactionGateway.getTransactionsByCustomer(customerID);

    return { ...customer, business, transactions };
  }

  async getMany() {
    return await this.repository.getMany();
  }

  async put(customerID: CustomerID, customer: Customer) {
    const business = await this.businessGateway.getBusiness(customer.businessID);
    if (!business) throw new BusinessNotFoundError();

    return await this.repository.put(customerID, customer);
  }

  async delete(customerID: CustomerID) {
    const wasDeleted = await this.repository.delete(customerID);

    if (!wasDeleted) throw new NotFoundError()
  }
}
