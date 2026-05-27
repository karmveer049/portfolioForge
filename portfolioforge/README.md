# PortfolioForge — AI Portfolio Generator

> A full-stack SaaS platform that generates premium animated developer portfolio websites automatically.

Users fill a multi-step form → AI enhances their content → a React portfolio is generated → pushed to GitHub → deployed to GitHub Pages → live URL emailed to the user.

---

## Architecture

```
portfolioforge/
├── frontend/          # React + Vite + Tailwind + Framer Motion
│   └── src/
│       ├── pages/     # Landing, Login, Register, Dashboard, Builder, Admin
│       ├── components/
│       ├── context/   # AuthContext (JWT)
│       └── lib/       # axios API client
│
└── backend/           # Node.js + Express + MongoDB
    └── src/
        ├── routes/    # auth, portfolio, upload, ai, admin
        ├── models/    # User, Portfolio (Mongoose)
        ├── services/  # generator.js, ai.js, email.js
        ├── templates/ # portfolioTemplate.js (code generation engine)
        └── middleware/ # JWT auth
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>

# Backend
cd portfolioforge/backend
npm install
cp .env.example .env
# Fill in your credentials in .env

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Required credentials

| Service | Where to get it | Used for |
|---------|----------------|----------|
| **MongoDB Atlas** | mongodb.com/atlas | Database (free tier works) |
| **Gemini API** | aistudio.google.com | AI bio/description improvement |
| **Cloudinary** | cloudinary.com | Resume + image uploads |
| **Gmail SMTP** | Google App Password | Sending emails |
| **GitHub Token** *(optional)* | github.com/settings/tokens | Auto-push + deploy portfolios |

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:4000/api/health

---

## GitHub Auto-Deploy Setup

To enable automatic portfolio deployment:

1. Go to github.com/settings/tokens → **Generate new token (classic)**
2. Select scopes: `repo`, `workflow`, `admin:repo_hook`
3. Add to backend `.env`:
   ```
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
   GITHUB_USERNAME=your-github-username
   ```

When a user submits the form:
1. A GitHub repo is created via the API
2. The generated React code is committed and pushed
3. GitHub Pages is enabled automatically
4. User receives the URL: `https://USERNAME.github.io/REPO-NAME`

---

## Gmail SMTP Setup

1. Enable 2-factor authentication on your Google account
2. Go to myaccount.google.com → Security → App Passwords
3. Generate an app password for "Mail"
4. Add to `.env`:
   ```
   SMTP_USER=your@gmail.com
   SMTP_PASS=xxxx-xxxx-xxxx-xxxx   # 16-char app password
   ```

---

## Admin Panel

Create an admin user directly in MongoDB:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

Then visit `/admin` — you'll see:
- All users and their portfolio count
- All portfolios with generation status
- Manual deployment trigger
- Delete users/portfolios

---

## Portfolio Generation Flow

```
User submits form
        ↓
Portfolio saved to MongoDB (status: pending)
        ↓
queuePortfolioGeneration() fires (async, non-blocking)
        ↓
AI improves short bios via Gemini
        ↓
generatePortfolioCode() writes React files to /tmp
        ↓
deployToGitHub() creates repo, pushes code, enables Pages
        ↓
Portfolio updated (status: live, deployedUrl set)
        ↓
sendPortfolioLiveEmail() sends URL to user
```

If GitHub credentials are not configured, the portfolio is marked `pending` and an admin can manually deploy later.

---

## Deployment

### Deploy backend (Railway / Render)

1. Create a new service on [Railway](https://railway.app) or [Render](https://render.com)
2. Connect your GitHub repo
3. Set root directory: `backend`
4. Add all environment variables from `.env.example`
5. Start command: `npm start`

### Deploy frontend (Vercel)

1. Import your repo on [vercel.com](https://vercel.com)
2. Set root directory: `frontend`
3. Add `VITE_API_URL=https://your-backend.railway.app/api`
4. Deploy

---

## Themes Available

| Theme ID | Name | Style |
|----------|------|-------|
| `soft-editorial` | Soft Editorial | Off-white bg, charcoal text, amber |
| `warm-library` | Warm Library | Dark walnut bg, cream text, amber |
| `espresso` | Espresso | Deep dark bg, warm cream, caramel |
| `studio-journal` | Studio Journal | Parchment bg, mocha text |

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Hook Form, React Router  
**Backend:** Node.js, Express, MongoDB + Mongoose, JWT, Bcrypt  
**AI:** Google Gemini 1.5 Flash  
**Storage:** Cloudinary  
**Email:** Nodemailer (SMTP)  
**Deployment:** GitHub API, GitHub Pages  
**Security:** Helmet, express-rate-limit, express-validator

---

## Environment Variables Reference

See `backend/.env.example` and `frontend/.env.example` for the full list.

---

Built on the design system from [Karmveer Kumar's portfolio](https://github.com/karmveer049).
