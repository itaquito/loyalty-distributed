export class NotFoundError extends Error {
  constructor() {
    super("Not Found");
    this.name = "NotFoundError";
  }
}

export class BusinessNotFoundError extends Error {
  constructor() {
    super("Business Not Found");
    this.name = "BusinessNotFoundError";
  }
}
