import { PatientFormData } from "@/types";

export type FormErrors = Partial<Record<keyof PatientFormData, string>>;

export const validateForm = (data: Partial<PatientFormData>): FormErrors => {
  const errors: FormErrors = {};

  if (!data.firstName?.trim()) errors.firstName = "กรุณากรอกชื่อ";
  if (!data.lastName?.trim()) errors.lastName = "กรุณากรอกนามสกุล";
  if (!data.dateOfBirth) errors.dateOfBirth = "กรุณาเลือกวันเกิด";
  if (!data.gender) errors.gender = "กรุณาเลือกเพศ";
  if (!data.address?.trim()) errors.address = "กรุณากรอกที่อยู่";
  if (!data.preferredLanguage) errors.preferredLanguage = "กรุณาเลือกภาษาที่ต้องการ";
  if (!data.nationality?.trim()) errors.nationality = "กรุณากรอกสัญชาติ";

  if (!data.phoneNumber?.trim()) {
    errors.phoneNumber = "กรุณากรอกเบอร์โทรศัพท์";
  } else if (!/^[0-9+\-\s()]{7,15}$/.test(data.phoneNumber.trim())) {
    errors.phoneNumber = "รูปแบบเบอร์โทรไม่ถูกต้อง";
  }

  if (!data.email?.trim()) {
    errors.email = "กรุณากรอกอีเมล";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  }

  return errors;
};

export const validateField = (
  field: keyof PatientFormData,
  value: string
): string => {
  const errors = validateForm({ [field]: value });
  return errors[field] || "";
};