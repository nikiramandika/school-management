"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { announcementSchema, AnnouncementSchema } from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { Dispatch, SetStateAction, useCallback, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

const AnnouncementForm = ({
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    data?.date ? new Date(data.date) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    data?.date ? format(new Date(data.date), "HH:mm") : "00:00"
  );
  const [isAllClasses, setIsAllClasses] = useState<boolean>(!data?.classId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      ...data,
      date: data?.date ? new Date(data.date) : undefined,
    },
  });

  // Update form value when selectedDate or selectedTime changes
  useEffect(() => {
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      setValue("date", newDate);
    }
  }, [selectedDate, selectedTime, setValue]);

  // Handle checkbox change
  const handleAllClassesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAllClasses(e.target.checked);
    if (e.target.checked) {
      setValue("classId", undefined);
    }
  };

  const onSubmit = useCallback(
    async (formData: AnnouncementSchema) => {
      try {
        const action = type === "create" ? createAnnouncement : updateAnnouncement;
        // Build submitData without undefined id
        const submitData: any = {
          title: formData.title,
          description: formData.description,
          date: formData.date instanceof Date ? formData.date.toISOString() : formData.date,
          classId: formData.classId,
        };
        if (typeof formData.id === 'number') {
          submitData.id = formData.id;
        }
        const result = await action(
          { success: false, error: false, message: "" },
          submitData
        );

        if (result.success) {
          toast.success(
            `Announcement has been ${type === "create" ? "created" : "updated"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Failed to save announcement data. Please try again."
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [type, setOpen, router]
  );

  // Get classes from relatedData
  const classes = relatedData?.classes || [];

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Pengumuman Baru" : "Memperbarui Pengumuman"}
      </h1>

      <div className="flex flex-col gap-4">
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
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
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
          <label className="text-xs text-gray-500">Tanggal</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={"w-full justify-start text-left font-normal"}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pilih Tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-full p-4 z-[9999]" align="start" side="bottom" sideOffset={10}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
              <div className="mt-4 flex flex-col gap-2">
                <label className="text-xs text-gray-500">Waktu</label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  className="w-[120px]"
                />
              </div>
            </PopoverContent>
          </Popover>
          {errors.date?.message && (
            <p className="text-xs text-red-400">
              {errors.date.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="allClasses"
              checked={isAllClasses}
              onChange={handleAllClassesChange}
              className="rounded border-gray-300"
            />
            <label htmlFor="allClasses" className="text-sm">Semua Kelas</label>
          </div>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
            {...register("classId", { valueAsNumber: true })}
            defaultValue={data?.classId}
            disabled={isAllClasses}
          >
            <option value="">Pilih Kelas</option>
            {classes?.map((cls: { id: number; name: string }) => (
              <option value={cls.id} key={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
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
        className="bg-blue-400 text-white p-2 rounded-md"
        disabled={isSubmitting}
      >
        {type === "create" ? "Buat" : "Perbarui"}
      </button>
    </form>
  );
};

export default AnnouncementForm; 