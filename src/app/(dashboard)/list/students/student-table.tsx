"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Class, Subject, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye } from "lucide-react";
import FormModal from "@/components/FormModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StudentList = Student & { class: Class };

interface StudentTableProps {
  data: StudentList[];
  role?: string;
}

export function StudentTable({ data, role }: StudentTableProps) {
  const columns: ColumnDef<StudentList>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: { original: StudentList } }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-4">
            <Image
              src="/avatar.png"
              alt=""
              width={40}
              height={40}
              className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-xs text-gray-500">{item?.email}</p>
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
            className="hidden md:flex"
          >
            NISN
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: { original: StudentList } }) => (
        <div className="hidden md:table-cell">{row.original.username}</div>
      ),
    },
    {
      accessorKey: "class",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex"
          >
            Kelas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: { original: StudentList } }) => (
        <div className="hidden md:table-cell">{row.original.class.name}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden lg:flex"
          >
            Nomor Hp
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: { original: StudentList } }) => (
        <div className="hidden lg:table-cell">{row.original.phone}</div>
      ),
    },
    {
      accessorKey: "address",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden lg:flex"
          >
            Alamat
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: { row: { original: StudentList } }) => (
        <div className="hidden lg:table-cell">{row.original.address}</div>
      ),
    },
    ...(role === "admin"
      ? [
          {
            id: "actions",
            header: "Aksi",
            cell: ({ row }: { row: { original: StudentList } }) => {
              const item = row.original;
              return (
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/list/students/${item.id}`}>
                          <Button variant="outline" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Lihat Detail Siswa</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center justify-center">
                          <FormModal
                            table="student"
                            type="delete"
                            id={item.id}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Hapus Data Siswa</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return <DataTable columns={columns} data={data} searchKey="name" />;
}
