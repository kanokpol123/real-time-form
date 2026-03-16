export const getOrCreateSessionId = (): string => {
  if (typeof window === "undefined") return "";

  const stored = localStorage.getItem("patient_session_id");
  if (stored) return stored;

  const newId = `patient_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem("patient_session_id", newId);
  return newId;
};

export const clearSessionId = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("patient_session_id");
  }
};