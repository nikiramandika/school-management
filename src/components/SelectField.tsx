import { Control, Controller } from "react-hook-form";
import Select from "react-select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  control: Control<any>;
  options: SelectOption[];
  error?: any;
  placeholder?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  hidden?: boolean;
  valueAsNumber?: boolean; 
}

const SelectField = ({
  label,
  name,
  control,
  options,
  error,
  placeholder = "Pilih...",
  isMulti = false,
  isSearchable = true,
  isClearable = true,
  hidden = false,
  valueAsNumber = false, // Default false
}: SelectFieldProps) => {
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "38px",
      height: "38px",
      border: state.isFocused
        ? document.documentElement.classList.contains("dark")
          ? "1.5px solid rgb(78, 87, 98)"
          : "1.5px solid rgb(178, 185, 196)"
        : document.documentElement.classList.contains("dark")
        ? "1.5px solid #d1d5db"
        : "1.5px solid #d1d5db",
      borderRadius: "6px",
      boxShadow: "none",
      "&:hover": {
        borderColor: document.documentElement.classList.contains("dark")
          ? "#d1d5db"
          : "#d1d5db",
      },
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#27272e"
        : "white",
      cursor: "pointer",
      fontSize: "14px",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "2px 8px",
      minHeight: "38px",
      display: "flex",
      alignItems: "center",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: document.documentElement.classList.contains("dark")
        ? "#d1d5db"
        : "#374151",
      fontSize: "14px",
      margin: "0",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#f0f9ff",
      border: "1px solid #e0f2fe",
      borderRadius: "6px",
      padding: "1px",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#0c4a6e",
      fontSize: "13px",
      fontWeight: "500",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#0891b2",
      "&:hover": {
        backgroundColor: "#dc2626",
        color: "#ffffff",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: "6px",
      border: "1.5px solid #d1d5db",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      zIndex: 9999,
      marginTop: "4px",
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#27272e"
        : "white",
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: "4px",
      maxHeight: "200px",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#06b6d4"
        : state.isFocused
        ? "#f0f9ff"
        : "transparent",
      color: state.isSelected
        ? "#ffffff"
        : state.isFocused
        ? "#0c4a6e"
        : document.documentElement.classList.contains("dark")
        ? "#d1d5db"
        : "#374151",
      borderRadius: "4px",
      margin: "2px 0",
      padding: "8px 12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: state.isSelected ? "500" : "400",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
      fontSize: "14px",
    }),
    input: (provided: any) => ({
      ...provided,
      color: document.documentElement.classList.contains("dark")
        ? "#d1d5db"
        : "#374151",
      fontSize: "14px",
      margin: "0",
      padding: "0",
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: "#d1d5db",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "#6b7280",
      "&:hover": {
        color: "#06b6d4",
      },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: "#6b7280",
      "&:hover": {
        color: "#dc2626",
      },
    }),
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${hidden ? "hidden" : ""}`}>
      <label className="text-xs text-gray-500">{label}</label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const commonProps = {
            isSearchable,
            isClearable,
            options,
            styles: customSelectStyles,
            placeholder,
            className: "react-select-container",
            classNamePrefix: "react-select",
          };

          if (isMulti) {
            const selectedValues = (field.value || []).map((val: string) =>
              options.find((opt) => opt.value === val)
            );

            return (
              <Select
                {...commonProps}
                isMulti
                value={selectedValues}
                onChange={(selected) =>
                  field.onChange(
                    selected ? selected.map((s: any) => s.value) : []
                  )
                }
              />
            );
          } else {
            let selectedValue;
            if (field.value !== undefined && field.value !== null) {
              const searchValue = valueAsNumber ? String(field.value) : field.value;
              selectedValue = options.find((opt) => opt.value === searchValue);
            }

            return (
              <Select
                {...commonProps}
                value={selectedValue}
                onChange={(selected) => {
                  if (selected) {
                    const newValue = valueAsNumber ? Number(selected.value) : selected.value;
                    field.onChange(newValue);
                  } else {
                    field.onChange(null);
                  }
                }}
              />
            );
          }
        }}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default SelectField;