"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GrCircleQuestion } from "react-icons/gr";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

interface FAQItem {
  question: string;
  answer: string;
}

const adminFAQItems: FAQItem[] = [
  {
    question: "Bagaimana cara menambah/mengedit/menghapus data guru dan siswa?",
    answer:
      "Akses menu 'Guru' atau 'Siswa' di sidebar. Anda dapat menambah, mengedit, atau menghapus data guru dan siswa dari halaman tersebut.",
  },
  {
    question: "Bagaimana cara membuat kelas baru dan menetapkan wali kelas?",
    answer:
      "Akses menu 'Kelas' di sidebar. Klik tombol tambah untuk membuat kelas baru dan tetapkan wali kelas dari daftar guru yang tersedia.",
  },
  {
    question: "Bagaimana cara mengelola mata pelajaran dan pelajaran?",
    answer:
      "Gunakan menu 'Mata Pelajaran' dan 'Pelajaran' di sidebar untuk menambah, mengedit, atau menghapus mata pelajaran dan pelajaran.",
  },
  {
    question: "Bagaimana cara melihat dan mengelola nilai siswa?",
    answer:
      "Akses menu 'Nilai' di sidebar. Anda dapat melihat, menambah, atau mengedit nilai siswa untuk setiap kelas dan pelajaran.",
  },
  {
    question: "Bagaimana cara melihat dan mengelola absensi siswa dan guru?",
    answer:
      "Gunakan menu 'Absensi' di sidebar untuk melihat dan mengelola kehadiran siswa dan guru di setiap kelas.",
  },
  {
    question: "Bagaimana cara membuat pengumuman untuk seluruh sekolah?",
    answer:
      "Akses menu 'Pengumuman' di sidebar. Klik tombol tambah untuk membuat pengumuman baru yang akan dilihat seluruh warga sekolah.",
  },
  {
    question: "Bagaimana cara melihat log aktivitas pengguna?",
    answer:
      "Menu 'Log Aktivitas' di sidebar menampilkan riwayat aktivitas seluruh pengguna di sistem.",
  },
];

const kepalaSekolahFAQItems: FAQItem[] = [
  {
    question: "Bagaimana cara melihat data guru dan siswa?",
    answer:
      "Akses menu 'Guru' dan 'Siswa' di sidebar untuk melihat data seluruh guru dan siswa di sekolah.",
  },
  {
    question:
      "Bagaimana cara melihat laporan kehadiran, nilai, dan performa guru/siswa?",
    answer:
      "Laporan kehadiran, nilai, dan performa dapat dilihat di halaman 'Dashboard' serta menu 'Absensi' dan 'Nilai'.",
  },
  {
    question: "Bagaimana cara melihat keuangan sekolah?",
    answer:
      "Laporan keuangan dapat diakses melalui dashboard di bagian 'Finance'.",
  },
  {
    question: "Bagaimana cara melihat dan membuat pengumuman sekolah?",
    answer:
      "Akses menu 'Pengumuman' di sidebar. Anda dapat melihat dan membuat pengumuman untuk seluruh sekolah.",
  },
  {
    question: "Bagaimana cara melihat log aktivitas seluruh pengguna?",
    answer:
      "Menu 'Log Aktivitas' di sidebar menampilkan riwayat aktivitas seluruh pengguna di sistem.",
  },
  {
    question: "Bagaimana cara melihat jadwal kegiatan sekolah?",
    answer:
      "Akses menu 'Acara' di sidebar untuk melihat jadwal kegiatan, rapat, dan event sekolah.",
  },
  {
    question: "Bagaimana cara mengubah password akun kepala sekolah?",
    answer:
      "Klik profil di pojok kanan atas, lalu pilih 'Ubah Password' dan ikuti instruksi yang diberikan.",
  },
];

