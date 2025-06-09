"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";

const AttendanceForm = ({
  type,
  data,
  setOpen,
  student,
  lesson,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  student: {
    id: string;
    name: string;
    surname: string;
  };
  lesson: {
    id: number;
    name: string;
  };
}) => {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const userRole = user?.publicMetadata?.role as string;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      ...data,
      studentId: student.id,
      lessonId: lesson.id,
      date: data?.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      present: data?.present ?? true,
    },
  });

  const onSubmit = useCallback(
    async (formData: AttendanceSchema) => {
      try {
        if (type === "update" && !formData.id) {
          toast.error("ID kehadiran hilang. Silakan coba lagi.");
          return;
        }

        const submitData = {
          ...formData,
          date: new Date(formData.date),
          userId,
          userRole,
        };

        let result;
        if (type === "create") {
          result = await createAttendance(
            { success: false, error: false, message: "" },
            submitData
          );
        } else {
          result = await updateAttendance(
            { success: false, error: false, message: "" },
            {
              ...submitData,
              id: formData.id!,
            }
          );
        }

        if (result.success) {
          toast.success(
            `Absensi telah ${type === "create" ? "tercatat" : "diperbarui"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Gagal menyimpan kehadiran. Silakan coba lagi."
          );
        }
      } catch (error) {
        console.error("Kesalahan pengiriman formulir:", error);
        toast.error("Terjadi kesalahan yang tidak diharapkan. Silakan coba lagi.");
      }
    },
    [type, setOpen, router, userId, userRole]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Student</Label>
        <Input
          value={`${student.name} ${student.surname}`}
          disabled
          className="bg-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label>Pelajaran</Label>
        <Input
          value={lesson.name}
          disabled
          className="bg-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label>Tanggal</Label>
        <Input
          type="date"
          {...register("date")}
          className={errors.date ? "border-red-500" : ""}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Status Kehadiran</Label>
        <Select
          defaultValue={data?.status || "PRESENT"}
          onValueChange={(value) => setValue("status", value as "PRESENT" | "SICK" | "PERMITTED" | "ABSENT")}
        >
          <SelectTrigger className={errors.status ? "border-red-500" : ""}>
            <SelectValue placeholder="Pilih status kehadiran" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRESENT">Hadir</SelectItem>
            <SelectItem value="SICK">Sakit</SelectItem>
            <SelectItem value="PERMITTED">Izin</SelectItem>
            <SelectItem value="ABSENT">Tidak Hadir</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-red-500">{errors.status.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Menyimpan..."
          : type === "create"
          ? "Catat Kehadiran"
          : "Perbarui Kehadiran"}
      </Button>
    </form>
  );
};

export default AttendanceForm;