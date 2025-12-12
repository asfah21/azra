/*
  Warnings:

  - Made the column `category` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- Update all posts with NULL category to have a default category
UPDATE "Post" 
SET "category" = 'Uncategorized' 
WHERE "category" IS NULL OR "category" = '';

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "category" SET NOT NULL;
