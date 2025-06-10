"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { useUser } from "@clerk/nextjs";

const ExamForm = ({
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
    if (data?.startTime && data?.endTime) {
      return {
        from: new Date(data.startTime),
        to: new Date(data.endTime),
      };
    }
    return undefined;
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      ...data,
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
      lessonId: data?.lessonId || data?.lesson?.id || undefined,
    },
  });

  // Update form values when dateRange changes
  useEffect(() => {
    if (dateRange?.from) {
      setValue("startTime", dateRange.from);
    }
    if (dateRange?.to) {
      setValue("endTime", dateRange.to);
    }
  }, [dateRange, setValue]);

  const onSubmit = useCallback(
    async (formData: ExamSchema) => {
      try {
        if (!dateRange?.from || !dateRange?.to) {
          toast.error("Silakan pilih tanggal mulai dan berakhirnya");
          return;
        }

        const submitData = {
          ...formData,
          startTime: dateRange.from,
          endTime: dateRange.to,
          userId,
          userRole,
        };
        const action = type === "create" ? createExam : updateExam;
        const result = await action(
          { success: false, error: false, message: "" },
          submitData
        );

        if (result.success) {
          toast.success(
            `Ujian telah ${type === "create" ? "dibuat" : "diperbarui"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Gagal menyimpan data ujian. Silakan coba lagi."
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

  // Prepare options for SelectField
  const lessonOptions = lessons.map(
    (lesson: {
      id: number;
      name: string;
      subject: { id: number; name: string };
      class: { id: number; name: string; grade: { level: number } };
      teacher: { id: string; name: string; surname: string };
    }) => ({
      value: String(lesson.id),
      label: `${lesson.subject.name} - ${lesson.class.grade.level === 1 ? "X" : lesson.class.grade.level === 2 ? "XI" : "XII"} ${lesson.class.name} (${lesson.name}) - ${lesson.teacher.name} ${lesson.teacher.surname}`,
    })
  );

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Ujian Baru" : "Memperbarui Ujian"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Judul Ujian"
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
            isSearchable
            isClearable
            valueAsNumber={true}
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Rentang Tanggal Ujian</label>
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

export default ExamForm;