import type { CustomerID } from "@service/customer/schema";
import type { Transaction } from "@service/transaction/schema";

import { TransactionSchema } from "@service/transaction/schema";
import { GatewayError } from "../../error.ts";
import { z } from "zod";

export class TransactionGateway {
  private serviceUrl: string;

  constructor(serviceUrl = "http://transaction-service:8080") {
    this.serviceUrl = serviceUrl;
  }

  async getTransactionsByCustomer(customerID: CustomerID): Promise<Transaction[]> {
    const url = new URL(`${this.serviceUrl}/transaction`);
    url.searchParams.set("customerID", `${customerID}`);

    const res = await fetch(url, {
      method: "GET",
    });

    if (!res.ok) throw new GatewayError();

    return z.array(TransactionSchema).parse(await res.json());
  }
}
