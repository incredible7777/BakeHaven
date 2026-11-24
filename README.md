<div align="center">

  <img src="frontend/public/image/logo.png" alt="BakeHaven Logo" width="100" />

  # 🍰 BakeHaven — Artisan Bakery & E-Commerce

  **A modern, full-stack MERN e-commerce web platform for handcrafted artisan cakes, cupcakes, and party treats.**

  [![Live Demo](https://img.shields.io/badge/Live_Demo-bake--haven.vercel.app-FF5722?style=for-the-badge&logo=vercel&logoColor=white)](https://bake-haven.vercel.app)
  [![React](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-v22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.1-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
  [![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=0C2340)](https://razorpay.com/)

  <p align="center">
    <a href="https://bake-haven.vercel.app"><b>🚀 Live Website</b></a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-project-architecture">Architecture</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-endpoints">API Reference</a> •
    <a href="#-deployment">Deployment</a>
  </p>

</div>

---

## 📖 Overview

**BakeHaven** is a complete, production-grade e-commerce application crafted specifically for boutique and artisanal bakeries. It provides an intuitive, sensory online ordering experience — from browsing handcrafted sponge cakes and custom party cakes to real-time cart manipulation, custom edible plaque piping inscriptions, scheduled temperature-controlled delivery, secure payments via Razorpay & Cash on Delivery (COD), and automated PDF tax invoices.

---

## ✨ Key Features

### 🛍️ Modern E-Commerce Architecture (Separate Cart & Orders)
- **Dedicated Shopping Bag (`/cart`)**:
  - Independent active cart management with real-time quantity steppers (`-`, `+`, `🗑`).
  - One-click cart emptying and instant subtotal recalculation.
  - Recommended artisan add-ons carousel with quick-add functionality.
  - Live navbar shopping bag badge dynamically reflecting un-checked-out items.
- **Dedicated Order History & Tracking (`/orders`)**:
  - Fully decoupled from the active shopping cart.
  - Filtered order history displaying only confirmed/completed purchases.
  - **Multi-Item Package Showcase**: Displays every cake ordered in a delivery with its own thumbnail image, unit price, quantity, and line price.
  - **Interactive Cake Selector**: Tap any cake in a multi-item package to preview its full photo and specifications.
  - **Automated GST Tax Invoice**: One-click professional vector PDF invoice download generated in-browser via `jspdf` and `jspdf-autotable`.

### 🎂 Cake Catalog, Personalization & Discovery
- **Synchronized Hero Showcase**: Dynamic hero section featuring synchronized transitions between cake imagery, rotating category titles, and tasting descriptions.
- **Category Filtering & Search**: Filter cakes by Birthday Cake, Chocolate Cake, Party Cake, Slice Cake, and Cup Cake with one-click filter pills.
- **Quick View Modal**: Inspect cake descriptions, nutritional quotes, and gallery photos with immediate Wishlist/Cart shortcuts.
- **Custom Plaque Inscriptions**: Add an edible chocolate plaque message (e.g. *"Happy 25th Birthday Maya!"*) with live character counting.

### 📍 Seamless Delivery & Checkout Sheet
- **Realistic, Modern Checkout**: Clean typography and left-aligned contextual icons without noisy placeholder clutter.
- **Scheduled Delivery**: Date picker with past-date prevention and custom time slot selections (Morning, Afternoon, Evening).
- **Dual Payment Methods**:
  - **Online Payment**: Official Razorpay integration supporting UPI, Google Pay, PhonePe, Credit/Debit Cards, and NetBanking with HMAC-SHA256 signature verification.
  - **Cash on Delivery (COD)**: Instant order confirmation with doorstep settlement.

### 💖 Wishlist & User Profile
- **Heart Wishlist (`/wishlist`)**: Save favorite treats with a real-time navbar counter and single-click "Move to Cart & Order".
- **Account Dashboard (`/profile`)**: Member badges, avatar integration, and quick metrics for active Cart items, placed Orders, and saved Wishlist items.
- **JWT Authentication**: Secure stateless session handling via HTTP-only cookies with access & refresh token rotation and password visibility toggles (`bx-show` / `bx-hide`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **State Management**: [Redux Toolkit (RTK) v2](https://redux-toolkit.js.org/) + React-Redux
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using the `@theme` BakeHaven custom palette)
- **Typography & Icons**: Google Fonts (`Uchen` & system `font-sans`), [Boxicons](https://boxicons.com/)
- **Animations**: [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/)
- **Invoice Generation**: [jspdf](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js (ES Modules)](https://nodejs.org/)
- **Server Framework**: [Express.js 4](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with [Mongoose 8](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Payment Gateway**: [Razorpay SDK](https://razorpay.com/docs/)
- **Utilities**: `cookie-parser`, `cors`, `dotenv`

---

## 📁 Project Architecture

```
BakeHaven/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection handler
│   ├── controllers/
│   │   ├── auth.controller.js     # User registration, login, logout, refresh tokens
│   │   ├── contact.controller.js  # Contact form messaging & inquiries
│   │   ├── order.controller.js    # Cart consolidation, item updates, checkout & history
│   │   ├── payment.controller.js  # Razorpay order generation & signature verification
│   │   ├── product.controller.js  # Cake catalog fetching & filtering
│   │   └── wishlist.controller.js # User wishlist toggle & sync
│   ├── data/
│   │   ├── productsSeed.js        # 12 handcrafted signature artisan cakes
│   │   └── seedRunner.js          # Standalone seed utility
│   ├── middlewares/
│   │   └── auth.middleware.js     # JWT verification & protected route barrier
│   ├── models/
│   │   ├── order.model.js         # Order & Cart schemas with snapshot subdocuments
│   │   ├── product.model.js       # Product schema (price, image, category, rating)
│   │   └── user.model.js          # User credentials & embedded wishlist
│   ├── routes/                    # Express modular route definitions
│   ├── utils/
│   │   ├── ApiError.js            # Standardized operational error wrapper
│   │   ├── ApiResponse.js          # Uniform JSON envelope wrapper
│   │   └── AsyncHandler.js        # Express async exception catcher
│   ├── app.js                     # Express app configuration & middlewares
│   ├── server.js                  # Server entry point & auto-database seeder
│   └── .env.example               # Backend environment variable template
│
├── frontend/
│   ├── public/
│   │   └── image/                 # High-resolution cake assets, logos & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx      # Login/Signup modal with password show/hide
│   │   │   ├── Footer.jsx         # Bakery footer with links & brand details
│   │   │   ├── Hero.jsx           # Dynamic synchronized hero with smooth transitions
│   │   │   ├── Navbar.jsx         # Navbar with category dropdown & live item badges
│   │   │   ├── ProductCard.jsx    # Artisan product card with quick-view & cart triggers
│   │   │   ├── ProductSection.jsx # Category filter pills & catalog grid
│   │   │   └── QuickViewModal.jsx # Detail popup modal for cake specs
│   │   ├── pages/
│   │   │   ├── Cart.jsx           # Dedicated shopping cart & realistic checkout sheet
│   │   │   ├── Home.jsx           # Landing page with hero, products, gallery, about
│   │   │   ├── Orders.jsx         # Dedicated order history, package showcase & PDF invoice
│   │   │   ├── Profile.jsx        # User account metrics and shortcuts
│   │   │   └── Wishlist.jsx       # Saved favorites page with quick move-to-cart
│   │   ├── redux/
│   │   │   ├── slices/            # Redux slices (auth, orders, products, wishlist)
│   │   │   └── store.js           # Global Redux Toolkit store
│   │   ├── services/
│   │   │   └── api.js             # Pre-configured Axios instance with credentials
│   │   ├── utils/
│   │   │   └── generateInvoice.js # A4 PDF tax invoice generator
│   │   ├── App.jsx                # Router, global modals, and auth synchronization
│   │   ├── index.css              # Tailwind v4 theme, animations, custom scrollbar
│   │   └── main.jsx               # React 19 bootstrap
│   └── .env.example               # Frontend environment variable template
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended, tested on v22)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB)
- (Optional) Free [Razorpay Test Account](https://dashboard.razorpay.com/) for online payments

---

### 1. Clone the Repository

```bash
git clone https://github.com/incredible7777/BakeHaven.git
cd BakeHaven
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```

4. Populate the `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

   ACCESS_TOKEN_SECRET=your_super_secret_access_token_32_chars_long
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_32_chars_long
   REFRESH_TOKEN_EXPIRY=10d

   # Optional for test payment gateway:
   RAZORPAY_KEY_ID=rzp_test_yourKeyIdHere
   RAZORPAY_KEY_SECRET=yourKeySecretHere
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   > **Note:** BakeHaven automatically seeds the initial 12 artisan cakes on first startup if the database collection is empty!

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your frontend environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. Launch the Vite development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | Public |
| `POST` | `/login` | Authenticate user & issue JWT cookies | Public |
| `POST` | `/logout` | Clear auth cookies | Authenticated |
| `GET` | `/me` | Get current authenticated user details | Authenticated |
| `POST` | `/refresh-token` | Renew access token via refresh token | Public |

### Products (`/api/products`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Fetch all cakes (supports `?category=` filter) | Public |
| `GET` | `/:id` | Fetch single cake by ID | Public |

### Cart & Orders (`/api/orders`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Get all orders for the current user | Authenticated |
| `POST` | `/` | Add item(s) to active cart (pending order) | Authenticated |
| `PUT` | `/:orderId/item` | Update item quantity or remove when zero | Authenticated |
| `PUT` | `/:orderId/checkout` | Finalize checkout (COD or Razorpay) | Authenticated |
| `DELETE` | `/:orderId` | Cancel / clear an order | Authenticated |

### Payments (`/api/payment`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/create-order` | Generate official Razorpay Order ID | Authenticated |
| `POST` | `/verify` | Verify Razorpay HMAC signature & confirm order | Authenticated |

### Wishlist (`/api/wishlist`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Fetch saved wishlist items | Authenticated |
| `POST` | `/` | Add / save cake to wishlist | Authenticated |
| `PUT` | `/quantity` | Update quantity in wishlist | Authenticated |
| `DELETE` | `/:itemName` | Remove cake from wishlist | Authenticated |

---

## 🌐 Production Deployment

### Backend (Render / Railway)
1. Set the **Root Directory** to `backend`.
2. **Build Command**: `npm install`
3. **Start Command**: `node server.js`
4. Add Environment Variables from `.env.example` (set `NODE_ENV=production` and `CLIENT_URL` to your production frontend domain).
5. In MongoDB Atlas, verify that Network Access allows `0.0.0.0/0` (allow access from anywhere).

### Frontend (Vercel / Netlify)
1. Set the **Root Directory** to `frontend`.
2. **Framework Preset**: `Vite`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Configure the Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`

---

## 📄 License

This project is open-source and free to use for personal, educational, and commercial portfolio purposes.

---

<div align="center">
  Crafted with ❤️ by <a href="https://github.com/incredible7777"><b>incredible7777</b></a> (Atulya Pandey)
  <br />
  <i>Baking memories, one handcrafted slice at a time.</i>
</div>
