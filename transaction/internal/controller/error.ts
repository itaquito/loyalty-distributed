export class NotFoundError extends Error {
  constructor() {
    super("Not Found");
    this.name = "NotFoundError";
  }
}

export class CustomerNotFoundError extends Error {
  constructor() {
    super("Customer Not Found");
    this.name = "CustomerNotFoundError";
  }
}
