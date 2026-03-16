"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { getOrCreateSessionId, clearSessionId } from "@/lib/session";
import { validateForm, FormErrors } from "@/lib/validation";
import { PatientFormData } from "@/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const GENDER_OPTIONS = [
  { value: "male", label: "ชาย" },
  { value: "female", label: "หญิง" },
  { value: "other", label: "อื่นๆ" },
  { value: "prefer_not_to_say", label: "ไม่ระบุ" },
];

const LANGUAGE_OPTIONS = [
  { value: "th", label: "ภาษาไทย" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "other", label: "อื่นๆ" },
];

const initialFormData: Partial<PatientFormData> = {
  firstName: "", middleName: "", lastName: "",
  dateOfBirth: "", gender: "", phoneNumber: "",
  email: "", address: "", preferredLanguage: "",
  nationality: "", emergencyContactName: "",
  emergencyContactRelationship: "", religion: "",
};

export const PatientForm = () => {
  const [formData, setFormData] = useState<Partial<PatientFormData>>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const sessionIdRef = useRef<string>("");
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const socket = getSocket();
    const sessionId = getOrCreateSessionId();
    sessionIdRef.current = sessionId;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("patient:register", { sessionId });
    });
    socket.on("disconnect", () => setIsConnected(false));

    const handleVisibility = () => {
      socket.emit("patient:status", {
        sessionId,
        status: document.hidden ? "inactive" : "filling",
      });
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleChange = useCallback((field: keyof PatientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (debounceRef.current[field]) clearTimeout(debounceRef.current[field]);
    debounceRef.current[field] = setTimeout(() => {
      const socket = getSocket();
      socket.emit("patient:field_update", {
        sessionId: sessionIdRef.current, field, value,
      });
    }, 300);
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    const socket = getSocket();
    socket.emit("patient:submit", {
      sessionId: sessionIdRef.current,
      formData: formData as PatientFormData,
    });
    setSubmitted(true);
    clearSessionId();
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ส่งข้อมูลสำเร็จ!</h2>
          <p className="text-gray-500 text-sm">เจ้าหน้าที่ได้รับข้อมูลของคุณแล้ว กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ลงทะเบียนผู้ป่วย</h1>
          <p className="text-gray-500 text-sm mt-1">กรุณากรอกข้อมูลให้ครบถ้วน</p>
          <div className={`inline-flex items-center gap-1.5 mt-2 text-xs px-2.5 py-1 rounded-full ${isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {isConnected ? "เชื่อมต่อแล้ว" : "กำลังเชื่อมต่อ..."}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* ข้อมูลส่วนตัว */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-sky-600 uppercase tracking-wider mb-4">ข้อมูลส่วนตัว</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="firstName" label="ชื่อ" required placeholder="กรอกชื่อ"
                value={formData.firstName || ""} onChange={(e) => handleChange("firstName", e.target.value)} error={errors.firstName} />
              <Input id="middleName" label="ชื่อกลาง" placeholder="กรอกชื่อกลาง (ถ้ามี)"
                value={formData.middleName || ""} onChange={(e) => handleChange("middleName", e.target.value)} />
              <Input id="lastName" label="นามสกุล" required placeholder="กรอกนามสกุล"
                value={formData.lastName || ""} onChange={(e) => handleChange("lastName", e.target.value)} error={errors.lastName} />
              <Input id="dateOfBirth" label="วันเกิด" required type="date"
                value={formData.dateOfBirth || ""} onChange={(e) => handleChange("dateOfBirth", e.target.value)} error={errors.dateOfBirth} />
              <Select id="gender" label="เพศ" required options={GENDER_OPTIONS} placeholder="-- เลือกเพศ --"
                value={formData.gender || ""} onChange={(e) => handleChange("gender", e.target.value)} error={errors.gender} />
              <Input id="nationality" label="สัญชาติ" required placeholder="เช่น ไทย"
                value={formData.nationality || ""} onChange={(e) => handleChange("nationality", e.target.value)} error={errors.nationality} />
            </div>
          </div>

          {/* ช่องทางการติดต่อ */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-sky-600 uppercase tracking-wider mb-4">ช่องทางการติดต่อ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="phoneNumber" label="เบอร์โทรศัพท์" required type="tel" placeholder="0XX-XXX-XXXX"
                value={formData.phoneNumber || ""} onChange={(e) => handleChange("phoneNumber", e.target.value)} error={errors.phoneNumber} />
              <Input id="email" label="อีเมล" required type="email" placeholder="example@email.com"
                value={formData.email || ""} onChange={(e) => handleChange("email", e.target.value)} error={errors.email} />
              <div className="sm:col-span-2">
                <Textarea id="address" label="ที่อยู่" required placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด"
                  value={formData.address || ""} onChange={(e) => handleChange("address", e.target.value)} error={errors.address} />
              </div>
              <Select id="preferredLanguage" label="ภาษาที่ต้องการใช้" required options={LANGUAGE_OPTIONS} placeholder="-- เลือกภาษา --"
                value={formData.preferredLanguage || ""} onChange={(e) => handleChange("preferredLanguage", e.target.value)} error={errors.preferredLanguage} />
            </div>
          </div>

          {/* ผู้ติดต่อฉุกเฉิน */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-sky-600 uppercase tracking-wider mb-1">ผู้ติดต่อฉุกเฉิน</h2>
            <p className="text-xs text-gray-400 mb-4">ไม่บังคับ</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="emergencyContactName" label="ชื่อผู้ติดต่อ" placeholder="ชื่อ-นามสกุล"
                value={formData.emergencyContactName || ""} onChange={(e) => handleChange("emergencyContactName", e.target.value)} />
              <Input id="emergencyContactRelationship" label="ความสัมพันธ์" placeholder="เช่น บิดา, มารดา"
                value={formData.emergencyContactRelationship || ""} onChange={(e) => handleChange("emergencyContactRelationship", e.target.value)} />
            </div>
          </div>

          {/* ข้อมูลเพิ่มเติม */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-sky-600 uppercase tracking-wider mb-1">ข้อมูลเพิ่มเติม</h2>
            <p className="text-xs text-gray-400 mb-4">ไม่บังคับ</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="religion" label="ศาสนา" placeholder="เช่น พุทธ, คริสต์, อิสลาม"
                value={formData.religion || ""} onChange={(e) => handleChange("religion", e.target.value)} />
            </div>
          </div>

          {/* Submit */}
          <div className="px-6 py-5">
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />กำลังส่งข้อมูล...</>
              ) : "ยืนยันข้อมูล →"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};