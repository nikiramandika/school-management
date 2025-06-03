"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  HiHome,
  HiAcademicCap,
  HiUserGroup,
  HiIdentification,
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
    items: [
      {
        icon: HiHome,
        label: "Beranda",
        href: (role: string) => {
          switch (role) {
            case "admin":
              return "/admin";
            case "teacher":
              return "/teacher";
            case "student":
              return "/student";
            case "parent":
              return "/parent";
            default:
              return "/";
          }
        },
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiAcademicCap,
        label: "Guru",
        href: "/list/teachers",
        visible: ["admin"],
      },
      {
        icon: HiUserGroup,
        label: "Siswa",
        href: "/list/students",
        visible: ["admin"],
      },
      {
        icon: HiBookOpen,
        label: "Mata Pelajaran",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: HiCollection,
        label: "Kelas",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: HiDocumentText,
        label: "Pelajaran",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: HiClipboardList,
        label: "Ujian",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiDocumentReport,
        label: "Tugas",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiClipboardCheck,
        label: "Nilai",
        href: (role: string) => {
          switch (role) {
            case "student":
              return "/list/results/student-grades";
            default:
              return "/list/results";
          }
        },
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiIdentification,
        label: "Absensi",
        href: (role: string) => {
          switch (role) {
            case "student":
              return "/list/attendance/student-attendance";
            default:
              return "/list/attendance";
          }
        },
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiCalendar,
        label: "Acara",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: HiSpeakerphone,
        label: "Pengumuman",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  // {
  //   title: "OTHER",
  //   items: [
  //     {
  //       icon: HiUser,
  //       label: "Profile",
  //       href: "/profile",
  //       visible: ["admin", "teacher", "student", "parent"],
  //     },
  //   ],
  // },
];

const Menu = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || "student";

  const checkIsActive = (path: string) => {
    if (path === "/list/results") {
      return pathname.startsWith("/list/results");
    }
    if (path === "/list/attendance") {
      return pathname.startsWith("/list/attendance");
    }
    return pathname === path;
  };

  return (
    <div className="text-sm px-4 lg:px-0">
      {menuItems.map((section, index) => (
        <div className="flex flex-col gap-2" key={`menu-section-${index}`}>
          {/* <span className="text-gray-400 font-light my-4">
            {section.title}
          </span> */}
          {section.items.map((item) => {
            if (item.visible.includes(role)) {
              const isActive = checkIsActive(typeof item.href === "function" ? item.href(role) : item.href);
              return (
                <Link
                  href={typeof item.href === "function" ? item.href(role) : item.href}
                  key={item.label}
                  className={`flex items-center gap-4 text-gray-500 dark:text-white py-3 px-4 rounded-md transition-colors ${
                    isActive
                      ? "bg-cyan-500 text-white font-semibold hover:bg-cyan-600 dark:hover:bg-cyan-600"
                        : "hover:bg-cyan-200/20 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
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