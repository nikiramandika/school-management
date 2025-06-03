"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { eachDayOfInterval, format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import prisma from "@/lib/prisma";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AttendancePDFDownloadProps {
  lesson: {
    id: number;
    name: string;
    teacher: {
      name: string;
      surname: string;
    };
  };
  students: {
    id: string;
    name: string;
    surname: string;
  }[];
  attendancesByDate: {
    studentId: string;
    date: Date;
    present: boolean;
    lessonId: number;
  }[];
}

export function AttendancePDFDownload({
  lesson,
  students,
  attendancesByDate,
}: AttendancePDFDownloadProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const generatePDF = async () => {
    if (!startDate || !endDate) return;

    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(16);
      doc.text("Laporan Absensi", 14, 15);
      doc.setFontSize(12);
      doc.text(`Mata Pelajaran: ${lesson.name}`, 14, 25);
      doc.text(
        `Guru: ${lesson.teacher.name} ${lesson.teacher.surname}`,
        14,
        32
      );
      doc.text(
        `Periode: ${format(startDate, "d MMMM yyyy", {
          locale: id,
        })} - ${format(endDate, "d MMMM yyyy", { locale: id })}`,
        14,
        39
      );

      // Tanggal
      const dates = eachDayOfInterval({ start: startDate, end: endDate });

      // Filter attendance untuk pelajaran dan rentang tanggal ini
      const filteredAttendances = attendancesByDate.filter((att) => {
        const date = new Date(att.date);
        return (
          att.lessonId === lesson.id && date >= startDate && date <= endDate
        );
      });

      // Buat isi tabel
      const tableData = students.map((student) => {
        const row = [`${student.name} ${student.surname}`];
        dates.forEach((date) => {
          const attendance = filteredAttendances.find(
            (a) =>
              a.studentId === student.id &&
              format(new Date(a.date), "yyyy-MM-dd") ===
                format(date, "yyyy-MM-dd")
          );

          if (attendance === undefined) {
            row.push("-");
          } else if (attendance.present === true) {
            row.push("Hadir");
          } else if (attendance.present === false) {
            row.push("Tidak Hadir");
          }
        });
        return row;
      });

      const headers = [
        "Nama Siswa",
        ...dates.map((date) => format(date, "d MMM", { locale: id })),
      ];

      autoTable(doc, {
        startY: 45,
        head: [headers],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 8,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 40 },
        },
      });

      doc.save(
        `absensi-${lesson.name}-${format(startDate, "yyyy-MM-dd")}-${format(
          endDate,
          "yyyy-MM-dd"
        )}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? (
              endDate ? (
                <>
                  {format(startDate, "d MMM yyyy", { locale: id })} -{" "}
                  {format(endDate, "d MMM yyyy", { locale: id })}
                </>
              ) : (
                format(startDate, "d MMM yyyy", { locale: id })
              )
            ) : (
              <span>Pilih rentang tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={startDate}
            selected={{ from: startDate, to: endDate }}
            onSelect={(range) => {
              setStartDate(range?.from);
              setEndDate(range?.to);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                onClick={generatePDF}
                disabled={!startDate || !endDate}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {!startDate || !endDate
              ? "Pilih rentang tanggal terlebih dahulu"
              : "Download Laporan Absensi"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
