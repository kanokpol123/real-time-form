import { PatientStatus } from "@/types";

const statusConfig = {
  filling: {
    label: "กำลังกรอก",
    className: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    dot: "bg-yellow-500 animate-pulse",
  },
  submitted: {
    label: "Submit แล้ว",
    className: "bg-green-100 text-green-800 border border-green-300",
    dot: "bg-green-500",
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-600 border border-gray-300",
    dot: "bg-gray-400",
  },
};

export const StatusBadge = ({ status }: { status: PatientStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};