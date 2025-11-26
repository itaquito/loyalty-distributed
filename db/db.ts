import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

// Database connection configuration
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Drizzle instance
export const db = drizzle(pool);

// Export pool for advanced usage (e.g., transactions)
export { pool };

// Graceful shutdown helper
export async function closeDatabase(): Promise<void> {
  await pool.end();
}
