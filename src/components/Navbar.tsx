"use client";

import Image from "next/image";
import { LuMessageSquareText } from "react-icons/lu";
import { GrAnnounce } from "react-icons/gr";
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
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const { user } = useUser();
  const { sessionClaims } = useAuth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || "";
  const segments = pathname.split("/").filter(Boolean);

  useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        const today = new Date();
        const response = await fetch(`/api/events?date=${today.toISOString()}`);
        const data = await response.json();
        setTodayEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchTodayEvents();
  }, []);

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
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      return [...acc, { path: segment, label }];
    },
    []
  );

  const buildPath = (index: number) => {
    return "/" + segments.slice(0, index + 1).join("/");
  };

  return (
    <div className="sticky top-0 mb-4 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
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
          <Link href="/" className="hover:text-foreground transition-colors">
            Beranda
          </Link>
          {filteredSegments.map((segment, index) => (
            <React.Fragment key={segment.path}>
              <HiChevronRight className="h-4 w-4 mx-1" />
              <Link
                href={buildPath(index + 1)}
                className={`hover:text-foreground transition-colors ${
                  index === filteredSegments.length - 1 ? "font-medium" : ""
                }`}
              >
                {segment.label}
              </Link>
            </React.Fragment>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" size="icon">
              <LuMessageSquareText className="h-5 w-5" />
            </Button>
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
                      <GrAnnounce className="h-5 w-5" />
                      {todayEvents.length > 0 && (
                        <div className="absolute -top-3 -right-2 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
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
                    <div className="space-y-2">
                      {todayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 rounded-md border border-gray-200 dark:border-gray-800"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-sm">
                              {event.title}
                            </h5>
                            <span className="text-xs text-gray-500">
                              {new Date(event.startTime).toLocaleTimeString(
                                "en-UK",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {event.description}
                          </p>
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
          <div className="hidden md:flex flex-col">
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
