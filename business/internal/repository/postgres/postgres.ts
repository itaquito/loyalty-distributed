import type { BusinessID, Business } from "../../../pkg/schema/business.ts";

import { eq } from "drizzle-orm";
import { db } from "@pkg/db";

import { businesses } from "../../../pkg/schema/business.ts";

export class Repository {
  async get(businessID: BusinessID): Promise<Business | undefined> {
    const result = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessID))
      .limit(1);

    return result[0];
  }

  async getMany(): Promise<Business[]> {
    return await db.select().from(businesses);
  }

  async put(businessID: BusinessID, business: Business): Promise<Business> {
    const result = await db
      .insert(businesses)
      .values({
        id: businessID,
        name: business.name,
      })
      .onConflictDoUpdate({
        target: businesses.id,
        set: {
          name: business.name,
        },
      })
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
