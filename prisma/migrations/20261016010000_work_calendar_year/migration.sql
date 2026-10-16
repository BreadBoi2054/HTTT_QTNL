CREATE TABLE "WorkCalendarYear" (
  "year" INTEGER NOT NULL,
  "holidays" JSONB NOT NULL,
  "extraWorkdays" JSONB NOT NULL,
  "note" TEXT,
  "updatedBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkCalendarYear_pkey" PRIMARY KEY ("year")
);
