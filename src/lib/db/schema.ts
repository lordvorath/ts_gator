import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
  url: text("url").notNull().unique(),
  lastFetchedAt: timestamp("last_fetched_at"),
  user_id: uuid("user_id").notNull().references(() => users.id, {onDelete: "cascade"} )
});


export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  description: text("description"),
  published_at: timestamp("published_at"),
  feed_id: uuid("feed_id").notNull().references(() => feeds.id, {onDelete: "cascade"})
});


export const feed_follows = pgTable("feed_follows", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  user_id: uuid("user_id").notNull().references(() => users.id, {onDelete: "cascade"}),
  feed_id: uuid("feed_id").notNull().references(() => feeds.id, {onDelete: "cascade"}),
}, (t) => [
  unique().on(t.user_id, t.feed_id)
]);

export type Feed = typeof feeds.$inferSelect; // feeds is the table object in schema.ts
export type User = typeof users.$inferSelect; // users is the table object in schema.ts
export type Post = typeof posts.$inferSelect; // posts is the table object in schema.ts