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
          toast.error("Missing attendance ID. Please try again.");
          return;
        }

        let result;
        if (type === "create") {
          result = await createAttendance(
            { success: false, error: false, message: "" },
            {
              studentId: formData.studentId,
              lessonId: formData.lessonId,
              date: new Date(formData.date),
              present: formData.present,
            }
          );
        } else {
          result = await updateAttendance(
            { success: false, error: false, message: "" },
            {
              id: formData.id!,
              studentId: formData.studentId,
              lessonId: formData.lessonId,
              date: new Date(formData.date),
              present: formData.present,
            }
          );
        }

        if (result.success) {
          toast.success(
            `Attendance has been ${type === "create" ? "recorded" : "updated"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Failed to save attendance. Please try again."
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [type, setOpen, router]
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
        <Label>Lesson</Label>
        <Input
          value={lesson.name}
          disabled
          className="bg-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Input
          type="date"
          {...register("date")}
          className={errors.date ? "border-red-500" : ""}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="present"
          checked={watch("present")}
          onCheckedChange={(checked) => setValue("present", checked as boolean)}
        />
        <Label htmlFor="present">Present</Label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Saving..."
          : type === "create"
          ? "Record Attendance"
          : "Update Attendance"}
      </Button>
    </form>
  );
};

export default AttendanceForm; 