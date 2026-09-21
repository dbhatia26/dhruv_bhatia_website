CREATE SCHEMA "split";
--> statement-breakpoint
CREATE TABLE "split"."expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"description" text NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(3) NOT NULL,
	"fx_rate" double precision NOT NULL,
	"base_amount_minor" bigint NOT NULL,
	"paid_by" uuid NOT NULL,
	"split" jsonb NOT NULL,
	"date" date NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "split"."groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"secret" text NOT NULL,
	"name" text NOT NULL,
	"base_currency" varchar(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "split"."members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "split"."settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"from_member" uuid NOT NULL,
	"to_member" uuid NOT NULL,
	"amount_minor" bigint NOT NULL,
	"date" date NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "split"."expenses" ADD CONSTRAINT "expenses_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "split"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split"."expenses" ADD CONSTRAINT "expenses_paid_by_members_id_fk" FOREIGN KEY ("paid_by") REFERENCES "split"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split"."expenses" ADD CONSTRAINT "expenses_created_by_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "split"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split"."members" ADD CONSTRAINT "members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "split"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split"."settlements" ADD CONSTRAINT "settlements_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "split"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split"."settlements" ADD CONSTRAINT "settlements_from_member_members_id_fk" FOREIGN KEY ("from_member") REFERENCES "split"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split"."settlements" ADD CONSTRAINT "settlements_to_member_members_id_fk" FOREIGN KEY ("to_member") REFERENCES "split"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split"."settlements" ADD CONSTRAINT "settlements_created_by_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "split"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expenses_group_idx" ON "split"."expenses" USING btree ("group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "groups_secret_idx" ON "split"."groups" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "members_group_idx" ON "split"."members" USING btree ("group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "members_group_name_idx" ON "split"."members" USING btree ("group_id",lower("name"));--> statement-breakpoint
CREATE INDEX "settlements_group_idx" ON "split"."settlements" USING btree ("group_id");