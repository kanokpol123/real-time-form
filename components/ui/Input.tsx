"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, required, error, hint, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <label className={`block text-sm font-medium text-gray-700 mb-1 ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}`}>
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-150 ${error ? "border-red-400" : "border-gray-300"} ${className}`}
          {...props}
        />
        {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-500">⚠ {error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";