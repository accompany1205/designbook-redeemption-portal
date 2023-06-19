import React, { forwardRef } from "react";
import { BiErrorCircle } from "react-icons/bi";

const TextInput = forwardRef(
  ({ label, name, id, error, isPassword, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <label className="font-semibold text-gray-500">{label}:</label>
        <input
          className="border-binput rounded-md p-2 py-2.5 focus:bg-purple focus:bg-opacity-20 border"
          ref={ref}
          type={isPassword ? "password" : "text"}
          name={name}
          id={id}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">
            <BiErrorCircle className="mb-0.5 inline mr-1" color="red" />
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
