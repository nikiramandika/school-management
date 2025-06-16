"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface SemesterFilterProps {
  classSemester: string;
}

export default function SemesterFilter({ classSemester }: SemesterFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSemester = searchParams.get("semester") || classSemester;

  const handleSemesterChange = (semester: string) => {
    const params = new URLSearchParams(searchParams);
    if (semester === classSemester) {
      params.delete("semester");
    } else {
      params.set("semester", semester);
    }
    router.push(`?${params.toString()}`);
  };

  const isViewingDifferentSemester = currentSemester !== classSemester;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter Semester:
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handleSemesterChange("GANJIL")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentSemester === "GANJIL"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            GANJIL
          </button>
          <button
            onClick={() => handleSemesterChange("GENAP")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentSemester === "GENAP"
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            GENAP
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={classSemester === "GANJIL" 
              ? "border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300" 
              : "border-green-200 text-green-700 dark:border-green-700 dark:text-green-300"
            }
          >
            Semester Kelas: {classSemester}
          </Badge>
        </div>
      </div>

      {/* Warning message when viewing different semester */}
      {isViewingDifferentSemester && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Mode Hanya Lihat
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Anda sedang melihat nilai semester {currentSemester}. Input nilai hanya tersedia untuk semester {classSemester} (semester kelas saat ini).
            </p>
          </div>
        </div>
      )}

      {/* Info message when viewing class semester */}
      {!isViewingDifferentSemester && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Mode Input Nilai Aktif
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              Anda dapat melihat dan menginput nilai untuk semester {classSemester} (semester kelas saat ini).
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 