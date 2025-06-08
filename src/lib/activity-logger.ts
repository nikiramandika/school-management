import prisma from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

interface LogActivityParams {
  userId: string;
  userRole: string;
  action: ActivityType;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: any;
}

export async function logActivity({
  userId,
  userRole,
  action,
  entityType,
  entityId,
  description,
  metadata,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        userRole,
        action,
        entityType,
        entityId,
        description,
        metadata: metadata ?? undefined,
      },
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

export function getActivityDescription(
  action: ActivityType,
  entityType: string,
  details: string
): string {
  const actionMap = {
    CREATE: "membuat",
    UPDATE: "memperbarui",
    DELETE: "menghapus",
  };

  return `${actionMap[action]} ${entityType.toLowerCase()}: ${details}`;
} 