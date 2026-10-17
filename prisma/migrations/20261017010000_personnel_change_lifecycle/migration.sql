-- AlterTable
ALTER TABLE "PersonnelChange"
ADD COLUMN IF NOT EXISTS "employeeId" TEXT,
ADD COLUMN IF NOT EXISTS "fromDeptId" TEXT,
ADD COLUMN IF NOT EXISTS "toDeptId" TEXT,
ADD COLUMN IF NOT EXISTS "newSalary" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "appliedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PersonnelChange_employeeId_idx" ON "PersonnelChange"("employeeId");
CREATE INDEX IF NOT EXISTS "PersonnelChange_status_effectiveDate_idx" ON "PersonnelChange"("status", "effectiveDate");
