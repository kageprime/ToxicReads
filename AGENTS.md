# ToxicReads — Agent Notes

## Current Status

### Done
- [x] Project setup with React 19 + Vite + Hono + tRPC
- [x] SQLite database with Drizzle ORM + libsql (Turso)
- [x] Local auth system (register, login, logout) with JWT in httpOnly cookies
- [x] Admin user (admin / 123456) seeded in database
- [x] Landing page at `/` with hero, featured books, how it works, reader preview, categories, stats
- [x] Browse page at `/home` with book catalog
- [x] Book detail page at `/book/:id` with purchase functionality
- [x] Reader page at `/read/:id` with font size and theme controls
- [x] Login/Register pages for auth
- [x] Submit book form for user submissions
- [x] MySubmissions page for user CRUD on submissions
- [x] MyPurchases page showing purchased books
- [x] Admin dashboard with pending approvals, all books, purchases tabs
- [x] Admin can edit books inline in All Books tab
- [x] Admin can bulk approve/reject pending submissions
- [x] Admin can delete books
- [x] Collapsible sidebar (Quick Actions) that slides from right
- [x] Clean headers with brand name and minimal navigation
- [x] Back buttons placed before book images (not in headers)
- [x] Docx import script for books
- [x] Similar books section on book detail page
- [x] Theme toggle (light/dark)
- [x] "ToxicReads" branding throughout

### In Progress
- [ ] User profile/account settings
- [ ] Book cover image upload
- [ ] Search/filter functionality
- [ ] Categories management
- [ ] Book conditions management

### Blocked
- [ ] None

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite 7 dev server with Hono backend injection
- React Router 7 for routing
- tRPC React Query client
- Tailwind CSS + custom CSS variables
- Lucide React icons
- GSAP for animations

### Backend
- Hono server (entry: `api/boot.ts`)
- tRPC v11 for API
- Drizzle ORM with libsql driver (@libsql/client)

### Database
- SQLite (dev) & Turso (prod) via @libsql/client
- Tables: `localUsers`, `books`, `purchases`
- Admin credentials: admin / 123456
- Database file: `data/bookhaven.db` (local)

## Dev Commands

```bash
npm run dev        # Start Vite (port 3000) with Hono backend
npm run build      # Build frontend + compile backend
npm run start      # Run production server (dist/boot.js)
npm run check      # TypeScript typecheck
npm run lint       # ESLint
npm run format     # Prettier write
npm run test       # Vitest (api/**/*.test.ts)
npm run db:generate # Drizzle Kit generate
npm run db:push    # Drizzle Kit push (requires DATABASE_URL)
npm run db:migrate # Drizzle Kit migrate
npm run db:seed    # Seed database (admin user + sample books)
npm run db:reset   # Drop and recreate all tables
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Landing | Marketing page with hero, featured books, how it works |
| `/home` | HomePage | Browse books catalog |
| `/book/:id` | BookDetail | Book details + buy |
| `/read/:id` | Reader | Read purchased book |
| `/login` | Login | Sign in |
| `/register` | Register | Create account |
| `/submit-book` | SubmitBook | Submit new book |
| `/my-submissions` | MySubmissions | Manage submissions |
| `/my-purchases` | MyPurchases | View purchased books |
| `/admin` | AdminDashboard | Admin panel |
| `/add-book` | AddBook | Admin add book |

## Database Schema

### localUsers
- id (integer, primary key)
- username (text, unique)
- passwordHash (text)
- name (text, optional)
- role (text: 'user' | 'admin')
- createdAt (integer timestamp)

### books
- id (integer, primary key)
- title (text)
- author (text)
- description (text)
- content (text, optional - reading material)
- price (text)
- coverImage (text)
- category (text)
- condition (text)
- sellerId (integer, foreign key to localUsers)
- sellerType (text: 'user' | 'admin')
- status (text: 'pending' | 'approved' | 'rejected')
- createdAt, updatedAt (integer timestamps)

### purchases
- id (integer, primary key)
- bookId (integer, foreign key)
- buyerId (integer, foreign key)
- purchasePrice (text)
- createdAt (integer timestamp)

## API Endpoints (tRPC)

### Auth
- `auth.me` - Get current user
- `auth.login` - Sign in
- `auth.register` - Create account
- `auth.logout` - Sign out
- `auth.updateCredentials` - Change username/password

### Books
- `book.list` - List approved books
- `book.byId` - Get book by ID
- `book.pendingList` - List pending books (admin)
- `book.adminList` - List all books (admin)
- `book.create` - Create book (admin)
- `book.update` - Update book (admin)
- `book.delete` - Delete book (admin)
- `book.approve` - Approve pending book (admin)
- `book.reject` - Reject pending book (admin)
- `book.submit` - Submit book for review (user)
- `book.updateMySubmission` - Edit own submission (user)
- `book.deleteMySubmission` - Delete own submission (user)
- `book.hasPurchased` - Check if user bought book
- `book.read` - Get book content (requires purchase)

### Purchases
- `purchase.buy` - Purchase a book
- `purchase.myPurchases` - List user's purchases
- `purchase.adminList` - List all purchases (admin)

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — Turso connection string (`file:./data/bookhaven.db` for local, `libsql://...` for production)
- `DATABASE_AUTH_TOKEN` — Turso auth token (empty for local file)
- `APP_SECRET` — JWT signing secret
- `PORT` — server port (default 3000)

Vite exposes `VITE_*` prefixed vars to browser.

## Known Issues / TODO

1. **Book cover upload** - Currently using URL input; need file upload
2. **User profile** - No settings/account page
3. **Search/filter** - Basic browsing, no search
4. **Categories** - Hardcoded list, no management
5. **Book conditions** - Hardcoded list, no management

## Book Import

Run `npx tsx scripts/import-books.ts` to import docx files from `/books` folder into the database.

## Admin Features

### Pending Submissions Tab
- View all pending book submissions
- Select individual books or select all
- Bulk approve/reject with one click
- Click book cover or title to preview

### All Books Tab
- View all books regardless of status
- Inline edit any book (title, author, price, category, condition, cover, description)
- Delete books with confirmation
- Visual status badges (pending/approved/rejected)

### Purchases Tab
- View all purchase transactions
- See buyer username, book details, price, date
- Click book cover or title to preview

## Landing Page Sections

1. **Hero** - Brand name, tagline, CTA buttons
2. **Featured Books** - Grid of 4 books with cover, title, author, price
3. **How It Works** - 3-step process with icons
4. **Read Anywhere** - Reader preview with font size and theme demo
5. **Categories** - Browse by category buttons
6. **CTA** - Call to action for account creation or browsing
7. **Stats** - Book count, digital access, reading time
8. **Footer** - Navigation links and branding