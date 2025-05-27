import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role || "";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today

    console.log('Current date:', {
      today: today.toISOString(),
      now: now.toISOString()
    });

    // First, let's check what announcements exist in the database
    const allAnnouncements = await prisma.announcement.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    console.log('All announcements in DB:', allAnnouncements);

    // Then, get the filtered announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        date: {
          gte: today, // Show announcements from today onwards
        },
        // If not admin, only show announcements from the last 24 hours
        ...(role !== "admin" ? {
          date: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours ago from now
          },
        } : {}),
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        class: true, // Include class information
      },
    });

    console.log('Filtered announcements:', announcements);

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
} 