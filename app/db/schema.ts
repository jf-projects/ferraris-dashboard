import {
    uuid,
    date,
    pgTable,
    serial,
    integer,
    varchar,
    text,
    timestamp,
    doublePrecision,
    numeric,
    jsonb,
} from "drizzle-orm/pg-core"

export const User = pgTable("User", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    type: text("type").notNull(),

    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
})

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
})

export const LotTransaction = pgTable("LotTransaction", {
    id: serial("id").primaryKey(),
    clientId: integer("clientId")
        .references(() => Client.id)
        .notNull(),
    propertyUnit: varchar("propertyUnit", { length: 255 }),
    totalPropertySize: integer("totalPropertySize"),
    type: varchar("type", { length: 100 }),
    unitBlock: varchar("unitBlock", { length: 100 }),
    unitLot: varchar("unitLot", { length: 100 }),
    propertyUnitAddress: varchar("propertyUnitAddress", { length: 255 }),
    downpayment: doublePrecision("downpayment"),
    paymentTerms: varchar("paymentTerms", { length: 255 }),
    incrementValues: text("incrementValues"),
    interest: doublePrecision("interest"),
    sqm: doublePrecision("sqm"),
    incrementAmount: doublePrecision("incrementAmount"),
    transactionDate: timestamp("transactionDate"),
    autocompute: integer("autocompute"),
    propertyTotalAmount: doublePrecision("propertyTotalAmount"),
    dueDate: timestamp("dueDate"),
    interestDate: timestamp("interestDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
})

export const Payment = pgTable("Payment", {
    id: serial("id").primaryKey(),
    lotTransactionId: integer("lotTransactionId")
        .references(() => LotTransaction.id)
        .notNull(),
    amount: numeric("amount", {
        precision: 12,
        scale: 2,
    }),
    bank: text("bank"),
    paymentDate: timestamp("paymentDate"),
    remarks: text("remarks"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
})

export const Logs = pgTable("Logs", {
    id: serial("id").primaryKey(),
    userId: uuid("userId")
        .references(() => User.id)
        .notNull(),
    action: varchar("action", {
        length: 20,
    }).notNull(),
    entity: varchar("entity", {
        length: 100,
    }).notNull(),
    modelId: integer("modelId").notNull(),
    changes: jsonb("changes"),
    createdAt: timestamp("createdAt")
        .defaultNow()
        .notNull(),
})