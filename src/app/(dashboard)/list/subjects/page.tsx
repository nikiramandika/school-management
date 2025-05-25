"use server"

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { SubjectTable } from "./subject-table";

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.SubjectWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
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

  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teachers: true,
        lessons: {
          include: {
            class: true,
            teacher: true
          }
        }
      },
    }),
    prisma.subject.count({ where: query }),
  ]);

  // Fetch all teachers for the form
  const allTeachers = await prisma.teacher.findMany({
    select: { id: true, name: true, surname: true },
  });

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
              <FormContainer 
                table="subject" 
                type="create" 
                relatedData={{
                  teachers: allTeachers
                }}
              />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <SubjectTable 
        data={data} 
        role={role} 
        allTeachers={allTeachers}
      />
    </div>
  );
};

export default SubjectListPage;
