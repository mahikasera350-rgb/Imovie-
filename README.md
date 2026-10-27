# 🎬 IMovies — Full-Stack Movie Ticket Booking & Cinema Management System

IMovies is an enterprise-grade, full-stack MERN cinema management and movie ticket booking web application. Engineered with high-performance real-time seat hold synchronization (via Socket.IO), atomic inventory concurrency locks, tiered seat pricing (Regular, Premium, VIP Recliner), a simulated Development Demo payment gateway alongside Razorpay test integration, a dedicated administrator management portal, and end-to-end automated testing.

---

## 🌟 Key Features

### 🍿 Customer Cinema Experience
- **Cinematic Dark Design System**: High-contrast dark palette (`#07090e`, `#111827`) with crimson red accents (`#e50914`), custom movie banners, and curved cinema screen graphics.
- **Dynamic City & Cinema Discovery**: Filter movies and showtimes by city (New York, Los Angeles, Chicago, San Francisco) and specific theatre venues.
- **Advanced Movie Discovery**: Real-time keyword search, status filtering (*Now Showing* vs. *Coming Soon*), genre pills, language filters, and sorting (ratings, release date, title).
- **Interactive Seat Selection & Real-Time Holds**:
  - Live visual seat map categorized into **Regular**, **Premium**, and **VIP Recliner** tiers with distinct pricing.
  - **Atomic Concurrency Protection**: Prevents double-booking. When a customer selects seats, a 5-minute expiring hold is placed in MongoDB.
  - **Socket.IO Live Synchronization**: Broadcasts `seats_held`, `seats_released`, and `seats_booked` to all connected clients in real time.
- **End-to-End Booking & Checkout**:
  - Booking review with transparent price breakdown (subtotal, convenience fee, GST/taxes).
  - Promo code discounts (e.g., `IMOVIE10` for 10% off).
  - Idempotent booking submission.
  - Printable/downloadable digital **Ticket Pass** with unique human-readable booking reference (`IMV-XXXXXX`).
- **User Dashboard & Booking History**:
  - Filter bookings by *Active*, *Past*, and *Cancelled*.
  - Self-service booking cancellation with automated seat inventory release and refund tracking.

### 🛡️ Administration & Cinema Operations
- **Executive Metrics Dashboard**: Real-time aggregation of total registered users, total movies, theatres, upcoming shows, confirmed bookings, and total box office revenue.
- **Movie Catalogue Management**: Full CRUD for movies with poster/banner URLs, trailer embeds, cast, directors, certifications, and featured premiere toggles.
- **Multiplex & Auditorium Management**: Configure theatres, screens, projection formats (IMAX with Laser, Dolby Cinema, 4DX, Standard 2D), and amenities.
- **Showtime Scheduling Engine**: Schedule showtimes with automatic **overlap conflict prevention** on the same screen, and automated seat inventory generation.
- **Booking & Audit Oversight**: Global booking transaction monitoring, status inspection, audit logging, and customer role promotion/demotion.

### 🔒 Enterprise Security & Architecture
- **Stateless & State-Resilient Authentication**: JWT signed tokens stored in secure **HttpOnly cookies** (with fallback Bearer header support).
- **Password Security**: Salted password hashing with `bcryptjs` (cost factor 12); password hashes never leak to API responses.
- **HTTP Hardening**: `helmet` security headers, strict CORS policy with allowlists, rate limiting (`express-rate-limit`) on public and sensitive auth endpoints.
- **Standalone Dev Fallback**: Built-in graceful fallback to `mongodb-memory-server` in development and test environments if an external MongoDB daemon is not detected.

---

## 🛠️ Technology Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, React Router DOM v6, Axios, Bootstrap 5 + Custom Cinematic CSS, Lucide React icons, React Toastify, Socket.IO Client |
| **Backend** | Node.js, Express.js, Mongoose 8, Socket.IO 4, bcryptjs, jsonwebtoken, cookie-parser, helmet, express-rate-limit, dotenv |
| **Database** | MongoDB (Atlas or local instance, with zero-config in-memory fallback for testing) |
| **Payment Integration** | Simulated Development Demo Mode (with controllable success/decline scenarios) + Razorpay test mode |
| **Testing & QA** | Vitest, Supertest, MongoDB Memory Server |

---

## 📂 Project Structure

