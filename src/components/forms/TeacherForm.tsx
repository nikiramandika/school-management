"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import SelectField from "../SelectField";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
        console.log("Formulir data sebelum dikirim:", formData);

        // Ensure subjects are properly formatted
        const formattedData = {
          ...formData,
          subjects: formData.subjects?.map((id) => id.toString()) || [],
        };

        console.log("Data yang telah diformat:", formattedData);

        const action = type === "create" ? createTeacher : updateTeacher;
        const result = await action(
          { success: false, error: false, message: "" },
          formattedData
        );

        console.log("Resons Server", result);

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
        console.error("Kesalahan pengiriman formulir:", error);
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    },
    [type, setOpen, router, setError]
  );

  // Options untuk dropdown
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

  const { subjects } = relatedData || {};

  // Prepare subjects options
  const subjectOptions = subjects?.map((subject: { id: number; name: string }) => ({
    value: subject.id.toString(),
    label: subject.name,
  })) || [];

  // Debug logs
  console.log("Data Guru:", data);
  console.log("Mata Pelajaran terkait:", subjects);
  console.log(
    "ID Mata Pelajaran sekarang:",
    data?.subjects?.map((subject: { id: number }) => subject.id.toString())
  );

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Membuat Guru Baru" : "Memperbarui Guru"}
      </h1>
      
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
      <div className="flex flex-col space-y-3">
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
        
        {/* Blood Type Dropdown - menggunakan SelectField */}
        <SelectField
          label="Golongan Darah"
          name="bloodType"
          control={control}
          options={bloodTypeOptions}
          error={errors.bloodType}
          placeholder="Pilih Golongan Darah"
          isSearchable={false}
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
        {/* Sex Dropdown - menggunakan SelectField */}
        <div className="w-1/3">
          <SelectField
            label="Jenis Kelamin"
            name="sex"
            control={control}
            options={sexOptions}
            error={errors.sex}
            placeholder="Pilih Jenis Kelamin"
            isSearchable={false}
          />
        </div>
        
        {/* Subjects Multi-Select Dropdown - menggunakan SelectField */}
        <div className="w-2/3">
          <SelectField
            label="Mata Pelajaran"
            name="subjects"
            control={control}
            options={subjectOptions}
            error={errors.subjects}
            placeholder="Pilih Mata Pelajaran..."
            isMulti={true}
            isSearchable={true}
          />
        </div>
      </div>
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

export default TeacherForm;