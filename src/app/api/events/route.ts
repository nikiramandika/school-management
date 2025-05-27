import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'startDate and endDate parameters are required' }, { status: 400 });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const events = await prisma.event.findMany({
      where: {
        OR: [
          {
            // Events that start during the period
            startTime: {
              gte: start,
              lte: end,
            },
          },
          {
            // Events that end during the period
            endTime: {
              gte: start,
              lte: end,
            },
          },
          {
            // Events that span the entire period
            AND: [
              { startTime: { lte: start } },
              { endTime: { gte: end } },
            ],
          },
        ],
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
} 