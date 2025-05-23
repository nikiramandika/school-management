"use client";

import Image from "next/image";
import { LuMessageSquareText } from "react-icons/lu";
import { GrAnnounce } from "react-icons/gr";
import { UserButton } from "@clerk/nextjs";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
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
        <Button
          variant="outline"
          size="icon"
          className="flex items-center justify-center relative"
        >
          <GrAnnounce />
          <div className="absolute -top-3 -right-2 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1{" "}
          </div>
        </Button>
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
          <span className="text-xs leading-3 font-medium">Niki gan</span>
          <span className="text-[10px] text-gray-500 text-right">Admin</span>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
