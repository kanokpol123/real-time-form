"use client";

import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, required, error, placeholder, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <label className={`block text-sm font-medium text-gray-700 mb-1 ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}`}>
          {label}
        </label>
        <select
          ref={ref}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-150 ${error ? "border-red-400" : "border-gray-300"} ${className}`}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">⚠ {error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";