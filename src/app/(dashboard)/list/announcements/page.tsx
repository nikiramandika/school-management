import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { AnnouncementTable } from "./announcement-table";

const AnnouncementListPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Fetch all classes for the form
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
  });

  // ROLE CONDITIONS
  const query: Prisma.AnnouncementWhereInput = {};

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { classId: null },
        {
          class: {
            lessons: {
              some: {
                teacherId: currentUserId!,
              },
            },
          },
        },
      ];
      break;
    case "student":
      query.OR = [
        { classId: null },
        {
          class: {
            students: {
              some: {
                id: currentUserId!,
              },
            },
          },
        },
      ];
      break;
    default:
      break;
  }

  const dataRes = await prisma.announcement.findMany({
    where: query,
    include: {
      class: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  const data = dataRes.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    date: item.date,
    className: item.class?.name,
    classId: item.classId
  }));

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Announcements</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
              <FormContainer 
                table="announcement" 
                type="create" 
                relatedData={{
                  classes,
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <AnnouncementTable 
        data={data} 
        role={role}
        relatedData={{
          classes
        }}
      />
    </div>
  );
};

export default AnnouncementListPage;
