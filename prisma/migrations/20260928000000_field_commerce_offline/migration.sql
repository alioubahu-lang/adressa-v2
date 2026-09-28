-- Additive migration for the field collection workflow.
-- Existing addresses keep their current values and remain valid.
ALTER TABLE "addresses"
  ADD COLUMN IF NOT EXISTS "businessPhotoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "platePhotoUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "occupancyType" TEXT,
  ADD COLUMN IF NOT EXISTS "businessName" TEXT,
  ADD COLUMN IF NOT EXISTS "businessCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "businessNinea" TEXT,
  ADD COLUMN IF NOT EXISTS "businessRegister" TEXT,
  ADD COLUMN IF NOT EXISTS "plateStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "gpsAccuracyMeters" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "clientRequestId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "addresses_clientRequestId_key"
  ON "addresses"("clientRequestId");
CREATE INDEX IF NOT EXISTS "addresses_occupancyType_idx"
  ON "addresses"("occupancyType");
CREATE INDEX IF NOT EXISTS "addresses_businessCategory_idx"
  ON "addresses"("businessCategory");
