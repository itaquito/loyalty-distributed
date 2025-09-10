import type { Repository } from "../../repository/memory/memory.ts";
import type { Customer, CustomerID } from "../../../pkg/model/customer.ts";

import { NotFoundError } from "../error.ts";

export class Controller {
  private repository: Repository

  constructor(repository: Repository) {
    this.repository = repository;
  }

  get(customerID: CustomerID) {
    const customer = this.repository.get(customerID);

    if (!customer) throw new NotFoundError();
    return customer;
  }

  getMany() {
    return this.repository.getMany();
  }

  put(customerID: CustomerID, customer: Customer) {
    return this.repository.put(customerID, customer);
  }

  delete(customerID: CustomerID) {
    const wasDeleted = this.repository.delete(customerID);

    if (!wasDeleted) throw new NotFoundError()
  }
}
