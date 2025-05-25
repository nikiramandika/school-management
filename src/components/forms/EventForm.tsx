"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createEvent,
  updateEvent,
} from "@/lib/actions";
import { Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { z } from "zod";

const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
  classId: z.coerce.number().optional(),
});

type EventSchema = z.infer<typeof eventSchema>;

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: data,
  });

  const onSubmit = useCallback(async (formData: EventSchema) => {
    try {
      const action = type === "create" ? createEvent : updateEvent;
      const result = await action({ success: false, error: false, message: "" }, formData);

      if (result.success) {
        toast.success(`Event has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to save event data. Please try again.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }, [type, setOpen, router]);

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event" : "Update the event"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Title</label>
          <input
            type="text"
            {...register("title")}
            defaultValue={data?.title}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          />
          {errors.title?.message && (
            <p className="text-xs text-red-400">{errors.title.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            {...register("description")}
            defaultValue={data?.description}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            rows={4}
          />
          {errors.description?.message && (
            <p className="text-xs text-red-400">{errors.description.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Start Time</label>
          <input
            type="datetime-local"
            {...register("startTime")}
            defaultValue={data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : ""}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          />
          {errors.startTime?.message && (
            <p className="text-xs text-red-400">{errors.startTime.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">End Time</label>
          <input
            type="datetime-local"
            {...register("endTime")}
            defaultValue={data?.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : ""}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          />
          {errors.endTime?.message && (
            <p className="text-xs text-red-400">{errors.endTime.message.toString()}</p>
          )}
        </div>

        {relatedData?.classes && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Class</label>
            <select
              {...register("classId")}
              defaultValue={data?.classId}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            >
              <option value="">Select a class</option>
              {relatedData.classes.map((classItem: any) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            {errors.classId?.message && (
              <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
            )}
          </div>
        )}

        {data && (
          <input type="hidden" {...register("id")} value={data?.id} />
        )}
      </div>

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md" disabled={isSubmitting}>
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default EventForm; 