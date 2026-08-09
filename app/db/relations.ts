import { relations } from "drizzle-orm";
import { Client, LotTransaction } from "./schema";

export const clientRelations = relations(Client, ({ many }) => ({
    lotTransactions: many(LotTransaction),
}));

export const lotTransactionRelations = relations(LotTransaction, ({ one }) => ({
    client: one(Client, {
        fields: [LotTransaction.clientId],
        references: [Client.id],
    }),
}));