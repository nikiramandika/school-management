"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Class, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Eye,
  User,
  BookOpen,
  GraduationCap,
  Phone,
  MapPin,
  UserCheck,
  Edit,
} from "lucide-react";
import FormModal from "@/components/FormModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { HiAcademicCap, HiCollection } from "react-icons/hi";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

interface TeacherTableProps {
  data: TeacherList[];
  role?: string;
}

export function TeacherTable({ data, role }: TeacherTableProps) {
  const baseColumns: ColumnDef<TeacherList>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20 font-semibold"
          >
            <User className="mr-2 h-4 w-4 text-cyan-600" />
            Nama
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: { original: TeacherList } }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <Image
              src="/avatar.png"
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-white">
                {item.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item?.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
          >
            <HiAcademicCap className="mr-2 h-4 w-4 text-teal-600" />
            NIP
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex justify-center">
          <div className="hidden md:flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300 text-xs"
            >
              <HiAcademicCap className="mr-1 h-3 w-3" />
              {row.original.username}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "subjects",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
          >
            <HiBookOpen className="mr-2 h-4 w-4 text-purple-600 dark:text-puple-500" />
            Mata Pelajaran
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: { original: TeacherList } }) => (
        <div className="hidden md:flex flex-wrap gap-1">
          {row.original.subjects.slice(0, 2).map((subject, index) => (
            <Badge
              key={subject.id}
              variant="outline"
              className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300 text-xs"
            >
              <HiBookOpen className="mr-1 h-3 w-3" />
              {subject.name}
            </Badge>
          ))}
          {row.original.subjects.length > 2 && (
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-xs"
            >
              +{row.original.subjects.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "classes",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
          >
            <HiCollection className="mr-2 h-4 w-4 text-orange-600" />
            Kelas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex justify-center">
          <div className="hidden md:flex flex-wrap gap-1">
            {row.original.classes.slice(0, 2).map((classItem, index) => (
              <Badge
                key={classItem.id}
                variant="outline"
                className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300 text-xs"
              >
                <HiCollection className="mr-1 h-3 w-3" />
                {classItem.name}
              </Badge>
            ))}
            {row.original.classes.length > 2 && (
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-xs"
              >
                +{row.original.classes.length - 2}
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden lg:flex hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold"
          >
            <Phone className="mr-2 h-4 w-4 text-indigo-500" />
            Nomor Hp
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex justify-center">
          <div className="hidden lg:flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-indigo-200 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300 text-xs"
            >
              <Phone className="mr-1 h-3 w-3" />
              {row.original.phone}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden lg:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
          >
            <MapPin className="mr-2 h-4 w-4 text-teal-600" />
            Alamat
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: { original: TeacherList } }) => (
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-2 max-w-[200px]">
            <MapPin className="h-3 w-3 text-teal-600 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {row.original.address}
            </span>
          </div>
        </div>
      ),
    },
  ];

  const adminColumns: ColumnDef<TeacherList>[] = [
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center gap-2 font-semibold text-gray-500 dark:text-gray-100">
          <Edit className="h-4 w-4 text-cyan-500" />
          Aksi
        </div>
      ),
      cell: ({ row }: { row: { original: TeacherList } }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/list/teachers/${item.id}`}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:bg-cyan-50 hover:border-cyan-200 dark:hover:bg-cyan-900/20"
                    >
                      <Eye className="h-4 w-4 text-cyan-600" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Lihat Detail Guru</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center justify-center">
                    <FormModal table="teacher" type="delete" id={item.id} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Hapus Data Guru</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const columns =
    role === "admin" ? [...baseColumns, ...adminColumns] : baseColumns;

  return <DataTable columns={columns} data={data} searchKey="name" />;
}
