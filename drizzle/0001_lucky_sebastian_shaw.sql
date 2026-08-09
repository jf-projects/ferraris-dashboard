
CREATE TABLE "Logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"action" varchar(20) NOT NULL,
	"entity" varchar(100) NOT NULL,
	"modelId" integer NOT NULL,
	"changes" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LotTransaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientId" integer NOT NULL,
	"propertyUnit" varchar(255),
	"totalPropertySize" integer,
	"type" varchar(100),
	"unitBlock" varchar(100),
	"unitLot" varchar(100),
	"propertyUnitAddress" varchar(255),
	"downpayment" double precision,
	"paymentTerms" varchar(255),
	"incrementValues" text,
	"interest" double precision,
	"sqm" double precision,
	"incrementAmount" double precision,
	"transactionDate" timestamp,
	"autocompute" integer,
	"propertyTotalAmount" double precision,
	"dueDate" timestamp,
	"interestDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "Payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"lotTransactionId" integer NOT NULL,
	"amount" numeric(12, 2),
	"bank" text,
	"paymentDate" timestamp,
	"remarks" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "Logs" ADD CONSTRAINT "Logs_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LotTransaction" ADD CONSTRAINT "LotTransaction_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_lotTransactionId_LotTransaction_id_fk" FOREIGN KEY ("lotTransactionId") REFERENCES "public"."LotTransaction"("id") ON DELETE no action ON UPDATE no action;