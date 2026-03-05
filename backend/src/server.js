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
app.use(cors()); 
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

        // CRUCIAL: We now put a LINK inside the QR code instead of just an ID
        // This link points to your frontend check-in page
        const checkInUrl = `http://localhost:3000/check-in/${rsvp.id}`;
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
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));