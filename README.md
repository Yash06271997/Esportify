# Esportify

An esports tournament management platform for participants, organizers, and administrators.

---

## 🚀 Running the Application

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```
Server runs at `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
App opens at `http://localhost:5173`

---

## 🔑 Admin Setup (One-Time)

Admins **cannot** self-register. Use the script below to create an admin account.

**Step 1:** Add these lines to `backend/.env`:
```
ADMIN_NAME=Your Full Name
ADMIN_EMAIL=admin@yoursite.com
ADMIN_PASSWORD=YourSecurePassword123
```

**Step 2:** Run the script:
```bash
cd backend
npm run create-admin
```

**Step 3:** Log in at `/login` using the email and password above. Admin accounts are automatically redirected to the Admin Dashboard.

> ⚠️ After setup, remove `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `.env` for security.

---

## 👤 User Roles

| Role | Sign-up | Access |
|------|---------|--------|
| **Participant** | Public `/register` → select Participant | Browse, create teams, invite players, register for tournaments |
| **Organizer** | Public `/register` → select Organizer | Create and manage tournaments, approve/reject registrations, manage brackets |
| **Admin** | Created via `npm run create-admin` | Full platform control — users, tournaments, registrations |

---

## 🎮 Supported Games & Team Sizes

| Game | Team Size |
|------|-----------|
| Valorant | 5 players |
| CS2 / Counter-Strike | 5 players |
| Dota 2 | 5 players |
| EA SPORTS FC / FIFA | 1 (1v1) or 2 (2v2) — set by organizer |
| PUBG Mobile | 5 players |
| Mobile Legends | 5 players |

---

## 🏆 Participant Workflow

1. **Register** at `/register` → choose Participant → get Player ID (`ESP-XXXXX`)
2. **Browse tournaments** at `/tournaments`
3. **Create a team** for a specific tournament
4. **Invite players** by searching their Player ID or username
5. **Players accept** invitations from their Invitations page
6. Once team is **complete** (all slots filled), leader clicks **Submit Registration**
7. **Organizer approves** the registration
8. Track status in **My Registrations**

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 3, React Router 7, Axios, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** JWT (JSON Web Tokens)

---

## 📁 Project Structure

```
SE Project/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── layouts/   # MainLayout, DashboardLayout
│   │   ├── context/   # AuthContext
│   │   ├── services/  # API (Axios)
│   │   └── components/# Reusable components (GameBadge, etc.)
│   ├── tailwind.config.js
│   └── index.html
├── backend/           # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── scripts/       # createAdmin.js
│   └── .env           # MongoDB URI, JWT secret (never commit)
└── README.md
```
