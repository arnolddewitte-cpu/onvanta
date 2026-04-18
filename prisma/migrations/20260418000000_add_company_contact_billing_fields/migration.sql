-- AlterTable
ALTER TABLE "Company"
  ADD COLUMN "contactName"    TEXT,
  ADD COLUMN "contactEmail"   TEXT,
  ADD COLUMN "contactPhone"   TEXT,
  ADD COLUMN "website"        TEXT,
  ADD COLUMN "billingName"    TEXT,
  ADD COLUMN "vatNumber"      TEXT,
  ADD COLUMN "kvkNumber"      TEXT,
  ADD COLUMN "billingAddress" TEXT,
  ADD COLUMN "billingZip"     TEXT,
  ADD COLUMN "billingCity"    TEXT,
  ADD COLUMN "billingCountry" TEXT DEFAULT 'NL';
