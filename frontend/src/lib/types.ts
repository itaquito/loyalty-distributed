export interface Business {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  customerID: number;
  type: "DEPOSIT" | "WITHDRAWAL";
  quantity: number;
}

export interface Customer {
  id: number;
  businessID: number;
  name: string;
  business?: Business;
  transactions?: Transaction[];
}
