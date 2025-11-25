import type { Repository } from "../../repository/postgres/postgres.ts";
import type { Customer, CustomerID } from "../../../pkg/schema/customer.ts";

import { NotFoundError } from "../error.ts";

export class Controller {
  private repository: Repository

  constructor(repository: Repository) {
    this.repository = repository;
  }

  async get(customerID: CustomerID) {
    const customer = await this.repository.get(customerID);

    if (!customer) throw new NotFoundError();
    return customer;
  }

  async getMany() {
    return await this.repository.getMany();
  }

  async put(customerID: CustomerID, customer: Customer) {
    return await this.repository.put(customerID, customer);
  }

  async delete(customerID: CustomerID) {
    const wasDeleted = await this.repository.delete(customerID);

    if (!wasDeleted) throw new NotFoundError()
  }
}
