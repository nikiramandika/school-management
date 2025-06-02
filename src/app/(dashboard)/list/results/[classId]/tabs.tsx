"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BarChart2, FileText } from "lucide-react";

interface TabsProps {
  classId: string;
  className?: string;
  totalExams?: number;
  totalAssignments?: number;
}

const Tabs = ({
  classId,
  className,
  totalExams = 0,
  totalAssignments = 0,
}: TabsProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: "Ujian",
      href: `/list/results/${classId}/exam`,
      icon: BarChart2,
      count: totalExams,
      color: "purple",
    },
    {
      name: "Tugas",
      href: `/list/results/${classId}/assignment`,
      icon: FileText,
      count: totalAssignments,
      color: "orange",
    },
  ];

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg shadow-sm">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.href)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200",
                "hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]",
                isActive
                  ? "bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-slate-500"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-600/50"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive && tab.color === "purple" && "text-purple-600",
                  isActive && tab.color === "orange" && "text-orange-600",
                  !isActive && "text-gray-500 dark:text-gray-400"
                )}
              />
              <span>{tab.name}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "ml-1 text-xs font-semibold",
                  tab.color === "purple" &&
                    "bg-cyan-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
                  tab.color === "orange" &&
                    "bg-cyan-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                )}
              >
                {tab.count}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
