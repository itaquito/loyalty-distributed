export class ConsulAPIError extends Error {
  constructor() {
    super("Consul API Error");
    this.name = "ConsulAPIError";
  }
}

export class ConsulServiceNotAvailable extends Error {
  constructor() {
    super("Service Not Available");
    this.name = "ConsulServiceNotAvailable";
  }
}
