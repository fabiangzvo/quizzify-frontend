import React, { HTMLInputTypeAttribute } from "react";
import { useController, Control } from "react-hook-form";
import _get from "lodash.get";

interface FormInputProps {
  type: HTMLInputTypeAttribute;
  label: string;
  name: string;
  config?: Record<string, unknown>;
  isRequired?: boolean;
  control: Control<any>;
}

function FormInput(props: FormInputProps) {
  const { isRequired = false, label, name = "", config, control, type } = props;

  const {
    field,
    formState: { errors },
  } = useController({
    name,
    control,
    rules: {
      required: { value: isRequired, message: `${label} is required` },
      ...config,
    },
  });

  const error = _get(errors, `${name}.message`, "") as string;

  return (
    <div className="flex flex-col w-full">
      <span className="text-lg">{label}:</span>
      <input
        type={type}
        className="bg-black border border-gray-600 rounded-md px-2 h-9 text-lg focus-visible:border focus-visible:border-blue-700"
        {...field}
      />
      <div className="mt-1 mb-3 h-4">
        {error && <span className="text-red-500 font-semibold">{error}</span>}
      </div>
    </div>
  );
}

export default FormInput;
