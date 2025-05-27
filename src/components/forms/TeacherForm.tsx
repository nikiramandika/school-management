"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useCallback } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";

const TeacherForm = ({
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
    control,
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: data,
  });

  const onSubmit = useCallback(
    async (formData: TeacherSchema) => {
      try {
        const action = type === "create" ? createTeacher : updateTeacher;
        const result = await action(
          { success: false, error: false, message: "" },
          formData
        );

        if (result.success) {
          toast.success(
            `Teacher has been ${type === "create" ? "created" : "updated"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error(
            result.message || "Failed to save teacher data. Please try again."
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        console.error("Clerk error details:", errors);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [type, setOpen, router]
  );

  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Guru Baru" : "Memperbarui Guru"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
      Informasi Autentikasi
      </span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="NIP"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Pribadi
      </span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Nama Depan"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Nama Belakang"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Nomor Hp"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Alamat"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Golongan Darah"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Tanggal Lahir"
          name="birthday"
          defaultValue={data?.birthday?.toISOString().split("T")[0]}
          register={register}
          error={errors.birthday}
          type="date"
        />
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
      <div className="flex gap-4 w-full">
        <div className="flex flex-col gap-2 w-1/3">
          <label className="text-xs text-gray-500">Jenis Kelamin</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full "
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Laki-Laki</option>
            <option value="FEMALE">Perempuan</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-2/3 ">
          <label className="text-xs text-gray-500">Mata Pelajaran</label>
          <Controller
            control={control}
            name="subjects"
            render={({ field }) => (
              <Select
                isMulti
                isSearchable
                options={subjects.map(
                  (subject: { id: number; name: string }) => ({
                    value: subject.id.toString(),
                    label: subject.name,
                  })
                )}
                value={(field.value || []).map((id: string) => {
                  const subject = subjects.find(
                    (s: { id: number }) => s.id.toString() === id
                  );
                  return subject
                    ? { value: subject.id.toString(), label: subject.name }
                    : { value: id, label: String(id) };
                })}
                onChange={(selected) =>
                  field.onChange(
                    selected ? selected.map((s: any) => s.value) : []
                  )
                }
                classNamePrefix="react-select"
                placeholder="Pilih Mata Pelajaran..."
                styles={{ container: (base) => ({ ...base, width: "100%" }) }}
              />
            )}
          />
          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>
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

export default TeacherForm;
