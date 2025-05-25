"use client";

import Image from "next/image";
import { LuMessageSquareText } from "react-icons/lu";
import { GrAnnounce } from "react-icons/gr";
import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

const Navbar = () => {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const { user } = useUser();
  const { sessionClaims } = useAuth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || "";

  useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        const today = new Date();
        const response = await fetch(`/api/events?date=${today.toISOString()}`);
        const data = await response.json();
        setTodayEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchTodayEvents();
  }, []);

  // Get current section from pathname
  const currentSection = pathname.split("/").pop() || "";
  const formattedSection =
    currentSection.charAt(0).toUpperCase() + currentSection.slice(1);

  return (
    <div className="flex items-center justify-between p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{formattedSection}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-6">
        <Button variant="outline" size="icon">
          <LuMessageSquareText />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="flex items-center justify-center relative"
            >
              <GrAnnounce />
              {todayEvents.length > 0 && (
                <div className="absolute -top-3 -right-2 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
                  {todayEvents.length}
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">Today's Events</h4>
              {todayEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No events for today</p>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-md border border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{event.title}</h5>
                        <span className="text-xs text-gray-500">
                          {new Date(event.startTime).toLocaleTimeString("en-UK", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">{user?.fullName || user?.username}</span>
          <span className="text-[10px] text-gray-500 text-right">{role}</span>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
