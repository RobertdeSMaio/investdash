import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
}

export function Input({ label, error, touched, type, ...rest }: InputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const hasError = touched && error;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <input
          {...rest}
          type={isPassword && show ? "text" : type}
          className={`w-full rounded-lg bg-gray-800 border px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition
            ${hasError ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-emerald-500"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hasError && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
