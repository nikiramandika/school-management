"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Clock,
  User as UserIcon,
  Shield,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ActivityType } from "@prisma/client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ActivityLog = {
  id: number;
  userId: string;
  userRole: string;
  action: ActivityType;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: Date;
  metadata?: any;
};

type ActivityLogTableProps = {
  activityLogs: ActivityLog[];
  role?: string;
};

const getActionColor = (action: ActivityType) => {
  switch (action) {
    case "CREATE":
      return "border-green-200 text-green-700 dark:border-green-700 dark:text-green-300";
    case "UPDATE":
      return "border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300";
    case "DELETE":
      return "border-red-200 text-red-700 dark:border-red-700 dark:text-red-300";
    default:
      return "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300";
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300";
    case "kepala_sekolah":
      return "border-indigo-200 text-indigo-700 dark:border-indigo-700 dark:text-indigo-300";
    case "teacher":
      return "border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300";
    default:
      return "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300";
  }
};

export const ActivityLogTable = ({ activityLogs, role }: ActivityLogTableProps) => {
  const [open, setOpen] = useState(false);
  const [selectedDesc, setSelectedDesc] = useState<string | null>(null);

  const handleDescClick = (desc: string) => {
    setSelectedDesc(desc);
    setOpen(true);
  };

  const baseColumns: ColumnDef<ActivityLog>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold"
        >
          <Clock className="mr-2 h-4 w-4 text-blue-600" />
          Waktu
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">
              {format(new Date(row.original.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "userId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gray-50 dark:hover:bg-gray-900/20 font-semibold"
        >
          <UserIcon className="mr-2 h-4 w-4 text-gray-600" />
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
            <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-white">
              {row.original.userId}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "userRole",
      header: ({ column }) => (
        <div className="hidden md:flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
          >
            <Shield className="mr-2 h-4 w-4 text-purple-600" />
            Peran
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="hidden md:flex justify-center">
          <Badge
            variant="outline"
            className={getRoleColor(row.original.userRole)}
          >
            <Shield className="mr-1 h-3 w-3" />
            {row.original.userRole === "kepala_sekolah" ? "Kepala Sekolah" : 
              row.original.userRole === "teacher" ? "Guru" : 
              row.original.userRole === "admin" ? "Admin" : row.original.userRole}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: ({ column }) => (
        <div className="hidden md:flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold"
          >
            <FileText className="mr-2 h-4 w-4 text-green-600" />
            Aksi
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="hidden md:flex justify-center">
          <Badge
            variant="outline"
            className={getActionColor(row.original.action)}
          >
            <FileText className="mr-1 h-3 w-3" />
            {row.original.action === "CREATE" ? "Membuat" :
              row.original.action === "UPDATE" ? "Mengubah" :
              row.original.action === "DELETE" ? "Menghapus" : row.original.action}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <div className="hidden md:flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
          >
            <FileText className="mr-2 h-4 w-4 text-teal-600" />
            Deskripsi
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="hidden md:flex items-center gap-2">
          <div className="max-w-xs">
            <button
              className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 text-left hover:underline"
              onClick={() => handleDescClick(row.original.description)}
              title="Klik untuk lihat detail"
              style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}
            >
              {row.original.description}
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={baseColumns} data={activityLogs} searchKey="description" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deskripsi Lengkap</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-line break-words text-gray-800 dark:text-gray-100">
            {selectedDesc}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 