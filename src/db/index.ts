import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment");
}

// Supabase Transaction Pooler (Port 6543) requires disabling prepared statements
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client);

