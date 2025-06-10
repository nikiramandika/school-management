"use client";

import { GrAnnounce, GrCalendar } from "react-icons/gr";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import * as React from "react";
import { Moon, Sun, Menu as MenuIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const { user } = useUser();
  const { sessionClaims } = useAuth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || "";
  const segments = pathname.split("/").filter(Boolean);

  useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const response = await fetch(
          `/api/events?startDate=${today.toISOString()}&endDate=${tomorrow.toISOString()}`
        );

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setTodayEvents([]);
          return;
        }

        const data = await response.json();
        const eventsArray = Array.isArray(data) ? data : [];

        const activeEvents = eventsArray.filter((event: any) => {
          if (!event?.startTime || !event?.endTime) return false;

          const startTime = new Date(event.startTime);
          const endTime = new Date(event.endTime);
          const now = new Date();
          return startTime <= now && now <= endTime;
        });

        setTodayEvents(activeEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setTodayEvents([]);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        // Get announcements with role-based filtering
        const response = await fetch("/api/announcements", {
          cache: "no-store",
          next: { revalidate: 0 },
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setAnnouncements([]);
          return;
        }

        const data = await response.json();
        let announcementsArray = Array.isArray(data) ? data : [];

        // Filter announcements to only show current and future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day

        announcementsArray = announcementsArray.filter((announcement: any) => {
          const announcementDate = new Date(announcement.date);
          announcementDate.setHours(0, 0, 0, 0); // Set to start of day
          return announcementDate >= today;
        });

        // Sort by date ascending (earliest first)
        announcementsArray = announcementsArray
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 3);

        setAnnouncements(announcementsArray);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        setAnnouncements([]);
      }
    };

    // Only fetch data if user is authenticated
    if (user?.id) {
      fetchTodayEvents();
      fetchAnnouncements();
    } else {
      // Clear data when user is not authenticated
      setTodayEvents([]);
      setAnnouncements([]);
    }

    // Only set up interval if user is authenticated
    const interval = user?.id
      ? setInterval(() => {
          fetchTodayEvents();
          fetchAnnouncements();
        }, 30000)
      : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.id, role]); // Keep these dependencies to ensure re-fetch when user or role changes

  const getBreadcrumbLabel = (segment: string, index: number) => {
    // Handle special cases
    if (segment === "list") return "List";
    if (segment === "results") return "Results";

    // Handle dynamic segments
    if (segment.match(/^[0-9]+$/)) {
      if (segments[index - 1] === "results") return "Detail Kelas";
      return segment;
    }

    // Handle other segments
    switch (segment) {
      case "teachers":
        return "Teachers";
      case "students":
        return "Students";
      case "subjects":
        return "Subjects";
      case "classes":
        return "Classes";
      case "lessons":
        return "Lessons";
      case "exams":
        return "Exams";
      case "assignments":
        return "Assignments";
      case "attendance":
        return "Attendance";
      case "events":
        return "Events";
      case "messages":
        return "Messages";
      case "announcements":
        return "Announcements";
      case "profile":
        return "Profile";
      case "settings":
        return "Settings";
      case "exam":
        return "Exam Results";
      case "assignment":
        return "Assignment Results";
      default:
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

  // Filter segments to only show up to Class Details
  const filteredSegments = segments.reduce(
    (acc: { path: string; label: string }[], segment, index) => {
      if (segment === "list") return acc; // Skip 'list' segment

      // Special handling for results
      if (segment === "results") {
        return [...acc, { path: segment, label: "Nilai" }];
      }
      if (segment.match(/^[0-9]+$/) && segments[index - 1] === "results") {
        return [...acc, { path: segment, label: "Detail Kelas" }];
      }

      // Handle other menu items
      let label = segment;
      switch (segment) {
        case "teachers":
          label = "Guru";
          break;
        case "students":
          label = "Siswa";
          break;
        case "subjects":
          label = "Mata Pelajaran";
          break;
        case "classes":
          label = "Kelas";
          break;
        case "lessons":
          label = "Pelajaran";
          break;
        case "exams":
          label = "Ujian";
          break;
        case "assignments":
          label = "Tugas";
          break;
        case "attendance":
          label = "Absensi";
          break;
        case "events":
          label = "Acara";
          break;
        case "messages":
          label = "Pesan";
          break;
        case "announcements":
          label = "Pengumuman";
          break;
        case "profile":
          label = "Profile";
          break;
        case "settings":
          label = "Pengaturan";
          break;
        default:
          // Jika segment adalah id user (user_...) tampilkan label ramah sesuai konteks
          if (segment.startsWith("user_")) {
            if (segments[index - 1] === "teachers") label = "Profil Guru";
            else if (segments[index - 1] === "students") label = "Profil Siswa";
            else label = "Profil Pengguna";
          } else {
            label = segment.charAt(0).toUpperCase() + segment.slice(1);
          }
      }
      return [...acc, { path: segment, label }];
    },
    []
  );

  const buildPath = (index: number) => {
    return "/" + segments.slice(0, index + 1).join("/");
  };

  return (
    <div className="backdrop-blur-md rounded-b-3xl sticky top-0 mb-4 z-40 border soft-light bg-softlight dark:bg-softdark mx-4 shadow-md">
      <div className=" flex h-16 items-center px-4 ">
        {/* Mobile Menu Button */}
        <Button
          variant="outline"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onMenuClick}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>

        {/* Desktop Breadcrumb */}
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Beranda</BreadcrumbLink>
            </BreadcrumbItem>
            {filteredSegments.map((segment, index) => (
              <React.Fragment key={segment.path}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={buildPath(index + 1)}
                    className={
                      index === filteredSegments.length - 1 ? "font-medium" : ""
                    }
                  >
                    {segment.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile Title */}
        <div className="md:hidden text-lg font-semibold flex items-center">
          {filteredSegments.length > 0 ? (
            <>
              <span>{filteredSegments[filteredSegments.length - 1].label}</span>
            </>
          ) : (
            <span>Beranda</span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-2">
          {/* Desktop Buttons */}
          <div className="flex items-center gap-2">
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="flex items-center justify-center relative"
                      aria-label="Acara Hari Ini"
                    >
                      <GrCalendar className="h-5 w-5" />
                      {todayEvents.length > 0 && (
                        <div className="absolute -top-3 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs">
                          {todayEvents.length}
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>Lihat Acara</p>
                </TooltipContent>
              </Tooltip>

              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">Acara Hari Ini</h4>
                  {todayEvents.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Tidak ada acara hari ini
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {todayEvents.map((event, idx) => (
                        <div
                          key={event.id}
                          className={`p-3 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                            idx === todayEvents.length - 1 ? "" : "mb-4"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                              {event.title}
                            </h5>
                          </div>
                          {event.description && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {event.description}
                              </p>
                            </div>
                          )}
                          <span className="text-xs px-2 py-1 rounded-full bg-cyan-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 mt-2 inline-block">
                            {new Date(event.startTime).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="flex items-center justify-center relative"
                      aria-label="Pengumuman"
                    >
                      <GrAnnounce className="h-5 w-5" />
                      {isLoadingAnnouncements ? (
                        <div className="absolute -top-3 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs">
                          Memuat...
                        </div>
                      ) : (
                        announcements.length > 0 && (
                          <div className="absolute -top-3 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs">
                            {announcements.length}
                          </div>
                        )
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>Lihat Pengumuman</p>
                </TooltipContent>
              </Tooltip>

              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">
                    Pengumuman Terbaru
                  </h4>
                  {isLoadingAnnouncements ? (
                    <p className="text-sm text-gray-500">
                      Memuat pengumuman...
                    </p>
                  ) : announcements.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Tidak ada pengumuman
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {announcements.map((announcement) => (
                        <div
                          key={announcement.id}
                          className="p-3 rounded-md border border-gray-200 dark:border-gray-800"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">
                              {announcement.title}
                            </h5>
                            <span className="text-xs text-gray-500">
                              {new Date(announcement.date).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {announcement.description}
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                              {announcement.class
                                ? announcement.class.grade?.level === 1
                                  ? "X " + announcement.class.name
                                  : announcement.class.grade?.level === 2
                                  ? "XI " + announcement.class.name
                                  : "XII " + announcement.class.name
                                : "Semua Kelas"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ubah Tema</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Terang
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Gelap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                Sesuai Sistem
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop User Info */}
          <div className="hidden md:flex flex-col pl-2">
            <span className="text-xs leading-3 font-medium">
              {user?.fullName || user?.username}
            </span>
            <span className="text-[10px] text-gray-500 text-right">{role}</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <UserButton />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Menu Akun</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
