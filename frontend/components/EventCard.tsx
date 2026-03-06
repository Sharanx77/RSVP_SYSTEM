// frontend/components/EventCard.tsx
"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function EventCard({ event }: { event: any }) {
  const [isBooking, setIsBooking] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Generating your unique ticket..." });

    try {
      const res = await fetch(`${API_URL}/api/events/${event.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Submission failed");

      setQrCode(data.qrCode);
      setStatus({ type: "success", message: "You're on the guest list!" });
    } catch (error: any) {
      setStatus({ type: "error", message: error.message });
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-8 hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all duration-500 flex flex-col justify-between min-h-[450px]">
      
      {!qrCode ? (
        <>
          <div>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-white tracking-tight">{event.title}</h2>
            </div>
            
            <p className="text-neutral-400 mb-8 leading-relaxed line-clamp-3">
              {event.description}
            </p>
            
            <div className="space-y-3 mb-10 text-sm text-neutral-500 font-medium">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-neutral-800 rounded-lg text-emerald-400">📅</span>
                {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-3">
                <span className="p-2 bg-neutral-800 rounded-lg text-emerald-400">📍</span>
                {event.location}
              </div>
            </div>
          </div>

          {!isBooking ? (
            <button
              onClick={() => setIsBooking(true)}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 hover:text-white transition-all active:scale-95"
            >
              RSVP NOW
            </button>
          ) : (
            <form onSubmit={handleRSVP} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <input
                type="text"
                required
                placeholder="Full Name"
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              
              {status.message && (
                <p className={`text-xs font-bold text-center ${status.type === "error" ? "text-red-400" : "text-emerald-400"}`}>
                  {status.message}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBooking(false)}
                  className="flex-1 bg-neutral-800 text-white font-bold py-3 rounded-xl hover:bg-neutral-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status.type === "loading"}
                  className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
                >
                  {status.type === "loading" ? "..." : "Confirm"}
                </button>
              </div>
            </form>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 h-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
            <h3 className="text-2xl font-bold text-white">Entry Confirmed</h3>
            <p className="text-neutral-500 text-sm mt-2 font-medium">Please present this QR code at the door.</p>
          </div>
          
          <div className="p-4 bg-white rounded-[24px] shadow-[0_0_60px_rgba(16,185,129,0.3)] border-4 border-emerald-500/10">
            <img src={qrCode} alt="RSVP QR Code" className="w-44 h-44" />
          </div>

          <button 
            onClick={() => { setQrCode(null); setIsBooking(false); setStatus({type: "idle", message: ""}); }} 
            className="text-neutral-500 text-xs font-bold tracking-widest uppercase hover:text-emerald-400 transition-colors"
          >
            Close Ticket
          </button>
        </div>
      )}
    </div>
  );
}
