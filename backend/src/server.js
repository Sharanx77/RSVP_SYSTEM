const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();

// Cloud URL logic
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
})); 
app.use(express.json()); 

// 1. Fetch All Events
app.get('/api/events', async (req, res) => {
    try {
        const events = await prisma.event.findMany({ orderBy: { date: 'asc' } });
        res.status(200).json(events);
    } catch (error) { res.status(500).json({ error: "Failed to fetch events" }); }
});

// 2. RSVP + Generate QR containing a URL
app.post('/api/events/:id/rsvp', async (req, res) => {
    try {
        const eventId = req.params.id;
        const { name, email } = req.body;

        const rsvp = await prisma.rSVP.create({
            data: { name, email, eventId }
        });

        // The QR code now points to your Live Vercel Check-in link
        const checkInUrl = `${FRONTEND_URL}/check-in/${rsvp.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl);
        
        res.status(201).json({ rsvp, qrCode: qrCodeDataUrl });
    } catch (error) { res.status(500).json({ error: "RSVP Failed" }); }
});

// 3. New Check-in Validation Route
app.get('/api/check-in/:rsvpId', async (req, res) => {
    try {
        const { rsvpId } = req.params;
        const rsvp = await prisma.rSVP.findUnique({
            where: { id: rsvpId },
            include: { event: true }
        });

        if (!rsvp) return res.status(404).json({ error: "Invalid Ticket" });

        res.json({ name: rsvp.name, event: rsvp.event.title });
    } catch (error) { res.status(500).json({ error: "Server error" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