```text
imovies/
├── client/                     # Frontend Vite + React application
│   ├── public/                 # Static assets & favicons
│   ├── src/
│   │   ├── assets/             # Images and design assets
│   │   ├── components/         # Reusable modular components
│   │   │   ├── booking/        # SeatGrid, BookingSummaryCard, TicketPass
│   │   │   ├── common/         # Navbar, Footer, CityModal, LoadingSkeleton, Route Guards
│   │   │   └── movie/          # MovieCard, HeroBanner, MovieFilter
│   │   ├── context/            # AuthContext, CityContext
│   │   ├── layouts/            # MainLayout, AdminLayout
│   │   ├── pages/              # 30 complete connected pages
│   │   │   ├── admin/          # Admin dashboard & management views
│   │   │   └── ...             # Home, Movies, Details, Seats, Payment, etc.
│   │   ├── routes/             # AppRoutes with protected & admin routing
│   │   ├── services/           # Axios API services & Socket.IO client
│   │   ├── styles/             # Cinematic dark theme & Bootstrap overrides
│   │   ├── utils/              # Currency, date, and time formatters
│   │   ├── App.jsx             # Root application wrapper
│   │   └── main.jsx            # Entry point
│   └── vite.config.js          # Vite config with proxy settings
├── server/                     # Backend Node.js & Express REST API
│   ├── config/                 # Database connection & memory fallback
│   ├── controllers/            # Auth, Movies, Theatres, Shows, Seats, Bookings, Payments, Admin
│   ├── middleware/             # Auth JWT, Admin RBAC, RateLimiters, ErrorHandler
│   ├── models/                 # Mongoose Schemas (User, Movie, Theatre, Show, SeatInventory, Booking, Payment, Notification, AuditLog)
│   ├── routes/                 # Express API routes
│   ├── services/               # Socket.IO broadcasting service
│   ├── tests/                  # Automated integration tests (Vitest + Supertest)
│   ├── utils/                  # Seed script, JWT helpers, AppError class
│   ├── app.js                  # Express app setup & middleware pipeline
│   └── server.js               # HTTP server & Socket.IO initialization
├── .env.example                # Environment variable template
├── .gitignore                  # Git exclusions (node_modules, .env, dist, logs)
├── package.json                # Root workspace commands
└── README.md                   # System documentation
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22 recommended)
- **npm**: v9.0.0 or higher
- *(Optional)* A running local MongoDB instance or MongoDB Atlas connection URI. If omitted, the server automatically starts an internal in-memory instance for testing and demo exploration.

### 1. Clone & Install Dependencies

From the project root:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Copy the example environment file to `server/.env`:

```bash
cp server/.env.example server/.env
```

Default configuration variables in `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=super_secret_jwt_key_imovies_production_safe_2026_change_in_prod
COOKIE_SECRET=super_secret_cookie_key_imovies_secure_2026
CLIENT_URL=http://localhost:5173
PAYMENT_PROVIDER=demo
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

### 3. Database Seeding

Populate the database with demo movies, theatres, screens, upcoming showtimes, seat layouts, and pre-configured test accounts:

```bash
cd server
npm run seed
```

#### Pre-Configured Test Credentials:
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@imovies.com` | `Admin@123456` |
| **Customer** | `user@imovies.com` | `User@123456` |

*(Note: The login page also provides one-click quick-fill buttons for both test accounts).*

---

## 🚀 Running the Application

### Option A: Run Server & Client Concurrently
In the root directory:
```bash
npm run dev
```

### Option B: Run Independently

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Starts at http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Starts at http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

Automated tests cover authentication, password encryption, movie filtering, overlapping show prevention, atomic seat holds, concurrent booking conflict resolution, and cancellation/refund workflows.

Run the test suite:
```bash
cd server
npm test
```

All 15 integration tests run against an isolated in-memory MongoDB database and execute non-destructively.

---

## 💳 Payment Gateway Modes

1. **Development Demo Payment Mode (Default)**:
   - Safe simulated checkout without real financial transactions.
   - Provides an interactive toggle on the checkout page to simulate **Approval** or **Card Decline** to verify error recovery paths.
2. **Razorpay Test Integration**:
   - Set `PAYMENT_PROVIDER=razorpay`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` in `server/.env`.
   - The backend validates HMAC SHA256 signatures server-side and processes webhook callbacks idempotently.

---

## 📡 REST API Reference Summary

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue HttpOnly JWT | Public |
| `POST` | `/api/auth/logout` | Clear authenticated session cookie | Public |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Protected |
| `PATCH` | `/api/auth/profile` | Update profile information | Protected |
| `PATCH` | `/api/auth/change-password` | Change password with current verification | Protected |
| `GET` | `/api/movies` | Filtered & paginated movie listings | Public |
| `GET` | `/api/movies/:id` | Movie details & related recommendations | Public |
| `POST` | `/api/movies` | Create movie | Admin |
| `PUT` | `/api/movies/:id` | Update movie | Admin |
| `DELETE` | `/api/movies/:id` | Delete movie | Admin |
| `GET` | `/api/theatres` | List theatres by city | Public |
| `GET` | `/api/theatres/cities` | List distinct cities with cinemas | Public |
| `GET` | `/api/shows` | Query shows by movie, theatre, city, date | Public |
| `GET` | `/api/shows/:id/seats` | Live seat inventory & pricing | Public |
| `POST` | `/api/shows` | Schedule show (with overlap validation) | Admin |
| `POST` | `/api/bookings/hold-seats` | Place 5-minute atomic hold on seats | Public/User |
| `POST` | `/api/bookings/release-hold` | Release held seats | Public/User |
| `POST` | `/api/bookings` | Create pending booking from held seats | Protected |
| `GET` | `/api/bookings/my` | User's booking history | Protected |
| `GET` | `/api/bookings/:id` | Specific booking details | Protected |
| `POST` | `/api/bookings/:id/cancel` | Cancel booking, release seats & refund | Protected |
| `POST` | `/api/payments/create-order` | Create payment order (Demo/Razorpay) | Protected |
| `POST` | `/api/payments/verify` | Verify payment and confirm seats | Protected |
| `GET` | `/api/admin/dashboard` | Administrative metrics & audit logs | Admin |
| `GET` | `/api/admin/bookings` | Global booking overview with filters | Admin |
| `GET` | `/api/admin/users` | User management & role promotion | Admin |
| `GET` | `/api/notifications` | User notifications & unread count | Protected |
| `GET` | `/api/health` | Service uptime and status check | Public |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
