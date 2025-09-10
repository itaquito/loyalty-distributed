export class ConsulAPIError extends Error {
  constructor() {
    super("Consul API Error");
    this.name = "ConsulAPIError";
  }
}
