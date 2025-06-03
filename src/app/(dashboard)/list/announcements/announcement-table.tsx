"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Megaphone,
  FileText,
  Users,
  Calendar,
  Edit,
} from "lucide-react";
import { HiUserGroup } from "react-icons/hi";
import FormModal from "@/components/FormModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { HiUserGroup } from "react-icons/hi";

type AnnouncementList = {
  id: number;
  title: string;
  description: string;
  date: Date;
  className?: string;
};

type AnnouncementTableProps = {
  data: AnnouncementList[];
  role?: string;
  relatedData?: {
    classes: { id: number; name: string }[];
  };
};

export const AnnouncementTable = ({
  data,
  role,
  relatedData,
}: AnnouncementTableProps) => {
  const baseColumns: ColumnDef<AnnouncementList>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
          >
            <Megaphone className="mr-2 h-4 w-4 text-blue-600" />
            Judul
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Megaphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">
              {row.original.title}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <div className="hidden md:flex justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hidden md:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
            >
              <FileText className="mr-2 h-4 w-4 text-teal-600" />
              Deskripsi
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex items-center gap-2">
          <div className="max-w-xs">
            <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {row.original.description}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "className",
      header: ({ column }) => {
        return (
          <div className="hidden md:flex justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hidden md:flex hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
            >
              <HiUserGroup className="mr-2 h-4 w-4 text-purple-600 dark:text-puple-500 dark:text-puple-500" />
              Kelas
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const className = row.getValue("className") as string | undefined;
        return (
          <div className="hidden md:flex justify-center">
            <Badge
              variant="outline"
              className={
                className
                  ? "border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
                  : "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300"
              }
            >
              <HiUserGroup className="mr-1 h-3 w-3" />
              {className ? className : "Semua Kelas"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <div className="hidden md:flex justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hidden lg:flex hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold"
            >
              <Calendar className="mr-2 h-4 w-4 text-cyan-600" />
              Tanggal
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return (
          <div className="hidden lg:flex justify-center">
            <Badge
              variant="outline"
              className="border-indigo-200 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300"
            >
              <Calendar className="mr-1 h-3 w-3" />
              {date.toLocaleDateString()}
            </Badge>
          </div>
        );
      },
    },
  ];

  const adminColumns: ColumnDef<AnnouncementList>[] = [
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center gap-2 font-semibold text-gray-500 dark:text-gray-100">
          <Edit className="h-4 w-4 text-cyan-600" />
          Aksi
        </div>
      ),
      cell: ({ row }) => {
        const announcement = row.original;

        return (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center justify-center">
                    <FormModal
                      table="announcement"
                      type="update"
                      data={announcement}
                      relatedData={relatedData}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Ubah Pengumuman</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center justify-center">
                    <FormModal
                      table="announcement"
                      type="delete"
                      id={announcement.id}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Hapus Pengumuman</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const columns =
    role === "admin" ? [...baseColumns, ...adminColumns] : baseColumns;

  return <DataTable columns={columns} data={data} searchKey="title" />;
};
