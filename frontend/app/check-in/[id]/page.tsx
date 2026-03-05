// frontend/app/check-in/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function CheckInPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/check-in/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white text-center">
      <div className="max-w-md w-full bg-neutral-900 border border-emerald-500/30 p-10 rounded-[40px]">
        {error ? (
          <h1 className="text-3xl font-bold text-red-400">Invalid Ticket</h1>
        ) : data ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl">✅</div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Access Granted</h1>
            <p className="text-2xl font-bold text-emerald-400">{data.name}</p>
            <p className="text-neutral-500 italic">{data.event}</p>
          </div>
        ) : (
          <p className="animate-pulse text-emerald-500 font-bold">VERIFYING...</p>
        )}
      </div>
    </div>
  );
}
