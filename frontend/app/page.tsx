// frontend/app/page.tsx
import EventCard from "../components/EventCard";

/**
 * PRODUCTION URL LOGIC:
 * This variable will look for the 'NEXT_PUBLIC_API_URL' you set in Vercel.
 * If it's not found (like when you're working locally), it defaults to your local server.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

// The Fetch Engine: Retrieves live event data from your Express server
async function getEvents() {
  const res = await fetch(`${API_URL}/api/events`, { 
    cache: 'no-store' // Ensures fresh data on every refresh
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch event data from the server');
  }
  
  return res.json();
}

export default async function Home() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-sans">
      
      {/* Ambient Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-blue-900/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
        
        {/* Premium Header / Hero Section */}
        <div className="max-w-4xl mb-24 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Event Status
          </div>
          
          <h1 className="text-6xl lg:text-9xl font-black tracking-tighter leading-[0.85]">
            CURATED <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">
              EXPERIENCES.
            </span>
          </h1>
          
          <p className="text-neutral-400 text-lg lg:text-2xl font-light max-w-2xl leading-relaxed">
            The next generation of event management. Explore exclusive gatherings and secure your access with our seamless RSVP system.
          </p>
        </div>

        {/* Visual Divider */}
        <div className="flex items-center gap-6 mb-16">
          <h2 className="text-sm font-black tracking-[0.3em] uppercase text-neutral-600 whitespace-nowrap">
            Upcoming Schedule
          </h2>
          <div className="h-[1px] w-full bg-gradient-to-r from-neutral-800 to-transparent" />
        </div>

        {/* Event List Section */}
        {events.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center border border-neutral-800 rounded-[40px] bg-neutral-900/20 backdrop-blur-sm text-center px-4">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-neutral-500 text-xl font-semibold">The event list is currently empty.</p>
            <p className="text-neutral-600 mt-2">Check your backend terminal or add an event via the API.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {events.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-40 pt-10 border-t border-neutral-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-700 text-xs font-bold tracking-widest uppercase italic">
            B SHARANA BASAVA x GEMINI AI 
          </p>
          <div className="flex gap-8 text-neutral-600 text-xs font-medium">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">API v1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
