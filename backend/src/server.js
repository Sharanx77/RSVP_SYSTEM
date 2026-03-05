const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

// --- DATABASE SETUP (Prisma 7 + Neon) ---
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();

// --- SECURE CORS CONFIGURATION ---
// IMPORTANT: Once you deploy to Vercel, replace the second link with your actual Vercel URL
app.use(cors({
    origin: [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://rsvp-system-4685.vercel.app" // REPLACE THIS with your real Vercel link later
    ],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json()); 

// --- ROUTES ---

// 1. Fetch All Events
app.get('/api/events', async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'asc' }
        });
        res.status(200).json(events);
    } catch (error) {
        console.error("Fetch Events Error:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// 2. Process RSVP + Generate QR Ticket
app.post('/api/events/:id/rsvp', async (req, res) => {
    try {
        const eventId = req.params.id;
        const { name, email } = req.body;

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { _count: { select: { rsvps: true } } }
        });

        if (!event) return res.status(404).json({ error: "Event not found" });
        
        if (event._count.rsvps >= event.capacity) {
            return res.status(400).json({ error: "This event is at full capacity!" });
        }

        const rsvp = await prisma.rSVP.create({
            data: { name, email, eventId }
        });

        // Generate a URL for the QR code that points to the check-in page
        // In production, 'localhost:3000' should eventually be your Vercel URL
        const checkInUrl = `http://localhost:3000/check-in/${rsvp.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl);
        
        res.status(201).json({ 
            message: "RSVP successful!", 
            rsvp,
            qrCode: qrCodeDataUrl 
        });

    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "This email is already registered." });
        }
        res.status(500).json({ error: "Server error" });
    }
});

// 3. Admin Check-in Validation
app.get('/api/check-in/:rsvpId', async (req, res) => {
    try {
        const { rsvpId } = req.params;
        const rsvp = await prisma.rSVP.findUnique({
            where: { id: rsvpId },
            include: { event: true }
        });

        if (!rsvp) return res.status(404).json({ error: "Invalid Ticket ID" });

        res.json({ 
            name: rsvp.name, 
            event: rsvp.event.title,
            status: "Verified" 
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
