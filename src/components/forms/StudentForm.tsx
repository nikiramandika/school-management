"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField"; 
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
    control,
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

  // Options for dropdowns
  const bloodTypeOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'AB', label: 'AB' },
    { value: 'O', label: 'O' },
  ];

  const sexOptions = [
    { value: 'MALE', label: 'Laki-laki' },
    { value: 'FEMALE', label: 'Perempuan' },
  ];

  const { classes } = relatedData || { classes: [] };
  
  const classOptions = [
    ...classes.map((classItem: { id: number; name: string; grade: { level: number } }) => ({
      value: classItem.id.toString(),
      label: `${classItem.grade.level === 1 ? 'X' : 
               classItem.grade.level === 2 ? 'XI' : 
               classItem.grade.level === 3 ? 'XII' : ''} ${classItem.name}`
    }))
  ];

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Siswa Baru" : "Memperbarui Siswa"}
      </h1>
      
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
        
        {/* Blood Type Dropdown using SelectField */}
        <SelectField
          label="Golongan Darah"
          name="bloodType"
          control={control}
          options={bloodTypeOptions}
          error={errors.bloodType}
          placeholder="Pilih Golongan Darah"
          isSearchable={false}
          isClearable={true}
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
        
        {/* Sex Dropdown using SelectField */}
        <SelectField
          label="Jenis Kelamin"
          name="sex"
          control={control}
          options={sexOptions}
          error={errors.sex}
          placeholder="Pilih Jenis Kelamin"
          isSearchable={false}
          isClearable={true}
        />
        
        {/* Class Dropdown using SelectField */}
        <SelectField
          label="Kelas"
          name="classId"
          control={control}
          options={classOptions}
          error={errors.classId}
          placeholder="Pilih Kelas"
          isSearchable={true}
          isClearable={true}
        />
      </div>
      
      <button
        className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            {type === "create" ? "Membuat..." : "Memperbarui..."}
          </>
        ) : (
          <>
            {type === "create" ? "Buat" : "Perbarui"}
          </>
        )}
      </button>
    </form>
  );
};

export default StudentForm;