const teacherFAQItems: FAQItem[] = [
  {
    question: "Bagaimana cara melihat dan mengelola kelas yang saya ajar?",
    answer:
      "Akses menu 'Kelas' di sidebar. Anda dapat melihat daftar kelas yang Anda ajar dan mengelola data kelas tersebut.",
  },
  {
    question: "Bagaimana cara mengisi absensi siswa di kelas saya?",
    answer:
      "Akses menu 'Absensi' di sidebar, pilih kelas yang Anda ajar, lalu isi status kehadiran siswa untuk setiap pertemuan.",
  },
  {
    question: "Bagaimana cara mengelola nilai siswa di kelas saya?",
    answer:
      "Menu 'Nilai' di sidebar memungkinkan Anda menambah dan mengedit nilai siswa di kelas yang Anda ajar.",
  },
  {
    question: "Bagaimana cara melihat jadwal mengajar saya?",
    answer:
      "Jadwal mengajar dapat dilihat di halaman utama dashboard atau menu 'Pelajaran' dan 'Acara'.",
  },
  {
    question: "Bagaimana cara membuat pengumuman untuk kelas saya?",
    answer:
      "Akses menu 'Pengumuman' di sidebar, lalu buat pengumuman yang dapat dilihat oleh siswa di kelas yang Anda ajar.",
  },
  {
    question: "Bagaimana cara melihat tugas dan ujian yang saya ajar?",
    answer:
      "Menu 'Tugas' dan 'Ujian' di sidebar menampilkan daftar tugas dan ujian yang Anda buat atau ajar.",
  },
  {
    question: "Bagaimana cara mengubah password akun guru?",
    answer:
      "Klik profil di pojok kanan atas, lalu pilih 'Ubah Password' dan ikuti instruksi yang diberikan.",
  },
];

const studentFAQItems: FAQItem[] = [
  {
    question: "Bagaimana cara melihat jadwal pelajaran dan kelas saya?",
    answer:
      "Akses menu 'Jadwal' atau 'Pelajaran' di sidebar untuk melihat jadwal pelajaran dan kelas Anda.",
  },
  {
    question: "Bagaimana cara melihat nilai saya?",
    answer:
      "Menu 'Nilai' di sidebar menampilkan nilai untuk setiap mata pelajaran dan semester.",
  },
  {
    question: "Bagaimana cara melihat absensi saya?",
    answer:
      "Akses menu 'Absensi' di sidebar untuk melihat riwayat kehadiran Anda di setiap pelajaran.",
  },
  {
    question: "Bagaimana cara melihat pengumuman dari sekolah/guru?",
    answer:
      "Menu 'Pengumuman' di sidebar menampilkan pengumuman dari sekolah dan guru Anda.",
  },
  {
    question: "Bagaimana cara melihat tugas dan ujian saya?",
    answer:
      "Menu 'Tugas' dan 'Ujian' di sidebar menampilkan daftar tugas dan ujian yang harus Anda kerjakan.",
  },
  {
    question: "Bagaimana cara mengubah password akun siswa?",
    answer:
      "Klik profil di pojok kanan atas, lalu pilih 'Ubah Password' dan ikuti instruksi yang diberikan.",
  },
];

const formatRoleName = (role: string) => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function FAQButton() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as string;

  const getFAQItems = () => {
    switch (userRole) {
      case "admin":
        return adminFAQItems;
      case "teacher":
        return teacherFAQItems;
      case "student":
        return studentFAQItems;
      case "kepala_sekolah":
        return kepalaSekolahFAQItems;
      default:
        return [];
    }
  };

  const faqItems = getFAQItems();

  if (!userRole) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <Dialog open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-lg bg-primary text-white hover:bg-primary/90"
                >
                  <GrCircleQuestion style={{ width: 20, height: 20 }} />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Panduan Pengguna </p>
            </TooltipContent>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Panduan Pengguna
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-semibold text-lg">{item.question}</h3>
                    <p className="text-muted-foreground">{item.answer}</p>
                    {index < faqItems.length - 1 && (
                      <div className="border-b border-border my-4" />
                    )}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
