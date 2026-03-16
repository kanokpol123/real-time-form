import { PatientSession, PatientFormData } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

const FIELD_LABELS: Record<keyof PatientFormData, string> = {
  firstName: "ชื่อ",
  middleName: "ชื่อกลาง",
  lastName: "นามสกุล",
  dateOfBirth: "วันเกิด",
  gender: "เพศ",
  phoneNumber: "เบอร์โทร",
  email: "อีเมล",
  address: "ที่อยู่",
  preferredLanguage: "ภาษาที่ต้องการ",
  nationality: "สัญชาติ",
  emergencyContactName: "ผู้ติดต่อฉุกเฉิน",
  emergencyContactRelationship: "ความสัมพันธ์",
  religion: "ศาสนา",
};

export const SessionCard = ({ session }: { session: PatientSession }) => {
  const { sessionId, status, fields } = session;
  const shortId = sessionId.split("_").pop() || sessionId.slice(-6);
  const filledCount = Object.values(fields).filter(Boolean).length;

  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 ${
      status === "submitted" ? "border-green-200" :
      status === "filling" ? "border-yellow-200" : "border-gray-100"
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${
        status === "submitted" ? "bg-green-50" :
        status === "filling" ? "bg-yellow-50" : "bg-gray-50"
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 font-bold text-sm">
            {fields.firstName ? fields.firstName.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">
              {fields.firstName || fields.lastName
                ? `${fields.firstName || ""} ${fields.lastName || ""}`.trim()
                : `ผู้ป่วย #${shortId}`}
            </p>
            <p className="text-xs text-gray-400">ID: {shortId}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Progress */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">กรอกแล้ว {filledCount}/13 fields</span>
          <span className="text-xs font-medium text-sky-600">{Math.round((filledCount / 13) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${status === "submitted" ? "bg-green-500" : "bg-sky-500"}`}
            style={{ width: `${Math.round((filledCount / 13) * 100)}%` }}
          />
        </div>
      </div>

      {/* Fields */}
      <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {(Object.keys(FIELD_LABELS) as (keyof PatientFormData)[]).map((field) => (
          <div key={field} className="min-w-0">
            <p className="text-xs text-gray-400 truncate">{FIELD_LABELS[field]}</p>
            <p className={`text-sm truncate ${fields[field] ? "text-gray-900 font-medium" : "text-gray-300"}`}>
              {fields[field] || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};