import { UseFormRegister } from "react-hook-form";

interface InputFieldProps {
  label: string;
  name: string;
  defaultValue?: any;
  register: UseFormRegister<any>;
  error?: any;
  type?: string;
  hidden?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const InputField = ({
  label,
  name,
  defaultValue,
  register,
  error,
  type = "text",
  hidden = false,
  min,
  max,
  step,
}: InputFieldProps) => {
  return (
    <div className={`flex flex-col gap-2 w-full ${hidden ? "hidden" : ""}`}>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        {...register(name)}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
