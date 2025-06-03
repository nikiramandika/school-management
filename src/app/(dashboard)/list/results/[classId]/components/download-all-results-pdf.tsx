"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

interface Student {
  id: string;
  name: string;
  surname: string;
}
interface Assessment {
  id: string;
  title: string;
  type: "Ujian" | "Tugas";
}
interface Grade {
  studentId: string;
  assessmentId: string;
  score: number;
}

interface DownloadAllResultsPDFButtonProps {
  students?: Student[];
  exams?: Assessment[];
  assignments?: Assessment[];
  existingGrades?: Grade[];
  className: string;
}

export default function DownloadAllResultsPDFButton({ students = [], exams = [], assignments = [], existingGrades = [], className }: DownloadAllResultsPDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownloadAllPDF = async () => {
    setLoading(true);
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Kelas: ${className}`, 14, 15);
    doc.setFontSize(12);
    doc.text(`Tanggal Download: ${new Date().toLocaleDateString("id-ID")}`, 14, 25);

    // Gabungkan semua assessment dengan prefix pada id
    const allAssessments: Assessment[] = [
      ...exams.map(e => ({ ...e, id: `E-${e.id}`, type: "Ujian" as const })),
      ...assignments.map(a => ({ ...a, id: `A-${a.id}`, type: "Tugas" as const })),
    ];

    // Header tabel: Nama Siswa, ...judul assessment
    const tableHead = [
      "Nama Siswa",
      ...allAssessments.map(a => `${a.type}: ${a.title}`)
    ];

    // Data tabel: setiap baris = siswa, kolom = nilai assessment
    const tableBody = students.map(student => [
      `${student.name} ${student.surname}`,
      ...allAssessments.map(assess => {
        const grade = existingGrades.find(g => g.studentId === student.id && g.assessmentId === assess.id);
        return grade ? grade.score : "-";
      })
    ]);

    autoTable(doc, {
      startY: 35,
      head: [tableHead],
      body: tableBody,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    doc.save(`rekap_nilai_${className}_${new Date().toLocaleDateString("id-ID")}.pdf`);
    setLoading(false);
  };

  return (
    <Button onClick={handleDownloadAllPDF} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
      <Download className="h-4 w-4 mr-2" />
      {loading ? "Membuat PDF..." : "Download Rekap PDF"}
    </Button>
  );
} 