-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "address" TEXT;

-- CreateTable
CREATE TABLE "EnquiryNote" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnquiryNote_organizationId_idx" ON "EnquiryNote"("organizationId");

-- CreateIndex
CREATE INDEX "EnquiryNote_enquiryId_idx" ON "EnquiryNote"("enquiryId");

-- CreateIndex
CREATE INDEX "EnquiryNote_createdAt_idx" ON "EnquiryNote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_organizationId_id_key" ON "User"("organizationId", "id");

-- AddForeignKey
ALTER TABLE "EnquiryNote" ADD CONSTRAINT "EnquiryNote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryNote" ADD CONSTRAINT "EnquiryNote_organizationId_enquiryId_fkey" FOREIGN KEY ("organizationId", "enquiryId") REFERENCES "Enquiry"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryNote" ADD CONSTRAINT "EnquiryNote_organizationId_authorId_fkey" FOREIGN KEY ("organizationId", "authorId") REFERENCES "User"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Backfill: the single overwritable "notes" column becomes the first entry of
-- each enquiry's timeline. Runs after EnquiryNote exists and before the column
-- is dropped, so no note text is lost.
INSERT INTO "EnquiryNote" ("id", "organizationId", "enquiryId", "authorId", "body", "createdAt")
SELECT
    md5(random()::text || clock_timestamp()::text),
    "organizationId",
    "id",
    NULL,
    "notes",
    "createdAt"
FROM "Enquiry"
WHERE "notes" IS NOT NULL AND btrim("notes") <> '';

-- AlterTable
ALTER TABLE "Enquiry" DROP COLUMN "notes";
