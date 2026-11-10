import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// ENUMS (MIT-WPU FixLink Digital Twin Architecture)
// ---------------------------------------------------------------------------

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "faculty",
  "admin",
  "professional",
  "super_admin",
]);

export const roomTypeEnum = pgEnum("room_type", [
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

export const assetTypeEnum = pgEnum("asset_type", [
  "AC",
  "Projector",
  "PC",
  "Light",
  "Bench",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "assigned",
  "in-progress",
  "fixed",
  "cancelled",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
  "critical",
]);

export const ticketCategoryEnum = pgEnum("ticket_category", [
  "electrical",
  "hvac",
  "it_hardware",
  "furniture",
  "plumbing",
  "civil",
  "cleaning",
  "general",
]);

export const assetStatusEnum = pgEnum("asset_status", [
  "operational",
  "degraded",
  "under_maintenance",
  "decommissioned",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "created",
  "status_changed",
  "assigned",
  "priority_changed",
  "comment_added",
  "fixed",
  "cancelled",
]);

// ---------------------------------------------------------------------------
// TABLES
// ---------------------------------------------------------------------------

/**
 * Profiles table linked 1:1 with Supabase auth.users
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // maps to auth.users.id
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("student").notNull(),
  department: varchar("department", { length: 150 }),
  phone: varchar("phone", { length: 50 }),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Campus Buildings (Vyas Building at MIT-WPU)
 */
export const buildings = pgTable("buildings", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(), // e.g. "VYAS"
  campusZone: varchar("campus_zone", { length: 100 }), // e.g. "MIT-WPU Kothrud"
  address: text("address"),
  totalFloors: integer("total_floors").default(8).notNull(), // Level 0 through Level 7
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Specific Rooms / Spaces inside Vyas Building
 */
export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  buildingId: uuid("building_id")
    .references(() => buildings.id, { onDelete: "cascade" })
    .notNull(),
  roomNumber: varchar("room_number", { length: 50 }).notNull(), // e.g. "VY001", "VY401", "MR4"
  floor: integer("floor").notNull(), // 0 to 7
  type: roomTypeEnum("type").default("class").notNull(),
  capacity: integer("capacity"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Equipment & Digital Twin Assets inside Rooms
 */
export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g. "PRJ-01", "AC-NORTH"
  assetTag: varchar("asset_tag", { length: 100 }).notNull().unique(),
  type: assetTypeEnum("type").notNull(), // 'AC' | 'Projector' | 'PC' | 'Light' | 'Bench'
  buildingId: uuid("building_id").references(() => buildings.id, {
    onDelete: "set null",
  }),
  roomId: uuid("room_id").references(() => rooms.id, {
    onDelete: "set null",
  }),
  status: assetStatusEnum("status").default("operational").notNull(),
  modelNumber: varchar("model_number", { length: 150 }),
  serialNumber: varchar("serial_number", { length: 150 }),
  installedAt: timestamp("installed_at", { withTimezone: true }),
  lastInspectedAt: timestamp("last_inspected_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Maintenance Tickets / Issues reported in Vyas Building
 */
export const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 30 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: ticketCategoryEnum("category").notNull(),
  priority: ticketPriorityEnum("priority").default("medium").notNull(),
  status: ticketStatusEnum("status").default("open").notNull(), // 'open' | 'assigned' | 'in-progress' | 'fixed' | 'cancelled'

  requesterId: uuid("requester_id")
    .references(() => profiles.id, { onDelete: "restrict" })
    .notNull(),
  assignedTo: uuid("assigned_to").references(() => profiles.id, {
    onDelete: "set null",
  }),

  buildingId: uuid("building_id")
    .references(() => buildings.id, { onDelete: "restrict" })
    .notNull(),
  roomId: uuid("room_id").references(() => rooms.id, {
    onDelete: "set null",
  }),
  assetId: uuid("asset_id").references(() => assets.id, {
    onDelete: "set null",
  }),

  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Ticket Comments
 */
export const ticketComments = pgTable("ticket_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id")
    .references(() => tickets.id, { onDelete: "cascade" })
    .notNull(),
  authorId: uuid("author_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  comment: text("comment").notNull(),
  isInternal: boolean("is_internal").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Attachments for Tickets
 */
export const ticketAttachments = pgTable("ticket_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id")
    .references(() => tickets.id, { onDelete: "cascade" })
    .notNull(),
  uploadedBy: uuid("uploaded_by")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Audit / Activity Log for Tickets
 */
export const ticketActivityLogs = pgTable("ticket_activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id")
    .references(() => tickets.id, { onDelete: "cascade" })
    .notNull(),
  actorId: uuid("actor_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  activityType: activityTypeEnum("activity_type").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// RELATIONS
// ---------------------------------------------------------------------------

export const profilesRelations = relations(profiles, ({ many }) => ({
  ticketsRequested: many(tickets, { relationName: "requesterTickets" }),
  ticketsAssigned: many(tickets, { relationName: "assignedTickets" }),
  comments: many(ticketComments),
  attachments: many(ticketAttachments),
  activities: many(ticketActivityLogs),
}));

export const buildingsRelations = relations(buildings, ({ many }) => ({
  rooms: many(rooms),
  assets: many(assets),
  tickets: many(tickets),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  building: one(buildings, {
    fields: [rooms.buildingId],
    references: [buildings.id],
  }),
  assets: many(assets),
  tickets: many(tickets),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  building: one(buildings, {
    fields: [assets.buildingId],
    references: [buildings.id],
  }),
  room: one(rooms, {
    fields: [assets.roomId],
    references: [rooms.id],
  }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  requester: one(profiles, {
    fields: [tickets.requesterId],
    references: [profiles.id],
    relationName: "requesterTickets",
  }),
  assignee: one(profiles, {
    fields: [tickets.assignedTo],
    references: [profiles.id],
    relationName: "assignedTickets",
  }),
  building: one(buildings, {
    fields: [tickets.buildingId],
    references: [buildings.id],
  }),
  room: one(rooms, {
    fields: [tickets.roomId],
    references: [rooms.id],
  }),
  asset: one(assets, {
    fields: [tickets.assetId],
    references: [assets.id],
  }),
  comments: many(ticketComments),
  attachments: many(ticketAttachments),
  activityLogs: many(ticketActivityLogs),
}));

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketComments.ticketId],
    references: [tickets.id],
  }),
  author: one(profiles, {
    fields: [ticketComments.authorId],
    references: [profiles.id],
  }),
}));

export const ticketAttachmentsRelations = relations(
  ticketAttachments,
  ({ one }) => ({
    ticket: one(tickets, {
      fields: [ticketAttachments.ticketId],
      references: [tickets.id],
    }),
    uploader: one(profiles, {
      fields: [ticketAttachments.uploadedBy],
      references: [profiles.id],
    }),
  })
);

export const ticketActivityLogsRelations = relations(
  ticketActivityLogs,
  ({ one }) => ({
    ticket: one(tickets, {
      fields: [ticketActivityLogs.ticketId],
      references: [tickets.id],
    }),
    actor: one(profiles, {
      fields: [ticketActivityLogs.actorId],
      references: [profiles.id],
    }),
  })
);
