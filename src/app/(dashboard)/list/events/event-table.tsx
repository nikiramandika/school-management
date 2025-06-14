"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Calendar,
  FileText,
  Clock,
  Edit,
  CalendarDays,
} from "lucide-react";
import FormModal from "@/components/FormModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Row } from "@tanstack/react-table";

type EventList = {
  id: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
};

type EventTableProps = {
  data: EventList[];
  role?: string;
};

export function EventTable({ data, role }: EventTableProps) {
  const baseColumns: ColumnDef<EventList>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
          >
            <CalendarDays className="mr-2 h-4 w-4 text-blue-600" />
            Judul
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
          >
            <FileText className="mr-2 h-4 w-4 text-teal-600" />
            Deskripsi
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="hidden md:flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300 max-w-xs truncate"
          >
            <FileText className="mr-1 h-3 w-3 flex-shrink-0" />
            <span className="truncate">{row.original.description}</span>
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "startTime",
      header: ({ column }) => {
        return (
          <div className="hidden lg:flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hidden lg:flex hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
            >
              <Clock className="mr-2 h-4 w-4 text-purple-600 dark:text-puple-500" />
              Waktu Mulai
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="hidden lg:flex flex-col items-center gap-1">
          <Badge
            variant="outline"
            className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
          >
            <Calendar className="mr-1 h-3 w-3" />
            {new Date(row.original.startTime).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Badge>
          <Badge
            variant="outline"
            className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
          >
            <Clock className="mr-1 h-3 w-3" />
            {new Date(row.original.startTime).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "endTime",
      header: ({ column }) => {
        return (
          <div className="hidden lg:flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="hidden lg:flex hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
            >
              <Clock className="mr-2 h-4 w-4 text-orange-600" />
              Waktu Berakhir
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="hidden lg:flex flex-col items-center gap-1">
          <Badge
            variant="outline"
            className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300"
          >
            <Calendar className="mr-1 h-3 w-3" />
            {new Date(row.original.endTime).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Badge>
          <Badge
            variant="outline"
            className="border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300"
          >
            <Clock className="mr-1 h-3 w-3" />
            {new Date(row.original.endTime).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Badge>
        </div>
      ),
    },
  ];

  const adminColumns: ColumnDef<EventList>[] = [
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center gap-2 font-semibold text-gray-500 dark:text-gray-100">
          <Edit className="h-4 w-4 text-cyan-600" />
          Aksi
        </div>
      ),
      cell: ({ row }: { row: Row<EventList> }) => {
        const event = row.original;
        return (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center justify-center">
                    <FormModal table="event" type="update" data={event} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Ubah Acara</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center justify-center">
                    <FormModal table="event" type="delete" id={event.id} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Hapus Acara</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const columns =
    role === "admin" || role === "kepala_sekolah" ? [...baseColumns, ...adminColumns] : baseColumns;

  return <DataTable columns={columns} data={data} searchKey={["title", "description", "startTime", "endTime"]} />;
}
