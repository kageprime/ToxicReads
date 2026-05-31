# ToxicReads

A fullstack digital book marketplace with a built-in reading interface, admin CMS, mock payment system, and content protections. Built for browsing, purchasing, and reading ebooks in the browser.

## Features

- **Browse & Discover** — Catalog page with search/filter by title, author, condition, and price range
- **Book Detail Page** — Cover, description, metadata, similar books, and purchase flow
- **Reader Interface** — Chunked content loading with configurable font size, light/dark themes, document outline sidebar with chapter navigation, and progress indicator
- **Content Protections** — 5KB chunked serving via signed 5-minute JWT tokens, per-user rate limiting (10 reads/hour/book), watermark overlay with username/date, disabled copy/cut/context-menu, `user-select: none`
- **Mock Payment** — Card form modal with 1.5s simulated processing; cards ending in `0000` are declined
- **Free Books** — Books priced at $0 or $0.00 are directly readable without purchase
- **Auth** — Local username/password registration and login with JWT in httpOnly cookies
- **User Submissions** — Users can submit books for review with cover image and content file upload (docx/pdf/epub)
- **Admin Dashboard** — Pending submissions (bulk approve/reject), all books (inline edit, delete), purchases log
- **Responsive** — Mobile-friendly layout with collapsible sidebar, responsive grids, and adaptive reader controls
- **Theming** — Light/dark toggle with CSS custom properties

## Tech Stack

- React 19 + TypeScript + Vite 7
- React Router 7
- Tailwind CSS
- Lucide React icons
- GSAP for animations
- Three.js (ShaderCanvas on landing page)
- Hono backend injected via Vite dev server
- tRPC v11 for API
- Drizzle ORM + libsql (Turso)
- SQLite (dev) / Turso (production)

## Quick Start

1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env` with your Turso credentials:
   ```
   TURSO_DATABASE_URL=file:./data/bookhaven.db
   TURSO_AUTH_TOKEN=
   APP_SECRET=your-secret-key
   PORT=3000
   ```
4. Seed the database: `npm run db:seed`
5. Start dev server: `npm run dev` (Vite on port 3000 with Hono backend)
6. Build for production: `npm run build`
7. Run production server: `npm run start`

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev (port 3000) with Hono backend |
| `npm run build` | Build frontend + compile backend |
| `npm run start` | Run production server (`dist/boot.js`) |
| `npm run check` | TypeScript typecheck |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run test` | Vitest (api/**/*.test.ts) |
| `npm run db:generate` | Drizzle Kit generate |
| `npm run db:push` | Drizzle Kit push |
| `npm run db:migrate` | Drizzle Kit migrate |
| `npm run db:seed` | Seed admin user + sample books |
| `npm run db:reset` | Drop and recreate all tables |

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Landing | Marketing page with hero, featured books, how it works |
| `/home` | HomePage | Browse books catalog |
| `/book/:id` | BookDetail | Book details + buy |
| `/read/:id` | Reader | Read purchased/free book |
| `/login` | Login | Sign in |
| `/register` | Register | Create account |
| `/submit-book` | SubmitBook | Submit new book |
| `/my-submissions` | MySubmissions | Manage submissions |
| `/my-purchases` | MyPurchases | View purchased books |
| `/admin` | AdminDashboard | Admin panel |
| `/add-book` | AddBook | Admin add book |
| `/profile` | Profile | Account settings |

## Database Schema

### localUsers
- id, username, passwordHash, name, role (`user`|`admin`), createdAt

### books
- id, title, author, description, content, price, coverImage, category, condition, sellerId, sellerType, status (`pending`|`approved`|`rejected`), views, createdAt, updatedAt

### purchases
- id, bookId, buyerId, purchasePrice, createdAt

## API Endpoints (tRPC)

### Auth
- `auth.me`, `auth.login`, `auth.register`, `auth.logout`, `auth.updateCredentials`

### Books
- `book.list`, `book.byId`, `book.pendingList`, `book.adminList`, `book.create`, `book.update`, `book.delete`, `book.approve`, `book.reject`, `book.submit`, `book.updateMySubmission`, `book.deleteMySubmission`, `book.hasPurchased`, `book.read`, `book.readChunk`, `book.incrementView`

### Purchases
- `purchase.buy`, `purchase.myPurchases`, `purchase.adminList`

## Deployment

The project is configured for Vercel:

- `api/app.ts` — Hono app with all route handlers
- `api/index.ts` — Vercel serverless entry
- `api/boot.ts` — Standalone Node server entry
- `vercel.json` — SPA rewrites, output directory config

Set the following environment variables in Vercel dashboard:
- `TURSO_DATABASE_URL` — Turso connection string
- `TURSO_AUTH_TOKEN` — Turso auth token
- `APP_SECRET` — JWT signing secret

## Content Protections

- **Chunked reading** — Content split into 5000-char fragments, served one at a time
- **Signed tokens** — 5-minute JWT bound to userId + bookId, refreshed on expiry
- **Rate limiting** — 10 reads per hour per book per user (in-memory sliding window)
- **Watermark** — Username + date at 5% opacity, rotated -20deg, `pointer-events: none`
- **Browser protections** — `user-select: none`, disabled copy/cut/context-menu, memory cleared on unmount

## Image Import

Run `npx tsx scripts/import-books.ts` to import `.docx` files from `/books` folder.

## Admin Access

Default admin credentials: **admin / 123456**
