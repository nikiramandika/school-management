-- Add academicYear and isActive columns to Class table
ALTER TABLE "Class" 
ADD COLUMN "academicYear" TEXT DEFAULT '2023/2024',
ADD COLUMN "isActive" BOOLEAN DEFAULT true;

-- Update existing records to have default values
UPDATE "Class" 
SET "academicYear" = '2023/2024',
    "isActive" = true
WHERE "academicYear" IS NULL; 