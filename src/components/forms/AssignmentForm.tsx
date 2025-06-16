"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import {
  assignmentSchema,
  AssignmentSchema,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { useUser } from "@clerk/nextjs";

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const userRole = user?.publicMetadata?.role as string;
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (data?.startDate && data?.dueDate) {
      return {
        from: new Date(data.startDate),
        to: new Date(data.dueDate),
      };
    }
    return undefined;
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      ...data,
      startTime: data?.startDate ? new Date(data.startDate) : undefined,
      endTime: data?.dueDate ? new Date(data.dueDate) : undefined,
      semester: data?.semester || "GANJIL",
    },
  });

  const watchedLessonId = watch("lessonId");

  // Update form values when dateRange changes
  useEffect(() => {
    if (dateRange?.from) {
      setValue("startTime", dateRange.from);
    }
    if (dateRange?.to) {
      setValue("endTime", dateRange.to);
    }
  }, [dateRange, setValue]);

  // Update semester when lessonId changes
  useEffect(() => {
    const selectedLesson = relatedData?.lessons.find(lesson => lesson.id === Number(watchedLessonId));
    if (selectedLesson?.class?.semester) {
      setValue("semester", selectedLesson.class.semester);
    }
  }, [watchedLessonId, relatedData?.lessons, setValue]);

  const onSubmit = useCallback(
    async (formData: AssignmentSchema) => {
      try {
        if (!dateRange?.from || !dateRange?.to) {
          toast.error("Silakan pilih tanggal mulai dan berakhirnya");
          return;
        }

        const submitData = {
          ...formData,
          startDate: dateRange.from,
          dueDate: dateRange.to,
          userId,
          userRole,
        };
        const action = type === "create" ? createAssignment : updateAssignment;
        const result = await action(
          { success: false, error: false, message: "" },
          submitData
        );

        if (result.success) {
          toast.success(
            `Tugas telah ${type === "create" ? "dibuat" : "diperbarui"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message ||
              "Gagal menyimpan data penugasan. Silakan coba lagi."
          );
        }
      } catch (error) {
        console.error("Kesalahan pengiriman formulir:", error);
        toast.error("Terjadi kesalahan yang tidak diharapkan. Silakan coba lagi.");
      }
    },
    [type, setOpen, router, dateRange, userId, userRole]
  );

  // Get lessons from relatedData
  const lessons = relatedData?.lessons || [];

  // Convert lessons to SelectField options
  const lessonOptions = useMemo(
    () => [
      { value: "", label: "Pilih Pelajaran" },
      ...lessons.map(
        (lesson: {
          id: number;
          name: string;
          subject: { id: number; name: string };
          class: { id: number; name: string; grade: { level: number } };
          teacher: { id: string; name: string; surname: string };
        }) => ({
          value: String(lesson.id),
          label: `${lesson.subject.name} - ${
            lesson.class.grade?.level === 1
              ? "X"
              : lesson.class.grade?.level === 2
              ? "XI"
              : "XII"
          } ${lesson.class.name} (${lesson.name}) - ${lesson.teacher.name} ${
            lesson.teacher.surname
          }`,
        })
      ),
    ],
    [lessons]
  );

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Buat Tugas Baru" : "Memperbarui Tugas"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Judul Tugas"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        <div className="w-full">
          <SelectField
            label="Pelajaran"
            name="lessonId"
            control={control}
            options={lessonOptions}
            error={errors?.lessonId}
            placeholder="Pilih Pelajaran"
            valueAsNumber={true}
            isSearchable={true}
            isClearable={true}
          />
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Semester</label>
            <input
              type="text"
              className="p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              value={watch("semester") || "Pilih pelajaran terlebih dahulu"}
              readOnly
            />
            <input
              type="hidden"
              {...register("semester")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">
            Rentang Tanggal Penugasan
          </label>
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          {errors.startTime?.message && (
            <p className="text-xs text-red-400">
              {errors.startTime.message.toString()}
            </p>
          )}
          {errors.endTime?.message && (
            <p className="text-xs text-red-400">
              {errors.endTime.message.toString()}
            </p>
          )}
        </div>

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>
      <button
        className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-white p-2 rounded-md"
        disabled={isSubmitting}
      >
        {type === "create" ? "Buat" : "Perbarui"}
      </button>
    </form>
  );
};

export default AssignmentForm;