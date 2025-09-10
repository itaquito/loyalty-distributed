import type { CustomerID, Customer } from "../../../pkg/model/customer.ts";

export class Repository {
  private data: Map<CustomerID, Customer> = new Map();

  get(customerID: CustomerID) {
    return this.data.get(customerID);
  }

  getMany() {
    return this.data;
  }

  put(customerID: CustomerID, customer: Customer) {
    return this.data.set(customerID, customer);
  }

  delete(customerID: CustomerID) {
    return this.data.delete(customerID);
  }
}
