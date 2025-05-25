"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Subject, Teacher } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Users, BookOpen } from "lucide-react"
import FormModal from "@/components/FormModal"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type SubjectList = Subject & { 
  teachers: Teacher[];
  lessons: {
    id: number;
    name: string;
    class: {
      id: number;
      name: string;
    };
    teacher: {
      id: string;
      name: string;
      surname: string;
    };
  }[];
};

type SubjectTableProps = {
  data: SubjectList[];
  role?: string;
  allTeachers: { id: string; name: string; surname: string }[];
};

export function SubjectTable({ data, role, allTeachers }: SubjectTableProps) {
  const columns: ColumnDef<SubjectList>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-semibold"
          >
            Subject Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium text-primary">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "teachers",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex font-semibold"
          >
            <Users className="mr-2 h-4 w-4" />
            Teachers
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const teachers = row.original.teachers;
        const displayTeachers = teachers.slice(0, 2);
        const remainingTeachers = teachers.length - 2;

        return (
          <div className="hidden md:table-cell">
            <div className="flex flex-wrap items-center gap-1.5">
              {displayTeachers.map((teacher) => (
                <TooltipProvider key={teacher.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">
                        {teacher.name} {teacher.surname}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to view teacher details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {remainingTeachers > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 px-2 hover:bg-secondary/80"
                    >
                      +{remainingTeachers} more
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Teachers for {row.original.name}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-2">
                        {teachers.map((teacher) => (
                          <div 
                            key={teacher.id} 
                            className="flex items-center justify-between rounded-lg border p-3 hover:bg-secondary/50 transition-colors"
                          >
                            <div>
                              <div className="font-medium">{teacher.name} {teacher.surname}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "lessons",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex font-semibold"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Lessons
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const lessons = row.original.lessons;
        const displayLessons = lessons.slice(0, 2);
        const remainingLessons = lessons.length - 2;

        return (
          <div className="hidden md:table-cell">
            <div className="flex flex-col gap-1.5">
              {displayLessons.map((lesson) => (
                <TooltipProvider key={lesson.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="w-fit cursor-help"
                      >
                        {lesson.name} - {lesson.class.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Teacher: {lesson.teacher.name} {lesson.teacher.surname}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {remainingLessons > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 px-2 hover:bg-secondary/80"
                    >
                      +{remainingLessons} more lessons
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Lessons for {row.original.name}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-2">
                        {lessons.map((lesson) => (
                          <div 
                            key={lesson.id} 
                            className="rounded-lg border p-3 hover:bg-secondary/50 transition-colors"
                          >
                            <div className="font-medium">{lesson.name}</div>
                            <Separator className="my-2" />
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Class:</span>
                                {lesson.class.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Teacher:</span>
                                {lesson.teacher.name} {lesson.teacher.surname}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const subject = row.original;
        return (
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal 
                  table="subject" 
                  type="update" 
                  data={subject}
                  relatedData={{
                    teachers: allTeachers
                  }}
                />
                <FormModal table="subject" type="delete" id={subject.id} />
              </>
            )}
          </div>
        )
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="name" />;
}
