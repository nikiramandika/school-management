import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { EventTable } from "./event-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, MapPin, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HiUserGroup } from "react-icons/hi";

type EventList = Event & { class: Class };

const EventListPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  console.log("Current role:", role);

  // Fetch all classes for the form
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
  });

  // ROLE CONDITIONS
  const query: Prisma.EventWhereInput = {};

  switch (role) {
    case "admin":
    case "teacher":
    case "student":
      // All roles can see all events
      break;
    default:
      break;
  }

  const dataRes = await prisma.event.findMany({
    where: query,
    include: {
      class: {
        select: {
          name: true,
        },
      },
    },
  });

  const data = dataRes.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    startTime: item.startTime,
    endTime: item.endTime,
    className: item.class?.name,
    classId: item.classId,
  }));

  // Calculate stats
  const totalEvents = data.length;
  const totalClasses = new Set(
    data.map((event) => event.classId).filter(Boolean)
  ).size;
  const upcomingEvents = data.filter(
    (event) => new Date(event.startTime) > new Date()
  ).length;
  const todayEvents = data.filter((event) => {
    const eventDate = new Date(event.startTime);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="soft-light bg-softlight dark:bg-softdark m-4 p-4 flex-1 mt-0 rounded-3xl shadow-md">
      <div className="container mx-auto p-6 space-y-8">
        {/* Conditional Header Section - Only show management header for admin */}
        {role === "admin" && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/90 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Manajemen Acara
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center justify-center">
                      <FormContainer table="event" type="create" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Tambah Acara</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Stats Cards - Only show for admin */}
        {role === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r bg-teal-500/90 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">
                      Total Acara
                    </p>
                    <p className="text-3xl font-bold">{totalEvents}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r bg-teal-500/90 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">
                      Acara Mendatang
                    </p>
                    <p className="text-3xl font-bold">{upcomingEvents}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r bg-teal-500/90 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">
                      Acara Hari Ini
                    </p>
                    <p className="text-3xl font-bold">{todayEvents}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <MapPin className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r bg-teal-500/90 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">
                      Kelas Terlibat
                    </p>
                    <p className="text-3xl font-bold">{totalClasses}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <HiUserGroup className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Events Table Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/90 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Daftar Acara
            </h1>
            <Badge variant="secondary" className="ml-2 bg-teal-500/80">
              {totalEvents} Acara
            </Badge>
          </div>

          <Card className="border-0 shadow-md bg-white dark:bg-transparent rounded-xl">
            <CardContent className=" bg-gray-100 dark:bg-transparent rounded-xl p-0">
              <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-slate-900 p-4">
                <EventTable data={data} role={role} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventListPage;
