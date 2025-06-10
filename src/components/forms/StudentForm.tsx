"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const StudentForm = ({
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
    setError,
    reset,
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
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
      classId: data?.classId,
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
        classId: data.classId,
      });
    }
  }, [data, reset]);

  const onSubmit = useCallback(
    async (formData: StudentSchema) => {
      try {
        console.log("Formulir data sebelum dikirim:", formData);

        const action = type === "create" ? createStudent : updateStudent;
        const result = await action(
          { success: false, error: false, message: "" },
          formData
        );

        console.log("Respons server:", result);

        if (result.success) {
          toast.success(
            `Siswa berhasil ${type === "create" ? "dibuat" : "diperbarui"}!`
          );
          setOpen(false);
          router.refresh();
        } else {
          if (result.message.includes("NISN")) {
            setError("username", { message: result.message });
          } else if (result.message.includes("Password")) {
            setError("password", { message: result.message });
          } else if (result.message.includes("Kelas")) {
            setError("classId", { message: result.message });
          } else {
            toast.error(
              result.message || "Gagal menyimpan data siswa. Silakan coba lagi."
            );
          }
        }
      } catch (error) {
        console.error("Kesalahan pengiriman formulir:", error);
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    },
    [type, setOpen, router, setError]
  );

  const { classes } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Siswa Baru" : "Memperbarui Siswa"}
      </h1>
      {/* <span className="text-xs text-gray-400 font-medium">
        Informasi Autentikasi
      </span> */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="NISN"
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
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Golongan Darah</label>
          <select
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("bloodType")}
            defaultValue={data?.bloodType}
          >
            <option value="">Pilih Golongan Darah</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </select>
          {errors.bloodType?.message && (
            <p className="text-xs text-red-400">
              {errors.bloodType.message.toString()}
            </p>
          )}
        </div>
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
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Jenis Kelamin</label>
          <select
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Kelas</label>
          <select
            className="dark:bg-[#27272e] ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            <option value="">Pilih Kelas</option>
            {classes.map((classItem: { id: number; name: string; grade: { level: number } }) => (
              <option value={classItem.id} key={classItem.id}>
                {classItem.grade.level === 1 ? 'X' : 
                 classItem.grade.level === 2 ? 'XI' : 
                 classItem.grade.level === 3 ? 'XII' : ''} {classItem.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
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

export default StudentForm;
