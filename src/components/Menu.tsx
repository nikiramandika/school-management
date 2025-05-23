"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  HiHome,
  HiAcademicCap,
  HiUserGroup,
  HiUsers,
  HiBookOpen,
  HiCollection,
  HiDocumentText,
  HiClipboardList,
  HiDocumentReport,
  HiClipboardCheck,
  HiCalendar,
  HiChat,
  HiSpeakerphone,
  HiUser,
  HiCog,
  HiLogout,
} from "react-icons/hi";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: HiHome,
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiAcademicCap,
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: HiUserGroup,
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      // {
      //   icon: HiUsers,
      //   label: "Parents",
      //   href: "/list/parents",
      //   visible: ["admin", "teacher"],
      // },
      {
        icon: HiBookOpen,
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: HiCollection,
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: HiDocumentText,
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: HiClipboardList,
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiDocumentReport,
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiClipboardCheck,
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiCalendar,
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiCalendar,
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiChat,
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiSpeakerphone,
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: HiUser,
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiCog,
        label: "Settings",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiLogout,
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const Menu = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "student";

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>
          {section.items.map((item) => {
            if (item.visible.includes(role)) {
              const isActive = pathname === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className={`flex items-center justify-center lg:justify-start gap-4 text-gray-500 dark:text-white py-2 md:px-2 rounded-md hover:bg-blue-50 dark:hover:bg-card ${
                    isActive
                      ? "bg-blue-500 text-white font-semibold hover:bg-blue-600"
                      : ""
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;