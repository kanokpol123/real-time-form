"use client";

import { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { PatientSession, FieldUpdatePayload, SubmitPayload, StatusChangePayload } from "@/types";
import { SessionCard } from "@/components/staff/SessionCard";

type FilterType = "all" | "filling" | "submitted" | "inactive";

export const StaffDashboard = () => {
  const [sessions, setSessions] = useState<Record<string, PatientSession>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("staff:join");
    });
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("staff:snapshot", (data: Record<string, Omit<PatientSession, "sessionId">>) => {
      const mapped: Record<string, PatientSession> = {};
      Object.entries(data).forEach(([sessionId, s]) => {
        mapped[sessionId] = { ...s, sessionId };
      });
      setSessions(mapped);
    });

    socket.on("staff:new_session", ({ sessionId }: { sessionId: string }) => {
      setSessions((prev) => ({ ...prev, [sessionId]: { sessionId, status: "filling", fields: {} } }));
      setLastUpdate(new Date());
    });

    socket.on("staff:field_update", ({ sessionId, field, value }: FieldUpdatePayload) => {
      setSessions((prev) => ({
        ...prev,
        [sessionId]: {
          ...prev[sessionId],
          sessionId,
          status: "filling",
          fields: { ...prev[sessionId]?.fields, [field]: value },
        },
      }));
      setLastUpdate(new Date());
    });

    socket.on("staff:submitted", ({ sessionId, formData }: SubmitPayload) => {
      setSessions((prev) => ({
        ...prev,
        [sessionId]: { ...prev[sessionId], sessionId, status: "submitted", fields: formData },
      }));
      setLastUpdate(new Date());
    });

    socket.on("staff:status_change", ({ sessionId, status }: StatusChangePayload) => {
      setSessions((prev) => ({
        ...prev,
        [sessionId]: { ...prev[sessionId], sessionId, status },
      }));
      setLastUpdate(new Date());
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("staff:snapshot");
      socket.off("staff:new_session");
      socket.off("staff:field_update");
      socket.off("staff:submitted");
      socket.off("staff:status_change");
    };
  }, []);

  const allSessions = Object.values(sessions);
  const filtered = filter === "all" ? allSessions : allSessions.filter((s) => s.status === filter);
  const counts = {
    all: allSessions.length,
    filling: allSessions.filter((s) => s.status === "filling").length,
    submitted: allSessions.filter((s) => s.status === "submitted").length,
    inactive: allSessions.filter((s) => s.status === "inactive").length,
  };

  const filterConfig = [
    { key: "all" as FilterType, label: "ทั้งหมด", color: "bg-sky-500" },
    { key: "filling" as FilterType, label: "กำลังกรอก", color: "bg-yellow-500" },
    { key: "submitted" as FilterType, label: "Submit แล้ว", color: "bg-green-500" },
    { key: "inactive" as FilterType, label: "Inactive", color: "bg-gray-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-xs text-gray-400">Real-time Patient Monitor</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <p className="text-xs text-gray-400 hidden sm:block">
                อัปเดต: {lastUpdate.toLocaleTimeString("th-TH")}
              </p>
            )}
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
              isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              {isConnected ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {filterConfig.map(({ key, label, color }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`bg-white rounded-xl border-2 p-4 text-left transition-all duration-150 hover:shadow-md ${
                filter === key ? "border-sky-400 shadow-md" : "border-gray-100"
              }`}>
              <p className="text-2xl font-bold text-gray-900">{counts[key]}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Sessions */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏥</div>
            <p className="text-gray-400 font-medium">
              {allSessions.length === 0 ? "รอผู้ป่วยเริ่มกรอกข้อมูล..." : "ไม่มีผู้ป่วยในหมวดนี้"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((session) => (
              <SessionCard key={session.sessionId} session={session} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};