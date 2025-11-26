import type { Repository } from "@service/business/internal/repository/postgres/postgres.js";
import type { Business, BusinessID } from "@service/business/schema";

import { NotFoundError } from "@service/business/internal/controller/error.js";

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
