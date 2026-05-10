# ChefCost — Event Cost Calculator

A full-stack web application for chefs and catering companies to manage ingredients, recipes, menus, and events — with real-time cost calculations and PDF quote export.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router |
| Backend | Node.js + Express (ESM) |
| Database | SQLite via better-sqlite3 |
| Auth | JWT (7-day tokens) + bcrypt |
| PDF | jsPDF (client-side) |

---

## Getting started

### Prerequisites
- Node.js 18+ (https://nodejs.org)

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Seed the database (creates demo account + sample data)

```bash
cd backend
node src/db/seed.js
```

This creates:
- **Email:** `demo@chefcost.app`
- **Password:** `demo1234`
- 10 sample ingredients, 3 recipes, 2 menus, 2 events

### 3. Start development servers

**Terminal 1 — Backend (port 4000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173

---

## Project structure

```
chefcost/
├── backend/
│   ├── data/                  # SQLite database file (auto-created)
│   └── src/
│       ├── db/
│       │   ├── index.js       # DB connection singleton
│       │   ├── migrate.js     # Schema creation (runs on startup)
│       │   └── seed.js        # Demo data
│       ├── middleware/
│       │   └── auth.js        # JWT middleware + signToken
│       ├── routes/
│       │   ├── auth.js        # POST /api/auth/login, /register
│       │   ├── ingredients.js # CRUD /api/ingredients
│       │   ├── recipes.js     # CRUD /api/recipes
│       │   ├── menus.js       # CRUD /api/menus
│       │   └── events.js      # CRUD /api/events
│       └── index.js           # Express server entry
└── frontend/
    └── src/
        ├── components/
        │   ├── Layout.jsx     # Sidebar + nav
        │   └── Modal.jsx      # Reusable modal
        ├── hooks/
        │   └── useApp.jsx     # Global state context
        ├── lib/
        │   ├── api.js         # API client (fetch wrapper)
        │   ├── calc.js        # Cost calculation helpers
        │   └── pdf.js         # jsPDF quote generator
        └── pages/
            ├── AuthPage.jsx
            ├── Dashboard.jsx
            ├── Ingredients.jsx
            ├── Recipes.jsx
            ├── Menus.jsx
            └── Events.jsx
```

---

## API endpoints

### Auth
| Method | Path | Body |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |

All other endpoints require `Authorization: Bearer <token>` header.

### Ingredients
| Method | Path |
|---|---|
| GET | `/api/ingredients` |
| POST | `/api/ingredients` |
| PUT | `/api/ingredients/:id` |
| DELETE | `/api/ingredients/:id` |

### Recipes
| Method | Path |
|---|---|
| GET | `/api/recipes` |
| POST | `/api/recipes` |
| PUT | `/api/recipes/:id` |
| DELETE | `/api/recipes/:id` |

### Menus
| Method | Path |
|---|---|
| GET | `/api/menus` |
| POST | `/api/menus` |
| PUT | `/api/menus/:id` |
| DELETE | `/api/menus/:id` |

### Events
| Method | Path |
|---|---|
| GET | `/api/events` |
| POST | `/api/events` |
| PUT | `/api/events/:id` |
| DELETE | `/api/events/:id` |

---

## Environment variables

Create `backend/.env` for production:

```env
PORT=4000
JWT_SECRET=your-long-random-secret-here
DB_PATH=/data/chefcost.db
FRONTEND_URL=https://yourapp.com
```

---

## Deploying to production

### Option A — Railway (easiest, free tier available)

1. Push this repo to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Add two services: one for `backend/`, one for `frontend/`
4. Set environment variables in Railway dashboard
5. Backend: set `PORT`, `JWT_SECRET`, `FRONTEND_URL`
6. Frontend: set `VITE_API_URL` if not using proxy

### Option B — VPS / DigitalOcean

```bash
# On your server
git clone <your-repo> /app/chefcost
cd /app/chefcost

# Install and seed
cd backend && npm install && node src/db/seed.js

# Build frontend
cd ../frontend && npm install && npm run build
# Serve dist/ with nginx or caddy

# Run backend with PM2
npm install -g pm2
cd ../backend && pm2 start src/index.js --name chefcost-api
```

### Option C — Docker (Dockerfile included below)

Create `backend/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p data
EXPOSE 4000
CMD ["node", "src/index.js"]
```

---

## Features

- **Authentication** — JWT login/register with bcrypt password hashing
- **Ingredients** — manage products with automatic unit price calculation
- **Recipes** — build recipes from ingredients, real-time cost-per-portion
- **Menus** — compose recipes into menus with markup & VAT pricing
- **Events** — attach menus to client events with shopping list generation
- **PDF export** — professional quote PDF with shopping list, auto-generated quote number
- **Dashboard** — pipeline value, recipe cost ranking, upcoming events

---

## Cost calculation formulas

```
Price per unit  = purchase_price / purchase_qty
Ingredient cost = unit_price × qty_used
Recipe cost     = Σ ingredient_costs
Cost/portion    = recipe_cost / portions
Menu food cost  = Σ (cost/portion × portions_for_menu)
Selling price   = food_cost × (1 + markup%)
VAT amount      = selling_price × vat%
Final price     = selling_price + VAT
Cost per guest  = food_cost / guest_count
```
