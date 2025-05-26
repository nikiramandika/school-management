"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { Dispatch, SetStateAction, useCallback, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

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
    formState: { errors, isSubmitting },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      ...data,
      startTime: data?.startDate ? new Date(data.startDate) : undefined,
      endTime: data?.dueDate ? new Date(data.dueDate) : undefined,
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

  const onSubmit = useCallback(async (formData: AssignmentSchema) => {
    try {
      if (!dateRange?.from || !dateRange?.to) {
        toast.error("Please select both start and end dates");
        return;
      }

      const submitData = {
        ...formData,
        startTime: dateRange.from,
        endTime: dateRange.to,
      };
      const action = type === "create" ? createAssignment : updateAssignment;
      const result = await action({ success: false, error: false, message: "" }, submitData);

      if (result.success) {
        toast.success(`Assignment has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to save assignment data. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }, [type, setOpen, router, dateRange]);

  // Get lessons from relatedData
  const lessons = relatedData?.lessons || [];

  // Get current lesson ID
  const currentLessonId = data?.lessonId || data?.lesson?.id;

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new assignment" : "Update the assignment"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Assignment title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={currentLessonId}
          >
            <option value="">Select a lesson</option>
            {lessons.map((lesson: { 
              id: number; 
              name: string;
              subject: { id: number; name: string };
              class: { id: number; name: string };
              teacher: { id: string; name: string; surname: string };
            }) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.subject.name} - {lesson.class.name} ({lesson.name}) - {lesson.teacher.name} {lesson.teacher.surname}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Assignment Date Range</label>
          <DateRangePicker
            date={dateRange}
            setDate={setDateRange}
          />
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
      <button className="bg-blue-400 text-white p-2 rounded-md" disabled={isSubmitting}>
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm; 