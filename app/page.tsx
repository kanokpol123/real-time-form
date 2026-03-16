import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-blue-500">Agnos Health</h1>
          <p className="text-gray-500 text-sm mt-1">
            บริการสุขภาพอัจฉริยะ ดูแลคุณ ทุกที่ทุกเวลา
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/patient"
            className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-150">กรอกข้อมูลผู้ป่วย
          </Link>
          <Link
            href="/staff"
            className="flex items-center justify-center w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border-2 border-gray-200 transition-colors duration-150">Staff Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
