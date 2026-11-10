import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "./index";
import { buildings, rooms, assets, profiles } from "./schema";
import postgres from "postgres";
import crypto from "crypto";

async function seed() {
  console.log("🏛️  Starting FixLink MIT-WPU Vyas Building Digital Twin Seed...");

  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

  // -------------------------------------------------------------------------
  // 1. Seed Users (Super Admins, Faculty, Student, Professional)
  // -------------------------------------------------------------------------
  console.log("👤 Seeding MIT-WPU Users & Profiles...");

  const userSeeds = [
    {
      email: "taha.piplodwala@mitwpu.edu.in",
      fullName: "Taha Mustafa",
      role: "super_admin" as const,
      department: "School of Computer Science & Engineering",
    },
    {
      email: "om.mahadik@mitwpu.edu.in",
      fullName: "Om Mahadik",
      role: "super_admin" as const,
      department: "School of Computer Science & Engineering",
    },
    {
      email: "dipalee.borse@mitwpu.edu.in",
      fullName: "Prof. Dipalee Borse",
      role: "faculty" as const,
      department: "Department of Information Technology",
    },
    {
      email: "vedant.khedkar@mitwpu.edu.in",
      fullName: "Vedant Khedkar",
      role: "student" as const,
      department: "B.Tech Computer Science & Engineering",
    },
    {
      email: "professional@mitwpu.edu.in",
      fullName: "Ramesh Shinde",
      role: "professional" as const,
      department: "Vyas Facility & Electrical Maintenance",
    },
  ];

  for (const u of userSeeds) {
    // Check if auth user exists
    const existing = await sql`
      SELECT id FROM auth.users WHERE email = ${u.email} LIMIT 1
    `;

    let userId: string;

    if (existing.length > 0) {
      userId = existing[0].id;
      // Update metadata
      await sql`
        UPDATE auth.users
        SET raw_user_meta_data = ${JSON.stringify({ full_name: u.fullName, role: u.role, department: u.department })},
            updated_at = now()
        WHERE id = ${userId}
      `;
    } else {
      userId = crypto.randomUUID();
      // Insert into auth.users (Supabase Auth table)
      // Standard bcrypt hash for password "FixLink@MIT2026"
      const dummyPasswordHash = "$2a$10$vj/13K1a2p1hC1.84N/h5u5wP.bB10Y/gE/dE2/6k21WjM4nF2gSu";
      
      await sql`
        INSERT INTO auth.users (
          id,
          instance_id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at
        ) VALUES (
          ${userId},
          '00000000-0000-0000-0000-000000000000',
          'authenticated',
          'authenticated',
          ${u.email},
          ${dummyPasswordHash},
          now(),
          ${JSON.stringify({ provider: "email", providers: ["email"] })},
          ${JSON.stringify({ full_name: u.fullName, role: u.role, department: u.department })},
          now(),
          now()
        )
      `;
    }

    // Upsert into public.profiles
    await sql`
      INSERT INTO public.profiles (
        id, email, full_name, role, department, is_active, updated_at
      ) VALUES (
        ${userId}, ${u.email}, ${u.fullName}, ${u.role}, ${u.department}, true, now()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        updated_at = now()
    `;
  }

  console.log(`✓ 5 Users & Profiles seeded successfully`);

  // -------------------------------------------------------------------------
  // 2. Seed Single Building: Vyas Building (8 Floors: Level 0 to Level 7)
  // -------------------------------------------------------------------------
  console.log("🏢 Seeding Vyas Building (MIT-WPU)...");

  await sql`
    INSERT INTO public.buildings (name, code, campus_zone, address, total_floors)
    VALUES (
      'Vyas Building',
      'VYAS',
      'MIT-WPU Kothrud Campus',
      'MIT World Peace University, Paud Road, Kothrud, Pune, Maharashtra 411038',
      8
    )
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      total_floors = EXCLUDED.total_floors,
      campus_zone = EXCLUDED.campus_zone,
      address = EXCLUDED.address;
  `;

  const [vyas] = await db
    .select()
    .from(buildings)
    .where(eq(buildings.code, "VYAS"));

  console.log(`✓ Vyas Building initialized (ID: ${vyas.id}, Floors: 8 [Level 0 - Level 7])`);

  // -------------------------------------------------------------------------
  // 3. Seed Realistic Vyas Rooms Mapped to Floors & Types
  // -------------------------------------------------------------------------
  console.log("🚪 Seeding Vyas Building Rooms across all 8 levels...");

  const roomDefinitions = [
    // Level 0 (Ground Floor)
    { roomNumber: "VY001", floor: 0, type: "class" as const, capacity: 70 },
    { roomNumber: "VY002", floor: 0, type: "lab" as const, capacity: 40 },
    { roomNumber: "VY-CANTEEN", floor: 0, type: "canteen" as const, capacity: 120 },
    { roomNumber: "VY-KITCHEN", floor: 0, type: "kitchen" as const, capacity: 8 },
    { roomNumber: "VY-LIFT-G", floor: 0, type: "lift" as const, capacity: 12 },
    { roomNumber: "VY-WR-0", floor: 0, type: "washroom" as const, capacity: 6 },

    // Level 1
    { roomNumber: "VY101", floor: 1, type: "class" as const, capacity: 70 },
    { roomNumber: "VY102", floor: 1, type: "lab" as const, capacity: 45 },
    { roomNumber: "VY-FAC1", floor: 1, type: "faculty" as const, capacity: 16 },
    { roomNumber: "VY-WR-1", floor: 1, type: "washroom" as const, capacity: 6 },

    // Level 2
    { roomNumber: "VY201", floor: 2, type: "class" as const, capacity: 70 },
    { roomNumber: "VY202", floor: 2, type: "lab" as const, capacity: 45 },
    { roomNumber: "VY-ENCAVE", floor: 2, type: "encave" as const, capacity: 35 },
    { roomNumber: "VY-WR-2", floor: 2, type: "washroom" as const, capacity: 6 },

    // Level 3
    { roomNumber: "VY301", floor: 3, type: "class" as const, capacity: 75 },
    { roomNumber: "VY302", floor: 3, type: "lab" as const, capacity: 40 },
    { roomNumber: "VY-CONF3", floor: 3, type: "conference" as const, capacity: 60 },
    { roomNumber: "VY-WR-3", floor: 3, type: "washroom" as const, capacity: 6 },

    // Level 4 (Explicitly requested: VY401 class, VY402 lab, MR4 meeting)
    { roomNumber: "VY401", floor: 4, type: "class" as const, capacity: 70 },
    { roomNumber: "VY402", floor: 4, type: "lab" as const, capacity: 45 },
    { roomNumber: "MR4", floor: 4, type: "meeting" as const, capacity: 14 },
    { roomNumber: "VY-WR-4", floor: 4, type: "washroom" as const, capacity: 6 },

    // Level 5
    { roomNumber: "VY501", floor: 5, type: "class" as const, capacity: 70 },
    { roomNumber: "VY502", floor: 5, type: "lab" as const, capacity: 45 },
    { roomNumber: "VY-FAC5", floor: 5, type: "faculty" as const, capacity: 20 },
    { roomNumber: "VY-WR-5", floor: 5, type: "washroom" as const, capacity: 6 },

    // Level 6
    { roomNumber: "VY601", floor: 6, type: "class" as const, capacity: 70 },
    { roomNumber: "VY602", floor: 6, type: "lab" as const, capacity: 45 },
    { roomNumber: "VY-WR-6", floor: 6, type: "washroom" as const, capacity: 6 },

    // Level 7
    { roomNumber: "VY701", floor: 7, type: "class" as const, capacity: 70 },
    { roomNumber: "MR7", floor: 7, type: "meeting" as const, capacity: 16 },
    { roomNumber: "VY-CONF7", floor: 7, type: "conference" as const, capacity: 100 },
    { roomNumber: "VY-WR-7", floor: 7, type: "washroom" as const, capacity: 6 },
  ];

  const insertedRooms = [];
  for (const r of roomDefinitions) {
    const [inserted] = await db
      .insert(rooms)
      .values({
        buildingId: vyas.id,
        roomNumber: r.roomNumber,
        floor: r.floor,
        type: r.type,
        capacity: r.capacity,
      })
      .returning();
    insertedRooms.push(inserted);
  }

  console.log(`✓ ${insertedRooms.length} Rooms seeded across Level 0 to Level 7`);

  // -------------------------------------------------------------------------
  // 4. Seed Realistic Assets Mapped to Rooms
  // -------------------------------------------------------------------------
  console.log("⚙️  Seeding Assets mapped to Vyas rooms...");

  const vy401 = insertedRooms.find((r) => r.roomNumber === "VY401")!;
  const vy402 = insertedRooms.find((r) => r.roomNumber === "VY402")!;
  const mr4 = insertedRooms.find((r) => r.roomNumber === "MR4")!;
  const vy202 = insertedRooms.find((r) => r.roomNumber === "VY202")!;
  const conf3 = insertedRooms.find((r) => r.roomNumber === "VY-CONF3")!;

  const assetDefinitions = [
    // VY401 (Classroom)
    {
      name: "PRJ-01",
      assetTag: "PRJ-VY401-01",
      type: "Projector" as const,
      roomId: vy401.id,
      status: "operational" as const,
      modelNumber: "Epson EB-E01 XGA 3300 Lumens",
      serialNumber: "EPS-VY401-9981",
    },
    {
      name: "LIGHT-01",
      assetTag: "LGT-VY401-01",
      type: "Light" as const,
      roomId: vy401.id,
      status: "operational" as const,
      modelNumber: "Philips Modular LED 36W",
      serialNumber: "PHL-VY401-L01",
    },
    {
      name: "BENCH-01",
      assetTag: "BNC-VY401-01",
      type: "Bench" as const,
      roomId: vy401.id,
      status: "operational" as const,
      modelNumber: "Godrej Dual Classroom Desk Row 1",
      serialNumber: "GDJ-VY401-B01",
    },

    // VY402 (Computer Lab)
    {
      name: "AC-NORTH",
      assetTag: "AC-VY402-NORTH",
      type: "AC" as const,
      roomId: vy402.id,
      status: "operational" as const,
      modelNumber: "Daikin Inverter Split 2.0 Ton",
      serialNumber: "DKN-VY402-ACN",
    },
    {
      name: "AC-SOUTH",
      assetTag: "AC-VY402-SOUTH",
      type: "AC" as const,
      roomId: vy402.id,
      status: "degraded" as const,
      modelNumber: "Daikin Inverter Split 2.0 Ton",
      serialNumber: "DKN-VY402-ACS",
    },
    {
      name: "PC-01",
      assetTag: "PC-VY402-01",
      type: "PC" as const,
      roomId: vy402.id,
      status: "operational" as const,
      modelNumber: "Dell OptiPlex 7090 Tower i7-11700",
      serialNumber: "DLL-VY402-PC01",
    },
    {
      name: "PC-02",
      assetTag: "PC-VY402-02",
      type: "PC" as const,
      roomId: vy402.id,
      status: "operational" as const,
      modelNumber: "Dell OptiPlex 7090 Tower i7-11700",
      serialNumber: "DLL-VY402-PC02",
    },

    // MR4 (Level 4 Meeting Room)
    {
      name: "AC-MR4",
      assetTag: "AC-MR4-01",
      type: "AC" as const,
      roomId: mr4.id,
      status: "operational" as const,
      modelNumber: "Mitsubishi Heavy 1.5 Ton",
      serialNumber: "MHI-MR4-01",
    },
    {
      name: "PRJ-MR4",
      assetTag: "PRJ-MR4-01",
      type: "Projector" as const,
      roomId: mr4.id,
      status: "operational" as const,
      modelNumber: "BenQ Smart Interactive Board 65",
      serialNumber: "BNQ-MR4-PRJ",
    },

    // VY202 (Lab)
    {
      name: "PC-LAB202-01",
      assetTag: "PC-VY202-01",
      type: "PC" as const,
      roomId: vy202.id,
      status: "operational" as const,
      modelNumber: "HP ProDesk 600 G6",
      serialNumber: "HP-VY202-01",
    },

    // VY-CONF3 (Conference Room)
    {
      name: "PRJ-CONF3",
      assetTag: "PRJ-CONF3-01",
      type: "Projector" as const,
      roomId: conf3.id,
      status: "operational" as const,
      modelNumber: "Sony Laser Projector 5000 Lumens",
      serialNumber: "SNY-CONF3-01",
    },
    {
      name: "AC-CONF3",
      assetTag: "AC-CONF3-01",
      type: "AC" as const,
      roomId: conf3.id,
      status: "operational" as const,
      modelNumber: "Voltas Cassette 3.0 Ton",
      serialNumber: "VLT-CONF3-01",
    },
  ];

  for (const a of assetDefinitions) {
    await db
      .insert(assets)
      .values({
        name: a.name,
        assetTag: a.assetTag,
        type: a.type,
        buildingId: vyas.id,
        roomId: a.roomId,
        status: a.status,
        modelNumber: a.modelNumber,
        serialNumber: a.serialNumber,
      })
      .onConflictDoNothing({ target: assets.assetTag });
  }

  console.log(`✓ ${assetDefinitions.length} Assets mapped to rooms`);

  console.log("\n=======================================================");
  console.log("✨ MIT-WPU Vyas Building Digital Twin Seeded Successfully!");
  console.log("=======================================================\n");

  await sql.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
