"use server";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { AnnouncementTable } from "./announcement-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Users, BookOpen, Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AnnouncementListPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Fetch all classes for the form
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
  });

  // ROLE CONDITIONS
  const query: Prisma.AnnouncementWhereInput = {};

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { classId: null },
        {
          class: {
            lessons: {
              some: {
                teacherId: currentUserId!,
              },
            },
          },
        },
      ];
      break;
    case "student":
      query.OR = [
        { classId: null },
        {
          class: {
            students: {
              some: {
                id: currentUserId!,
              },
            },
          },
        },
      ];
      break;
    default:
      break;
  }

  const dataRes = await prisma.announcement.findMany({
    where: query,
    include: {
      class: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const data = dataRes.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    date: item.date,
    className: item.class?.name,
    classId: item.classId,
  }));

  // Calculate stats
  const totalAnnouncements = data.length;
  const totalGeneral = data.filter(announcement => !announcement.classId).length;
  const totalClass = data.filter(announcement => announcement.classId).length;
  const totalToday = data.filter(announcement => {
    const today = new Date();
    const announcementDate = new Date(announcement.date);
    return announcementDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="bg-card p-4 rounded-md flex-1 m-0 mt-0">
      <div className="container mx-auto p-6 space-y-8">
        {/* Conditional Header Section - Only show management header for admin */}
        {role === "admin" && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Manajemen Pengumuman
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center">
                      <FormContainer
                        table="announcement"
                        type="create"
                        relatedData={{
                          classes,
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Tambah Pengumuman</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Stats Cards - Only show for admin */}
        {role === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Pengumuman
                    </p>
                    <p className="text-3xl font-bold">{totalAnnouncements}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Megaphone className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Pengumuman Umum
                    </p>
                    <p className="text-3xl font-bold">{totalGeneral}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      Pengumuman Kelas
                    </p>
                    <p className="text-3xl font-bold">{totalClass}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">
                      Hari Ini
                    </p>
                    <p className="text-3xl font-bold">{totalToday}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Announcements Table Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Megaphone className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Daftar Pengumuman
            </h1>
            <Badge variant="secondary" className="ml-2">
              {totalAnnouncements} Pengumuman
            </Badge>
          </div>

          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 rounded-xl">
            <CardContent className="p-5 bg-gray-100 dark:bg-slate-700 rounded-xl">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-600 p-4">
                <AnnouncementTable
                  data={data}
                  role={role}
                  relatedData={{
                    classes,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementListPage;