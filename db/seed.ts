import { db } from "./db.js";
import { businesses } from "@service/business/schema";

async function seed() {
  console.log("Seeding database...");

  try {
    const businessData = [
      { id: 1, name: "Cafetería de café" },
      { id: 2, name: "Cafetería de té" },
      { id: 3, name: "Restaurante de comida" },
      { id: 4, name: "Fondita" },
      { id: 5, name: "Salon de belleza" },
    ];

    for (const business of businessData) {
      await db
        .insert(businesses)
        .values(business)
        .onConflictDoUpdate({
          target: businesses.id,
          set: { name: business.name },
        });

      console.log(`Created/Updated business: ${business.name} (ID: ${business.id})`);
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
