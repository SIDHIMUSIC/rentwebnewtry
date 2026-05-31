# 🏠 RentWeb - Complete Setup Guide

## What's Fixed & Added
- ✅ Admin Login system (JWT-based, secure cookie)
- ✅ Protected routes (middleware auth guard)
- ✅ Add / Edit / Delete tenants (full CRUD)
- ✅ Razorpay payment integration (create order + verify signature)
- ✅ Payment history per tenant
- ✅ MongoDB fixed connection (no duplicate connection bug)
- ✅ Removed broken Supabase dependency
- ✅ All API routes fixed with proper auth checks
- ✅ bcryptjs added for password security
- ✅ Missing `bcrypt` and `cookies-next` added to package.json

---

## 🚀 Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up .env.local
Edit the `.env.local` file with your real values:

```env
# MongoDB - get free cluster at mongodb.com/atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rentweb

# JWT secret - keep this secret!
JWT_SECRET=MyRentApp@2026#SecureKey!

# Admin login credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@2026

# Razorpay - get from razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```

### 3. Get Razorpay Keys 🗝️
1. Go to https://razorpay.com and create account
2. Dashboard → Settings → API Keys
3. Click "Generate Test Key"
4. Copy **Key ID** and **Key Secret**
5. Paste into `.env.local`

### 4. Run the App
```bash
npm run dev
```
Open http://localhost:3000

### 5. Login
- Username: `admin`
- Password: `Admin@2026`
(Change in .env.local → ADMIN_USERNAME and ADMIN_PASSWORD)

---

## 📁 Project Structure
```
rentweb/
├── app/
│   ├── api/
│   │   ├── auth/login/route.js     ← Admin login API
│   │   ├── auth/logout/route.js    ← Logout API
│   │   ├── tenants/route.js        ← List + Add tenants
│   │   ├── tenants/[id]/route.js   ← Edit + Delete tenant
│   │   ├── payments/create-order/  ← Razorpay order creation
│   │   └── payments/verify/        ← Razorpay signature verify
│   ├── login/page.js               ← Login page
│   ├── dashboard/page.js           ← Main dashboard
│   ├── tenants/page.js             ← Tenant list + detail + payment
│   └── add-tenant/page.js          ← Add new tenant form
├── components/
│   └── Navbar.js                   ← Top nav bar
├── lib/
│   ├── db.js                       ← MongoDB connection (fixed)
│   └── auth.js                     ← JWT helpers
├── models/
│   └── Tenant.js                   ← Tenant + Payment schema
├── middleware.js                   ← Route protection
└── .env.local                      ← Your secret keys
```

## ⚠️ For Production (Vercel)
- Add all .env.local variables in Vercel Dashboard → Settings → Environment Variables
- Change RAZORPAY_KEY_ID from `rzp_test_` to `rzp_live_` prefix
- Set ADMIN_PASSWORD to something strong

## 🧪 Testing Razorpay Payment
Use test card: **4111 1111 1111 1111**
CVV: any 3 digits | Expiry: any future date
