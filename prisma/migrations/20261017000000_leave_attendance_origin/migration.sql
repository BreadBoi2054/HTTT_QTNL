ALTER TABLE "Attendance" ADD COLUMN "leaveRequestId" TEXT;
ALTER TABLE "Attendance" ADD COLUMN "statusBeforeLeave" TEXT;

CREATE INDEX "Attendance_leaveRequestId_idx" ON "Attendance"("leaveRequestId");

ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_leaveRequestId_fkey"
  FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
