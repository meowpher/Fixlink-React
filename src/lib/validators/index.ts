import { z } from "zod";

export const userRoleSchema = z.enum([
  "student",
  "faculty",
  "admin",
  "professional",
  "super_admin",
]);

export const roomTypeSchema = z.enum([
  "class",
  "lab",
  "washroom",
  "faculty",
  "lift",
  "kitchen",
  "canteen",
  "encave",
  "conference",
  "meeting",
]);

export const assetTypeSchema = z.enum([
  "AC",
  "Projector",
  "PC",
  "Light",
  "Bench",
]);

export const ticketStatusSchema = z.enum([
  "open",
  "assigned",
  "in-progress",
  "fixed",
  "cancelled",
]);

export const ticketPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
  "critical",
]);

export const ticketCategorySchema = z.enum([
  "electrical",
  "hvac",
  "it_hardware",
  "furniture",
  "plumbing",
  "civil",
  "cleaning",
  "general",
]);

export const assetStatusSchema = z.enum([
  "operational",
  "degraded",
  "under_maintenance",
  "decommissioned",
]);

// ---------------------------------------------------------------------------
// Form & Mutation Schemas
// ---------------------------------------------------------------------------

export const createTicketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(255),
  description: z.string().min(10, "Please provide more details (min 10 characters)"),
  category: ticketCategorySchema,
  priority: ticketPrioritySchema.default("medium"),
  buildingId: z.string().uuid("Please select a valid building"),
  roomId: z.string().uuid("Invalid room").optional().nullable(),
  assetId: z.string().uuid("Invalid asset").optional().nullable(),
});

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().uuid(),
  status: ticketStatusSchema,
  note: z.string().optional(),
});

export const assignTicketSchema = z.object({
  ticketId: z.string().uuid(),
  assignedTo: z.string().uuid("Select a valid staff/professional"),
});

export const createCommentSchema = z.object({
  ticketId: z.string().uuid(),
  comment: z.string().min(1, "Comment cannot be empty"),
  isInternal: z.boolean().default(false),
});

export const createBuildingSchema = z.object({
  name: z.string().min(2).max(255),
  code: z.string().min(2).max(50),
  campusZone: z.string().max(100).optional().nullable(),
  address: z.string().optional().nullable(),
  totalFloors: z.number().int().min(1).default(8),
});

export const createRoomSchema = z.object({
  buildingId: z.string().uuid(),
  roomNumber: z.string().min(1).max(50),
  floor: z.number().int().min(0).max(7),
  type: roomTypeSchema.default("class"),
  capacity: z.number().int().optional().nullable(),
});

export const createAssetSchema = z.object({
  name: z.string().min(2).max(255),
  assetTag: z.string().min(2).max(100),
  type: assetTypeSchema,
  buildingId: z.string().uuid().optional().nullable(),
  roomId: z.string().uuid().optional().nullable(),
  status: assetStatusSchema.default("operational"),
  modelNumber: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
});
