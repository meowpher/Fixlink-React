import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { buildings, rooms, assets } from "./schema";

async function seed() {
  console.log("🌱 Starting FixLink Campus Seed...");

  // 1. Insert Buildings
  const [bEng, bSci, bLib, bRec] = await db
    .insert(buildings)
    .values([
      {
        name: "Engineering & Applied Sciences Complex",
        code: "ENG",
        campusZone: "North Campus",
        address: "100 Tech Way, Innovation District",
        totalFloors: 4,
      },
      {
        name: "Science & Discovery Research Hall",
        code: "SCI",
        campusZone: "West Campus",
        address: "240 Research Blvd",
        totalFloors: 5,
      },
      {
        name: "University Library & Learning Commons",
        code: "LIB",
        campusZone: "Central Quad",
        address: "15 University Plaza",
        totalFloors: 3,
      },
      {
        name: "Campus Recreation & Aquatic Facility",
        code: "REC",
        campusZone: "South Campus",
        address: "50 Athletics Lane",
        totalFloors: 2,
      },
    ])
    .onConflictDoNothing({ target: buildings.code })
    .returning();

  console.log("✓ Buildings populated");

  // Fetch building records (to ensure we have IDs even if existed)
  const existingBuildings = await db.select().from(buildings);
  const eng = existingBuildings.find((b) => b.code === "ENG")!;
  const sci = existingBuildings.find((b) => b.code === "SCI")!;
  const lib = existingBuildings.find((b) => b.code === "LIB")!;
  const rec = existingBuildings.find((b) => b.code === "REC")!;

  // 2. Insert Rooms
  const insertedRooms = await db
    .insert(rooms)
    .values([
      // Engineering Rooms
      { buildingId: eng.id, roomNumber: "101", floor: 1, type: "lecture_hall", capacity: 120 },
      { buildingId: eng.id, roomNumber: "204", floor: 2, type: "computer_lab", capacity: 45 },
      { buildingId: eng.id, roomNumber: "B02", floor: 0, type: "mechanical_room", capacity: 5 },
      // Science Rooms
      { buildingId: sci.id, roomNumber: "110", floor: 1, type: "chemistry_lab", capacity: 30 },
      { buildingId: sci.id, roomNumber: "305", floor: 3, type: "faculty_office", capacity: 2 },
      { buildingId: sci.id, roomNumber: "R01", floor: 5, type: "rooftop_hvac", capacity: 4 },
      // Library Rooms
      { buildingId: lib.id, roomNumber: "201", floor: 2, type: "silent_study", capacity: 80 },
      { buildingId: lib.id, roomNumber: "105", floor: 1, type: "cafe_restroom", capacity: 6 },
      // Recreation Rooms
      { buildingId: rec.id, roomNumber: "100", floor: 1, type: "gymnasium", capacity: 200 },
      { buildingId: rec.id, roomNumber: "B01", floor: 0, type: "pump_room", capacity: 4 },
    ])
    .returning();

  console.log(`✓ Rooms populated: ${insertedRooms.length} rooms`);

  // 3. Insert Equipment / Assets
  const mechEng = insertedRooms.find((r) => r.buildingId === eng.id && r.type === "mechanical_room");
  const roofSci = insertedRooms.find((r) => r.buildingId === sci.id && r.type === "rooftop_hvac");
  const pumpRec = insertedRooms.find((r) => r.buildingId === rec.id && r.type === "pump_room");

  await db
    .insert(assets)
    .values([
      {
        name: "Central Air Chiller Unit 10-Ton",
        assetTag: "HVAC-ENG-01",
        category: "HVAC",
        buildingId: eng.id,
        roomId: mechEng?.id,
        status: "operational",
        modelNumber: "Carrier AquaForce 30XA",
        serialNumber: "CAR-2023-89912",
      },
      {
        name: "Backup Diesel Emergency Generator 350kVA",
        assetTag: "GEN-ENG-01",
        category: "Electrical",
        buildingId: eng.id,
        roomId: mechEng?.id,
        status: "operational",
        modelNumber: "Cummins C350 D5",
        serialNumber: "CUM-99120-X",
      },
      {
        name: "Rooftop Air Handler Unit 4",
        assetTag: "HVAC-SCI-ROOF",
        category: "HVAC",
        buildingId: sci.id,
        roomId: roofSci?.id,
        status: "degraded",
        modelNumber: "Trane IntelliPak 2",
        serialNumber: "TRN-2021-4402",
      },
      {
        name: "Commercial Water Filtration & Booster Pump",
        assetTag: "PLUMB-REC-PUMP",
        category: "Plumbing",
        buildingId: rec.id,
        roomId: pumpRec?.id,
        status: "operational",
        modelNumber: "Grundfos Hydro MPC",
        serialNumber: "GRUND-887103",
      },
    ])
    .onConflictDoNothing({ target: assets.assetTag });

  console.log("✓ Assets populated");
  console.log("✨ FixLink Campus Facility database seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
