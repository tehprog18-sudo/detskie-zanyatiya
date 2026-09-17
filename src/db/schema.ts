import { pgTable, serial, text, varchar, integer, boolean, timestamp, date, time, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["parent", "admin"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled"]);
export const subscriptionTypeEnum = pgEnum("subscription_type", ["single", "pack4", "pack8", "unlimited"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  role: roleEnum("role").notNull().default("parent"),
  telegramChatId: varchar("telegram_chat_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  birthDate: date("birth_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  shortDescription: varchar("short_description", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  price: integer("price").notNull().default(0),
  duration: integer("duration").notNull().default(120),
  maxSpots: integer("max_spots").notNull().default(8),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduleSlots = pgTable("schedule_slots", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => programs.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  maxSpots: integer("max_spots").notNull().default(8),
  bookedSpots: integer("booked_spots").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  childId: integer("child_id").notNull().references(() => children.id),
  slotId: integer("slot_id").notNull().references(() => scheduleSlots.id),
  status: bookingStatusEnum("status").notNull().default("confirmed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: subscriptionTypeEnum("type").notNull(),
  totalClasses: integer("total_classes").notNull(),
  usedClasses: integer("used_classes").notNull().default(0),
  price: integer("price").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const testDriveRequests = pgTable("test_drive_requests", {
  id: serial("id").primaryKey(),
  parentName: varchar("parent_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  childAge: varchar("child_age", { length: 50 }),
  message: text("message"),
  isProcessed: boolean("is_processed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
