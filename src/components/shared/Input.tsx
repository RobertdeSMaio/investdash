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
      <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <div className="relative">
        <input
          {...rest}
          type={isPassword && show ? "text" : type}
          className={`w-full rounded-lg bg-[var(--bg-tertiary)] border px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 transition
            ${hasError ? "border-red-500 focus:ring-red-500" : "border-[var(--border)] focus:ring-emerald-500"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hasError && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
