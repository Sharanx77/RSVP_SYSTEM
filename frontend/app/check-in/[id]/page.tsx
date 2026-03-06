"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function CheckInPage() {
  const params = useParams();
  const id = params?.id; 
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return; 

    fetch(`${API_URL}/api/check-in/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server connection failed or invalid ticket.");
        return res.json();
      })
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch((err) => {
        console.error("Mobile Fetch Error:", err);
        setError("Network error. Please check your connection.");
      });
  }, [id]);

  return (
    // FIX 1: Changed min-h-screen to min-h-[100dvh] for mobile address bars
    <div className="min-h-[100dvh] bg-black flex items-center justify-center p-6 text-white text-center">
      <div className="max-w-md w-full bg-neutral-900 border border-emerald-500/30 p-10 rounded-[40px] shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        {error ? (
          <div className="space-y-4">
            <div className="text-5xl">⚠️</div>
            <h1 className="text-3xl font-bold text-red-400">Error</h1>
            <p className="text-neutral-500">{error}</p>
          </div>
        ) : data ? (
          // FIX 2: Removed the opacity animation that was freezing Chrome
          <div className="space-y-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl">✅</div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Access Granted</h1>
            <div className="space-y-1">
              <p className="text-neutral-500 text-sm font-bold tracking-widest uppercase">Guest Name</p>
              <p className="text-2xl font-bold text-emerald-400">{data.name}</p>
            </div>
            <div className="pt-6 border-t border-neutral-800">
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">Event</p>
              <p className="text-white font-medium italic">{data.event}</p>
            </div>
          </div>
        ) : (
          <p className="animate-pulse text-emerald-500 font-bold tracking-widest">VERIFYING TICKET...</p>
        )}
      </div>
    </div>
  );
}
