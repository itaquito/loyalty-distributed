import {ServiceAddressResponseSchema} from "./model.ts";

export class ConsulRegistry {
  private readonly consulBaseURL: string;
  private readonly instanceID: string;
  private readonly checkID: string;

  constructor(consulBaseURL: string) {
    this.consulBaseURL = consulBaseURL;

    this.instanceID = crypto.randomUUID();
    this.checkID = `check-${this.instanceID}`;
  }

  async register(serviceName: string, address: string, port: number) {
    const res = await fetch(`${this.consulBaseURL}/v1/agent/service/register`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "ID": this.instanceID,
        "Name": serviceName,
        "Address": address,
        "Port": port,
        "Check": {
          "Name": "web-ttl",
          "CheckID": this.checkID,
          "TTL": "5s",
          "DeregisterCriticalServiceAfter": "10m"
        }
      })
    });

    if (!res.ok) throw new Error(`Something went wrong while trying to register a service: ${res.status} ${res.statusText}`);

    return this.instanceID;
  }

  async deregister() {
    const res = await fetch(`${this.consulBaseURL}/v1/agent/service/deregister/${this.instanceID}`, {
      method: "PUT",
    });

    if (!res.ok) throw new Error(`Something went wrong while trying to deregister aThank service: ${res.status} ${res.statusText}`);
  }

  async reportHealthyState() {
    const url = new URL(`${this.consulBaseURL}/v1/agent/check/pass/${this.checkID}`);
    url.searchParams.set("note", `OK at ${new Date().toISOString()}`);

    const res = await fetch(url, {
      method: "PUT",
    });

    if (!res.ok) throw new Error(`Something went wrong while trying to report healthy state of service: ${res.status} ${res.statusText}`);
  }

  async serviceAddress(serviceName: string) {
    const url = new URL(`${this.consulBaseURL}/v1/health/service/${serviceName}`);
    url.searchParams.set("passing", "true");

    const res = await fetch(url, {
      method: "GET",
    });

    const parsedResponse = ServiceAddressResponseSchema.parse(await res.json());

    return parsedResponse.map((serviceAddress) => (
      {
        id: serviceAddress.Service.ID,
        address: serviceAddress.Service.Address,
        port: serviceAddress.Service.Port,
      }
    ));

  }
}
