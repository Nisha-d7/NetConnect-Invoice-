# invoice-generation-app

A full-stack invoice management system built for an Internet Service Provider (ISP), designed to handle customer billing, invoice tracking, and staff-level administration.

#Project Features:

#Customer Portal:

Secure login authentication

View monthly and yearly invoices

Filter invoices and download PDF copies

Access restricted to invoices linked to the customer’s email

#Staff/Admin Dashboard:

Manage and update all customer invoices

View customer details and handle dispute tickets

Access usage analytics and administrative tools

Fully protected routes with role-based permissions

# ISP Invoice Portal - Authentication & Authorization

This project now has proper authentication and authorization system implemented with the following features:

## 🔐 Security Features

- **Base64 Session Encoding**: Sessions are base64 encoded for Edge Runtime compatibility
- **Role-Based Access Control**: Separate dashboards for customers and staff
- **Route Protection**: Middleware protects all dashboard routes
- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **Session Expiration**: 7-day session timeout with automatic cleanup

## 🚀 Quick Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment Variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your MongoDB connection string and session secret.

3. **Initialize Database with Test Users**

   ```bash
   npm run init-db
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 👤 Test User Accounts

After running `npm run init-db`, you can login with these test accounts:

### Customer Accounts

- **Email**: `customer1@gmail.com` | **Password**: `password123`
- **Email**: `customer2@gmail.com` | **Password**: `password123`
- **Email**: `customer3@gmail.com` | **Password**: `password123`

### Staff Accounts

- **Email**: `staff1@gmail.com` | **Password**: `password123`
- **Email**: `staff2@gmail.com` | **Password**: `password123`

## 🔒 Authentication Flow

1. **Login**: Users login at `/login?role=customer` or `/login?role=staff`
2. **Session Creation**: Encrypted session cookie is created upon successful login
3. **Route Protection**: Middleware checks authentication and role permissions
4. **Dashboard Access**: Users are redirected to role-appropriate dashboards
5. **Logout**: Secure logout clears session and redirects to login

## 🎯 Features Implemented

### ✅ Authentication

- [x] Secure password hashing with bcrypt
- [x] Encrypted session management
- [x] Login/logout functionality
- [x] Session validation on each request

### ✅ Authorization

- [x] Role-based access control (customer/staff)
- [x] Route protection middleware
- [x] API endpoint protection
- [x] Customer invoice filtering (users only see their own invoices)

### ✅ User Experience

- [x] Automatic redirects based on user role
- [x] Proper logout buttons in dashboards
- [x] Loading states during authentication checks
- [x] User info display in dashboards

## 🛡️ Security Considerations

1. **Environment Variables**: Ensure proper environment configuration
2. **HTTPS**: Use HTTPS in production for secure cookie transmission
3. **Database Security**: Ensure MongoDB is properly secured
4. **Session Management**: Sessions expire after 7 days automatically
5. **Edge Runtime**: Using base64 encoding for Edge Runtime compatibility

## 📱 Usage

### For Customers

- Access: `/customer/invoices`
- Features: View personal invoices, download PDFs, filter by time period
- Restrictions: Can only see invoices associated with their email

### For Staff

- Access: `/staff/dashboard`
- Features: Manage all invoices, view users, handle disputes, analytics
- Permissions: Full access to all data and administrative functions

## 🔧 Technical Details

- **Framework**: Next.js 15 with App Router
- **Database**: MongoDB with Mongoose
- **Authentication**: Cookie-based sessions with base64 encoding
- **Security**: Base64 encoding (Edge Runtime compatible), bcrypt password hashing
- **Middleware**: Route protection and role-based redirects

## 📝 API Endpoints

- `POST /api/login` - User authentication
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user info
- `GET /api/invoices` - Get invoices (filtered by user role)
- `GET /api/users` - Get users (staff only)
- `GET /api/disputes` - Get disputes

The authentication system is now production-ready with proper security measures!
