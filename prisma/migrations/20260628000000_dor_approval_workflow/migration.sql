-- DOR approval workflow: trainee comment/dispute + supervisor approval
ALTER TABLE "FormResponse" ADD COLUMN "traineeComment" TEXT;
ALTER TABLE "FormResponse" ADD COLUMN "traineeDisputed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FormResponse" ADD COLUMN "traineeDisputeNote" TEXT;
ALTER TABLE "FormResponse" ADD COLUMN "approvedByUserId" INTEGER;
ALTER TABLE "FormResponse" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "FormResponse" ADD COLUMN "approvalNotes" TEXT;

-- Migrate existing REVIEWED status to SIGNED
UPDATE "FormResponse" SET "status" = 'SIGNED' WHERE "status" = 'REVIEWED';
