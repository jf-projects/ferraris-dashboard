import {
    pgTable,
    uuid,
    varchar,
    serial,
    text,
    timestamp,
    date
} from "drizzle-orm/pg-core";

export const User = pgTable("User", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    type: text("type").notNull(),

    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
});


export const Client = pgTable("Client", {
    id: serial("id").primaryKey(),
    firstName: varchar("firstName", { length: 255 }),
    middleName: varchar("middleName", { length: 255 }),
    lastName: varchar("lastName", { length: 255 }),
    address: varchar("address", { length: 255 }),
    gender: varchar("gender", { length: 50 }),
    civilStatus: varchar("civilStatus", { length: 50 }),
    clientNumber: varchar("clientNumber", { length: 50 }),
    clientLandline: varchar("clientLandline", { length: 50 }),
    spouseFirstName: varchar("spouseFirstName", { length: 255 }),
    spouseMiddleName: varchar("spouseMiddleName", { length: 255 }),
    spouseLastName: varchar("spouseLastName", { length: 255 }),
    bday: date("bday"),
    image: text("image"),
    email: varchar("email", { length: 255 }),
    clientId: text("client_id"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
});