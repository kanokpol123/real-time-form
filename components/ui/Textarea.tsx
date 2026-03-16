"use client";

import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, required, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <label className={`block text-sm font-medium text-gray-700 mb-1 ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}`}>
          {label}
        </label>
        <textarea
          ref={ref}
          rows={3}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-150 resize-none ${error ? "border-red-400" : "border-gray-300"} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">⚠ {error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";