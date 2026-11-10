import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import postgres from "postgres";

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = postgres(connectionString, { prepare: false });

  console.log("🧹 Purging old tables & enums...");
  await sql.unsafe(`
    DROP TABLE IF EXISTS 
      public.ticket_activity_logs, 
      public.ticket_attachments, 
      public.ticket_comments, 
      public.tickets, 
      public.assets, 
      public.rooms, 
      public.buildings, 
      public.profiles CASCADE;

    DROP TYPE IF EXISTS 
      public.activity_type, 
      public.asset_status, 
      public.asset_type, 
      public.room_type, 
      public.ticket_category, 
      public.ticket_priority, 
      public.ticket_status, 
      public.user_role CASCADE;
  `);

  console.log("🚀 Applying migration 0000 (MIT-WPU Vyas schema)...");
  const file0 = path.join(__dirname, "migrations/0000_tearful_saracen.sql");
  const sql0 = fs.readFileSync(file0, "utf-8");
  await sql.unsafe(sql0);

  console.log("🔒 Applying migration 0001 (RLS policies & triggers)...");
  const file1 = path.join(__dirname, "migrations/0001_auth_rls_policies.sql");
  const sql1 = fs.readFileSync(file1, "utf-8");
  await sql.unsafe(sql1);

  console.log("✅ All migrations applied successfully!");
  await sql.end();
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
