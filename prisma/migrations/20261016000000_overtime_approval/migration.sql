CREATE TABLE "OvertimeRequest" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "hours" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "reason" TEXT,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OvertimeRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OvertimeRequest_employeeId_date_key" ON "OvertimeRequest"("employeeId", "date");
CREATE INDEX "OvertimeRequest_status_date_idx" ON "OvertimeRequest"("status", "date");
ALTER TABLE "OvertimeRequest" ADD CONSTRAINT "OvertimeRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
