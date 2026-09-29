ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profilePhotoUrl" TEXT;

CREATE TABLE IF NOT EXISTS "address_comments" (
  "id" TEXT NOT NULL,
  "addressId" TEXT NOT NULL,
  "authorId" TEXT,
  "authorName" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "address_comments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "address_comments_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "address_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "address_comments_addressId_createdAt_idx" ON "address_comments"("addressId", "createdAt");
CREATE INDEX IF NOT EXISTS "address_comments_authorId_idx" ON "address_comments"("authorId");
