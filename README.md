# 🎟️ Premium Event RSVP & Ticketing System

**Author:** B Sharana Basava  
**Context:** Web Development Internship Project at Elevate Labs  

***WEBSITE LINK:***[***RSVP SYSTEM***](https://rsvp-system-lime.vercel.app)

## 📌 Project Overview
A full-stack, cloud-native event management and ticketing platform. This system allows users to browse curated events, seamlessly RSVP, and instantly receive a dynamic QR code ticket. It includes an admin check-in interface designed for mobile scanners at the door to validate guests against a live cloud database.

## 🚀 Tech Stack & Architecture
This project utilizes a decoupled frontend and backend architecture, connected via a RESTful API and deployed across multiple cloud environments.

**Frontend (Client & Server Components)**
* **Framework:** Next.js (App Router)
* **UI/Styling:** React, Tailwind CSS
* **Deployment:** Vercel

**Backend (REST API & Database)**
* **Runtime / Framework:** Node.js, Express.js
* **Database:** PostgreSQL (Hosted on Neon Serverless Postgres)
* **ORM:** Prisma
* **Ticket Generation:** qrcode library (Base64 data URLs)
* **Deployment:** Render

---

## ✨ Key Features
1. **Dynamic Event Fetching:** Next.js Server Components fetch live event data directly from the Express backend, ensuring the UI is always up-to-date.
2. **Automated Digital Ticketing:** Upon RSVP, the Express server securely writes to the PostgreSQL database and generates a unique QR code containing a dynamic validation link.
3. **Mobile-Optimized Admin Check-in:** A secure Next.js route (/check-in/[id]) that reads scanned QR parameters and validates the guest's database ID in real-time.
4. **Premium Dark-Mode UI:** Built with Tailwind CSS, featuring subtle blur effects, gradient text, and responsive layouts.

---

## 🛠️ Engineering Challenges & Solutions

Building a distributed system required solving several real-world cloud and network routing challenges:

* **Next.js Build-Time Timeouts on Vercel:** * *Challenge:* Vercel's build process attempted to fetch API data before the Render backend was fully accessible, causing deployment timeouts.
  * *Solution:* Implemented Next.js route segment configs (export const dynamic = "force-dynamic") to explicitly bypass build-time static generation and force real-time client fetching.
* **Strict CORS Security & Environment Variables:** * *Challenge:* The Express backend rejected Next.js API calls due to Cross-Origin Resource Sharing (CORS) policies.
  * *Solution:* Engineered a dynamic environment variable system (NEXT_PUBLIC_API_URL and FRONTEND_URL) to securely whitelist production Vercel domains while preserving local development capability.
* **Mobile Browser Viewport & Repaint Bugs:** * *Challenge:* Mobile Chrome failed to render the Check-In page correctly due to mobile address bar height shifts and GPU animation freezing (resulting in a blank white screen).
  * *Solution:* Upgraded CSS architecture to use dynamic viewport heights (min-h-[100dvh]) and removed conflicting opacity animations for mobile-specific routes.
* **Node.js IPv6 Localhost Resolution:** * *Challenge:* fetch failed errors during local development because Next.js defaulted to IPv6 (::1) while Express listened on IPv4.
  * *Solution:* Hardcoded IPv4 routing (127.0.0.1) during the local development phase to ensure stable server-to-server communication.

---

## 💻 Local Setup Instructions

To run this project locally, clone the repository and set up both environments.

### 1. Database & Backend Setup
Navigate to the backend directory and install dependencies:
```
cd backend
npm install
```
Create a .env file in the backend folder:
```
DATABASE_URL="postgresql://<user>:<password>@<neon-hostname>/<dbname>?sslmode=require"
FRONTEND_URL="http://localhost:3000"
PORT=5000
```
Run Prisma migrations and start the server:
```
npx prisma generate
npx prisma db push
node server.js
```
### 2. Frontend Setup
Navigate to the frontend directory and install dependencies:
```
cd frontend
npm install
```

Create a .env.local file in the frontend folder:
```
NEXT_PUBLIC_API_URL="http://127.0.0.1:5000"
```
Start the Next.js development server:
```
npm run dev
```

---
*Designed and engineered by an ECE student pushing the boundaries of full-stack web development.*
