import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { EventTable } from "./event-table";

type EventList = Event & { class: Class };

const EventListPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Fetch all classes for the form
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
  });

  // ROLE CONDITIONS
  const query: Prisma.EventWhereInput = {};

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.class = {
        supervisorId: currentUserId!
      };
      break;
    case "student":
      // Students can only see events for their class
      const student = await prisma.student.findUnique({
        where: { id: currentUserId! },
        select: { classId: true }
      });
      if (student) {
        query.classId = student.classId;
      }
      break;
    default:
      break;
  }

  const dataRes = await prisma.event.findMany({
    where: query,
    include: {
      class: {
        select: {
          name: true
        }
      }
    }
  });

  const data = dataRes.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    startTime: item.startTime,
    endTime: item.endTime,
    className: item.class?.name,
    classId: item.classId
  }));

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer 
                table="event" 
                type="create" 
                relatedData={{
                  classes
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <EventTable 
        data={data} 
        role={role}
        relatedData={{
          classes
        }}
      />
    </div>
  );
};

export default EventListPage;
