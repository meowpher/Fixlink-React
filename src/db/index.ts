import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "";

// Supabase Transaction Pooler (Port 6543) requires disabling prepared statements
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client);
