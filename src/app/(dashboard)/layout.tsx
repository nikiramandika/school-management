"use client";

import { useEffect, useState, useRef } from "react";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { FAQButton } from "@/components/FAQButton";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showShadow, setShowShadow] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col lg:w-[16%] xl:w-[14%]  rounded-r-4xl soft-light bg-softlight dark:bg-softdark shadow-md ">
        {/* Logo dan Header dengan bayangan dinamis */}
        <div
          className={`rounded-4xl px-4 pt-4 pb-4 bg-inherit z-10 ${
            showShadow ? "shadow-md" : ""
          } transition-shadow`}
        >
          <Link
            href="/"
            className="flex items-center justify-center lg:justify-start gap-2"
          >
            <Image
              src="/LogoSMAN5Medan.png"
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

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-[80%] max-w-[300px] bg-gray-50 dark:bg-[#1d1d24]/95 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 pt-4 pb-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/LogoSMAN5Medan.png"
              alt="logo"
              width={32}
              height={32}
              unoptimized
            />
            <span className="font-medium text-gray-800 dark:text-white">
              SMAN 5 Medan
            </span>
          </Link>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          <Menu />
        </div>
      </aside>

      {/* Main Content */}
      <div className="w-full md:w-[92%] lg:w-[84%] xl:w-[86%] bg-transparent overflow-scroll flex flex-col">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        {children}
        <FAQButton />
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 backdrop-blur-md bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
