export class GatewayError extends Error {
  constructor() {
    super("Gateway Error");
    this.name = "GatewayError";
  }
}
