require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Get All Events
app.get('/api/events', async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'asc' }
        });
        res.status(200).json(events);
    } catch (error) { 
        res.status(500).json({ error: "Failed to fetch events" }); 
    }
});

// 2. RSVP to an Event (With Duplicate Checker)
app.post('/api/events/:id/rsvp', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        // CHECK: Does this email already have a ticket for this specific event?
        const existingRsvp = await prisma.rsvp.findFirst({
            where: {
                email: email,
                eventId: id
            }
        });

        let rsvpId;
        let isDuplicate = false;

        if (existingRsvp) {
            // They already RSVP'd! Grab their existing database ID.
            rsvpId = existingRsvp.id;
            isDuplicate = true;
        } else {
            // New guest! Create a new database entry.
            const newRsvp = await prisma.rsvp.create({
                data: { name, email, eventId: id }
            });
            rsvpId = newRsvp.id;
        }

        // Generate the QR code link using whichever ID we got above
        const qrUrl = `${process.env.FRONTEND_URL}/check-in/${rsvpId}`;
        const qrCode = await QRCode.toDataURL(qrUrl);

        // Send the QR code back, along with a custom message
        res.status(200).json({ 
            qrCode,
            message: isDuplicate ? "Ticket retrieved! You were already on the list." : "You're on the guest list!"
        });

    } catch (error) { 
        res.status(500).json({ error: "Submission failed" }); 
    }
});

// 3. Admin Route: Validate a Ticket (QR Code Scan)
app.get('/api/check-in/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const rsvp = await prisma.rsvp.findUnique({
            where: { id: id },
            include: { event: true } 
        });

        if (!rsvp) return res.status(404).json({ error: "Invalid or Fake Ticket!" });

        res.status(200).json({
            name: rsvp.name,
            event: rsvp.event.title,
            status: "Valid"
        });
    } catch (error) { 
        res.status(500).json({ error: "Server connection failed" }); 
    }
});

// 4. Admin Route: Create a New Event
app.post('/api/events', async (req, res) => {
    try {
        const { title, description, date, location, capacity } = req.body;
        const newEvent = await prisma.event.create({
            data: { title, description, date: new Date(date), location, capacity }
        });
        res.status(201).json(newEvent);
    } catch (error) { 
        res.status(500).json({ error: "Failed to create event" }); 
    }
});

// 5. Admin Route: Download Attendees as CSV
app.get('/api/events/:id/attendees', async (req, res) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findUnique({
            where: { id: id },
            include: { rsvps: true } 
        });

        if (!event) return res.status(404).json({ error: "Event not found" });

        let csv = "Name,Email,Ticket ID\n";
        event.rsvps.forEach(guest => {
            csv += `"${guest.name}","${guest.email}","${guest.id}"\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`${event.title.replace(/\s+/g, '_')}_GuestList.csv`);
        return res.send(csv);

    } catch (error) { 
        res.status(500).json({ error: "Failed to generate CSV" }); 
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
