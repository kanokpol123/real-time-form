export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
  preferredLanguage: string;
  nationality: string;

  // Optional
  middleName?: string; 
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  religion?: string;
}

export interface SubmitPayload {
  sessionId: string;
  formData: PatientFormData;
}

// สถานะของผู้ป่วย
export type PatientStatus = "filling" | "submitted" | "inactive";

export interface PatientSession {
  sessionId: string;
  status: PatientStatus;
  fields: Partial<PatientFormData>;
  lastActivity?: number;
}

export interface FieldUpdatePayload {
  sessionId: string;
  field: keyof PatientFormData;
  value: string;
  status: PatientStatus;
}

export interface StatusChangePayload {
  sessionId: string;
  status: PatientStatus;
}