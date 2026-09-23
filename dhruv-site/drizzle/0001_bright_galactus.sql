CREATE TABLE "split"."fx_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"currency" varchar(3) NOT NULL,
	"rate" double precision NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "split"."fx_overrides" ADD CONSTRAINT "fx_overrides_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "split"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fx_overrides_group_currency_idx" ON "split"."fx_overrides" USING btree ("group_id","currency");