import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const liveSessions = pgTable(
  "live_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dateKey: varchar("date_key", { length: 10 }).notNull(),
    locale: varchar("locale", { length: 2 }).notNull(),
    title: text("title").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("draft"),
    activeSection: integer("active_section").notNull().default(0),
    bottomBarVisible: boolean("bottom_bar_visible").notNull().default(true),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("live_sessions_date_locale_unique").on(
      table.dateKey,
      table.locale,
    ),
  ],
);

export const liveSections = pgTable("live_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => liveSessions.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  title: text("title").notNull(),
});

export const liveTasks = pgTable("live_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => liveSections.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  doneAt: timestamp("done_at", { withTimezone: true }),
});

export const liveStackItems = pgTable("live_stack_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => liveSessions.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  label: text("label").notNull(),
});

export const liveBottomBarSegments = pgTable("live_bottom_bar_segments", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => liveSessions.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  kind: varchar("kind", { length: 24 }).notNull(),
  sectionIndex: integer("section_index"),
  title: text("title"),
  text: text("text"),
});
