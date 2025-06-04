"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
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

const EventForm = ({
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
    formState: { errors, isSubmitting },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      ...data,
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
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
    async (formData: EventSchema) => {
      try {
        if (!dateRange?.from || !dateRange?.to) {
          toast.error("Please select both start and end dates");
          return;
        }

        const submitData = {
          ...formData,
          startTime: dateRange.from.toISOString(),
          endTime: dateRange.to.toISOString(),
        };
        const action = type === "create" ? createEvent : updateEvent;
        const result = await action(
          { success: false, error: false, message: "" },
          submitData
        );

        if (result.success) {
          toast.success(
            `Event has been ${type === "create" ? "created" : "updated"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Failed to save event data. Please try again."
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [type, setOpen, router, dateRange]
  );

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Acara Baru" : "Memperbarui Acara"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Judul"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Deskripsi</label>
          <textarea
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("description")}
            defaultValue={data?.description}
            rows={4}
          />
          {errors.description?.message && (
            <p className="text-xs text-red-400">
              {errors.description.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Rentang Tanggal Acara</label>
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

export default EventForm;
