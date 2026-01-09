# Live Polling System

## Overview
The **Live Polling System** is a real-time classroom polling application.  
Teachers can create polls, and students can join instantly to submit their answers.  
The system is **resilient**, meaning polls do not break on refresh and timers remain synchronized for all users.

Built using **React, Node.js, Express, Socket.io and MongoDB**.

---

## Key Features

### Teacher
- Create live polls with multiple options  
- Set a time limit for each poll  
- View real-time results as students vote  
- Poll state remains intact on page refresh  

### Student
- Join polls by entering a name  
- Submit answers in real time  
- Server-synced timer for fair participation  
- View live results after submission  

---

## Tech Stack
- **Frontend:** React, Vite, TailwindCSS  
- **Backend:** Node.js, Express  
- **Real-Time Communication:** Socket.io  
- **Deployment:** Vercel (Frontend), Render (Backend)
- **Data persistance:** MongoDB

---

## Installation

### Clone the Repository
```bash
git clone https://github.com/yourusername/live-polling-system.git
cd live-polling-system
