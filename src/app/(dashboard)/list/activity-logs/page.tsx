"use server";

import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ActivityLogTable } from "./activity-log-table";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Plus, FileText, Shield, User } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/badge";

export default async function ActivityLogsPage() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const activityLogs = await prisma.activityLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100, // Limit to last 100 logs
  });

  // Calculate stats
  const totalLogs = activityLogs.length;
  const totalCreate = activityLogs.filter(
    (log) => log.action === "CREATE"
  ).length;
  const totalUpdate = activityLogs.filter(
    (log) => log.action === "UPDATE"
  ).length;
  const totalDelete = activityLogs.filter(
    (log) => log.action === "DELETE"
  ).length;
  const totalToday = activityLogs.filter((log) => {
    const today = new Date();
    const logDate = new Date(log.createdAt);
    return logDate.toDateString() === today.toDateString();
  }).length;

  const teacherIds = activityLogs
    .filter((log) => log.userRole === "teacher")
    .map((log) => log.userId);
  const uniqueTeacherIds = Array.from(new Set(teacherIds));
  let teacherNames: Record<string, string> = {};
  if (uniqueTeacherIds.length > 0) {
    const teachers = await prisma.teacher.findMany({
      where: { id: { in: uniqueTeacherIds } },
      select: { id: true, name: true, surname: true },
    });
    teacherNames = Object.fromEntries(
      teachers.map((t) => [t.id, `${t.name} ${t.surname}`])
    );
  }

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        {/* Conditional Header Section - Only show management header for admin and kepala_sekolah */}
        {(role === "admin" || role === "kepala_sekolah") && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Manajemen Log Aktivitas
                  </h2>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Only show for admin and kepala_sekolah */}
        {(role === "admin" || role === "kepala_sekolah") && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r bg-cyan-500 text-white border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">
                      Total Log
                    </p>
                    <p className="text-3xl font-bold">{totalLogs}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyan-500 text-white border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">
                      Hari Ini
                    </p>
                    <p className="text-3xl font-bold">{totalToday}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r bg-cyan-500 text-white border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">
                      Pembuatan
                    </p>
                    <p className="text-3xl font-bold">{totalCreate}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Plus className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyan-500 text-white border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm font-medium">
                      Perubahan
                    </p>
                    <p className="text-3xl font-bold">
                      {totalUpdate + totalDelete}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Shield className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Activity Logs Table Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                Daftar Log Aktivitas
              </div>
              <Badge variant="secondary" className="ml-2 bg-cyan-500/30">
                {totalLogs} Log
              </Badge>
            </div>
          </div>

          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className="bg-gray-100 dark:bg-transparent rounded-xl p-0">
              <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-slate-900 p-4">
                <ActivityLogTable activityLogs={activityLogs} role={role} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
