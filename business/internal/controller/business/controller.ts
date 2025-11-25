import type { Repository } from "../../repository/postgres/postgres.ts";
import type { Business, BusinessID } from "../../../pkg/schema/business.ts";

import { NotFoundError } from "../error.ts";

export class Controller {
  private repository: Repository

  constructor(repository: Repository) {
    this.repository = repository;
  }

  async get(businessID: BusinessID) {
    const business = await this.repository.get(businessID);

    if (!business) throw new NotFoundError();
    return business;
  }

  async getMany() {
    return await this.repository.getMany();
  }

  async put(businessID: BusinessID, business: Business) {
    return await this.repository.put(businessID, business);
  }

  async delete(businessID: BusinessID) {
    const wasDeleted = await this.repository.delete(businessID);

    if (!wasDeleted) throw new NotFoundError()
  }
}
