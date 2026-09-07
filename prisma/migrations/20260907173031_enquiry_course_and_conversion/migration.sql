-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "convertedStudentId" TEXT,
ADD COLUMN     "courseId" TEXT;

-- CreateIndex
CREATE INDEX "Enquiry_courseId_idx" ON "Enquiry"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_organizationId_convertedStudentId_key" ON "Enquiry"("organizationId", "convertedStudentId");

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_organizationId_courseId_fkey" FOREIGN KEY ("organizationId", "courseId") REFERENCES "Course"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_organizationId_convertedStudentId_fkey" FOREIGN KEY ("organizationId", "convertedStudentId") REFERENCES "Student"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

