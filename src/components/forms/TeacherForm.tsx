"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
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
    setError,
    reset,
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      id: data?.id,
      username: data?.username,
      name: data?.name,
      surname: data?.surname,
      email: data?.email || "",
      phone: data?.phone || "",
      address: data?.address,
      bloodType: data?.bloodType,
      sex: data?.sex,
      birthday: data?.birthday,
      subjects:
        data?.subjects?.map((subject: { id: number }) =>
          subject.id.toString()
        ) || [],
    },
  });

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      reset({
        id: data.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || "",
        phone: data.phone || "",
        address: data.address,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects:
          data.subjects?.map((subject: { id: number }) =>
            subject.id.toString()
          ) || [],
      });
    }
  }, [data, reset]);

  const onSubmit = useCallback(
    async (formData: TeacherSchema) => {
      try {
        console.log("Form data before submission:", formData);

        // Ensure subjects are properly formatted
        const formattedData = {
          ...formData,
          subjects: formData.subjects?.map((id) => id.toString()) || [],
        };

        console.log("Formatted data:", formattedData);

        const action = type === "create" ? createTeacher : updateTeacher;
        const result = await action(
          { success: false, error: false, message: "" },
          formattedData
        );

        console.log("Server response:", result);

        if (result.success) {
          toast.success(
            `Guru berhasil ${type === "create" ? "dibuat" : "diperbarui"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          if (result.message.includes("NIP")) {
            setError("username", { message: result.message });
          } else if (result.message.includes("Password")) {
            setError("password", { message: result.message });
          } else {
            toast.error(
              result.message || "Gagal menyimpan data guru. Silakan coba lagi."
            );
          }
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    },
    [type, setOpen, router, setError]
  );

  const { subjects } = relatedData || {};

  // Debug logs
  console.log("Teacher data:", data);
  console.log("Related subjects:", subjects);
  console.log(
    "Current subject IDs:",
    data?.subjects?.map((subject: { id: number }) => subject.id.toString())
  );

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
          register={register}
          error={errors?.username}
        />
        {type === "create" && (
          <>
            <InputField
              label="Email"
              name="email"
              register={register}
              error={errors?.email}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors?.password}
            />
          </>
        )}
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Informasi Pribadi
      </span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Nama Depan"
          name="name"
          register={register}
          error={errors.name}
        />
        <InputField
          label="Nama Belakang"
          name="surname"
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Nomor Hp"
          name="phone"
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Alamat"
          name="address"
          register={register}
          error={errors.address}
        />
        <InputField
          label="Golongan Darah"
          name="bloodType"
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Tanggal Lahir"
          name="birthday"
          type="date"
          register={register}
          error={errors.birthday}
        />
        {data && (
          <InputField
            label="Id"
            name="id"
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
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full "
            {...register("sex")}
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
            render={({ field }) => {
              // Debug logs
              console.log("Field value:", field.value);
              console.log("Available subjects:", subjects);

              const selectedIds = field.value || [];
              const selectedOptions = selectedIds
                .map((id: string) => {
                  const subject = subjects.find(
                    (s: { id: number }) => s.id.toString() === id
                  );
                  return subject
                    ? { value: subject.id.toString(), label: subject.name }
                    : null;
                })
                .filter(Boolean);

              // Debug log
              console.log("Selected options:", selectedOptions);

              return (
                <Select
                  isMulti
                  isSearchable
                  options={subjects.map(
                    (subject: { id: number; name: string }) => ({
                      value: subject.id.toString(),
                      label: subject.name,
                    })
                  )}
                  value={selectedOptions}
                  onChange={(selected) => {
                    console.log("Selected subjects changed:", selected);
                    field.onChange(
                      selected ? selected.map((s: any) => s.value) : []
                    );
                  }}
                  classNamePrefix="react-select custom-select"
                  placeholder="Pilih Mata Pelajaran..."
                  styles={{ container: (base) => ({ ...base, width: "100%" }) }}
                />
              );
            }}
          />
          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>
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

export default TeacherForm;
