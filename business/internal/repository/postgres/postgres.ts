import type { BusinessID, Business } from "@service/business/schema";

import { eq } from "drizzle-orm";
import { db } from "@pkg/db";

import { businesses } from "@service/business/schema";

export class Repository {
  async get(businessID: BusinessID): Promise<Business | undefined> {
    const result = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessID))
      .limit(1);

    return result[0];
  }

  getMany(): Promise<Business[]> {
    return db.select().from(businesses);
  }

  async create(businessID: BusinessID, business: Business): Promise<Business | undefined> {
    const result = await db
      .insert(businesses)
      .values({
        id: businessID,
        name: business.name,
      })
      .returning();

    return result[0];
  }

  async update(businessID: BusinessID, business: Business): Promise<Business | undefined> {
    const result = await db
      .update(businesses)
      .set({
        name: business.name,
      })
      .where(eq(businesses.id, businessID))
      .returning();

    return result[0];
  }

  async delete(businessID: BusinessID): Promise<boolean> {
    const result = await db
      .delete(businesses)
      .where(eq(businesses.id, businessID));

    return result.rowCount ? result.rowCount > 0 : false;
  }
}
