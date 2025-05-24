"use server";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { LessonTable } from "./lesson-table";

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const query: Prisma.LessonWhereInput = {};

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const data = await prisma.lesson.findMany({
    where: query,
    include: {
      subject: true,
      class: true,
      teacher: true,
    },
  });

  // Fetch all subjects, classes, and teachers for the form
  const [subjects, classes, teachers] = await prisma.$transaction([
    prisma.subject.findMany({
      select: { id: true, name: true },
    }),
    prisma.class.findMany({
      select: { id: true, name: true },
    }),
    prisma.teacher.findMany({
      select: { id: true, name: true, surname: true },
    }),
  ]);

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
              <FormContainer
                table="lesson"
                type="create"
                relatedData={{
                  subjects,
                  classes,
                  teachers,
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <LessonTable
        data={data}
        role={role}
        relatedData={{
          subjects,
          classes,
          teachers,
        }}
      />
    </div>
  );
};

export default LessonListPage;
