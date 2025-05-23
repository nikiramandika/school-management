"use client";

import { useEffect, useState, useRef } from "react";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showShadow, setShowShadow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setShowShadow(scrollRef.current.scrollTop > 0);
      }
    };

    const el = scrollRef.current;
    el?.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="h-screen flex">
      <aside className="flex flex-col w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] bg-gray-50 dark:bg-card">
        {/* Logo dan Header dengan bayangan dinamis */}
        <div
          className={`px-4 pt-4 pb-4 bg-inherit z-10 ${
            showShadow ? "shadow-md" : ""
          } transition-shadow`}
        >
          <Link
            href="/"
            className="flex items-center justify-center lg:justify-start gap-2"
          >
            <Image
              src="https://smanlimedan.sch.id/wp-content/uploads/2024/07/LOGO_2-removebg-prev._imresizer-removebg-preview.png"
              alt="logo"
              width={32}
              height={32}
              unoptimized
            />
            <span className="hidden lg:block font-medium text-gray-800 dark:text-white">
              SMAN 5 Medan
            </span>
          </Link>
        </div>

        {/* Scrollable Menu */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt pb-4">
          <Menu />
        </div>
      </aside>

      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-background overflow-scroll flex flex-col">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
