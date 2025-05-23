"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Class, Subject, Teacher } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowUpDown, Eye } from "lucide-react"
import FormModal from "@/components/FormModal"

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] }

interface TeacherTableProps {
  data: TeacherList[]
  role?: string
}

export function TeacherTable({ data, role }: TeacherTableProps) {
  const router = useRouter()

  const columns: ColumnDef<TeacherList>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: { row: { original: TeacherList } }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-4">
            <Image
              src= "/avatar.png"
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
        )
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
            Teacher ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: { row: { original: TeacherList } }) => (
        <div className="hidden md:table-cell">{row.original.username}</div>
      ),
    },
    {
      accessorKey: "subjects",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hidden md:flex"
          >
            Subjects
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: { row: { original: TeacherList } }) => (
        <div className="hidden md:table-cell">
          {row.original.subjects.map((subject) => subject.name).join(", ")}
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
            className="hidden md:flex"
          >
            Classes
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: { row: { original: TeacherList } }) => (
        <div className="hidden md:table-cell">
          {row.original.classes.map((classItem) => classItem.name).join(", ")}
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
            className="hidden lg:flex"
          >
            Phone
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: { row: { original: TeacherList } }) => (
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
            Address
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: { row: { original: TeacherList } }) => (
        <div className="hidden lg:table-cell">{row.original.address}</div>
      ),
    },
    ...(role === "admin"
      ? [
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }: { row: { original: TeacherList } }) => {
              const item = row.original
              return (
                <div className="flex items-center gap-2">
                  <Link href={`/list/teachers/${item.id}`}>
                    <Button
                      variant="outline"
                      size="icon"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <FormModal table="teacher" type="delete" id={item.id} />
                </div>
              )
            },
          },
        ]
      : []),
  ]

  return <DataTable columns={columns} data={data} searchKey="name" />
} 