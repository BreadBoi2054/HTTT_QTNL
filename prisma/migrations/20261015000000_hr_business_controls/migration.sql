ALTER TABLE "EmployeeProfile"
ADD COLUMN IF NOT EXISTS "dependentCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "SurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "respondentKey" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SurveyResponse_surveyId_respondentKey_key"
ON "SurveyResponse"("surveyId", "respondentKey");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SurveyResponse_surveyId_fkey'
  ) THEN
    ALTER TABLE "SurveyResponse"
    ADD CONSTRAINT "SurveyResponse_surveyId_fkey"
    FOREIGN KEY ("surveyId") REFERENCES "Survey"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
