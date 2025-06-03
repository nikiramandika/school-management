/*
  Warnings:

  - You are about to drop the column `present` on the `Attendance` table. All the data in the column will be lost.
  - Added the required column `status` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'SICK', 'PERMITTED', 'ABSENT');

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "present",
ADD COLUMN     "status" "AttendanceStatus" NOT NULL;
