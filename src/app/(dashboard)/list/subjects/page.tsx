"use server";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { SubjectTable } from "./subject-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SubjectListPage = async () => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const data = await prisma.subject.findMany({
    include: {
      teachers: true,
      lessons: {
        include: {
          class: true,
          teacher: true,
        },
      },
    },
  });

  // Fetch all teachers for the form
  const allTeachers = await prisma.teacher.findMany({
    select: { id: true, name: true, surname: true },
  });

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Daftar Mata Pelajaran
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center">
                      <FormContainer
                        table="subject"
                        type="create"
                        relatedData={{
                          teachers: allTeachers,
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Tambah Mata Pelajaran</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <SubjectTable data={data} role={role} allTeachers={allTeachers} />
    </div>
  );
};

export default SubjectListPage;
