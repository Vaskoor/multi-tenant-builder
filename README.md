<div align="center">

# 🏢 Multi-Tenant Website Builder

### Build. Launch. Scale.

**A production-ready multi-tenant SaaS website builder with built-in E-commerce, POS, Accounting, CMS, Static Site Generation, and White-Label capabilities—designed specifically for businesses in Nepal and emerging markets.**

<p>
<img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
<img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" />
<img src="https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma" />
<img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql" />
<img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css" />
<img src="https://img.shields.io/badge/License-MIT-green.svg" />
</p>

*A modern website builder similar to Shopify + Wix + WordPress + POS + Accounting, built using Next.js.*

</div>

---

# 📖 Table of Contents

- Overview
- Features
- Screenshots
- System Architecture
- Core Modules
- Technology Stack
- Project Structure
- Database Design
- Multi-Tenant Architecture
- Theme Engine
- Static Site Generation
- Authentication & Authorization
- Installation
- Environment Variables
- Database Setup
- Seed Data
- Running the Project
- Subdomain Routing
- Custom Domains
- API Structure
- Folder Structure
- Feature Flags
- Deployment
- Performance
- Security
- Roadmap
- Contributing
- License

---

# 📖 Overview

**Multi-Tenant Website Builder** is a full-featured SaaS platform that enables businesses to create professional websites without writing code.

Unlike traditional website builders, this platform also provides:

- 🛒 E-commerce
- 💳 POS
- 📦 Inventory
- 📊 Accounting
- 📄 Invoice Management
- 🌐 Multi-Tenant Hosting
- ⚡ Static Site Generation
- 🎨 Multiple Themes
- 🔌 White-label support

Each customer receives an isolated workspace with their own:

- Website
- Products
- Customers
- Orders
- Pages
- Domain
- Theme
- Dashboard

Example:

```
abc.localhost:3000
```

or

```
https://myshop.com
```

---

# ✨ Features

## 🌍 Website Builder

- Multiple professional themes
- Live Preview
- Theme Switcher
- Responsive layouts
- Drag & Drop Sections
- SEO optimized pages
- Unlimited Pages
- Landing Pages
- Contact Forms
- Blog Pages
- Hero Sections
- Pricing Tables
- Testimonials
- FAQ
- Call To Action
- Gallery
- Footer Builder

---

## 🎨 Theme Engine

Supports unlimited themes.

Example:

```
Classic
Modern
Business
Restaurant
Fashion
Electronics
Agency
Corporate
Medical
Portfolio
```

Adding a new theme requires only registering a React component.

```tsx
THEME_REGISTRY = {
   modern: ModernTheme,
   business: BusinessTheme,
   restaurant: RestaurantTheme
}
```

Each tenant stores theme configuration inside JSONB.

Example:

```json
{
   "primaryColor":"#2563eb",
   "secondaryColor":"#0f172a",
   "font":"Inter",
   "heroImage":"..."
}
```

No schema migrations required.

---

# 🛒 E-Commerce

Includes everything required for online selling.

### Products

- Categories
- Variants
- Images
- Pricing
- Discounts
- SKU
- Inventory
- Low stock alerts

### Orders

- Order Management
- Status Tracking
- Shipping
- Payment Status

### Customers

- Customer Database
- Order History
- Contact Information

### Payments

- Cash
- Bank
- eSewa
- Khalti
- FonePay
- COD

---

# 💳 POS System

Offline-friendly Point of Sale.

Features

- Barcode support
- Quick Search
- Customer Lookup
- Discount Support
- Tax Support
- Receipt Printing
- Daily Sales
- Cash Register

---

# 📊 Accounting

Complete bookkeeping module.

Includes:

- Ledger
- Revenue
- Expenses
- Profit
- Cash Flow
- Invoice Management
- Payment Recording
- Financial Reports

---

# 📈 Analytics

Track business growth.

Dashboard includes:

- Visitors
- Orders
- Revenue
- Popular Products
- Contact Forms
- Conversion Rate
- Sales Graphs

---

# 👥 Multi-Tenant Architecture

Every customer has isolated resources.

```
Platform
│
├── Tenant A
│   ├── Website
│   ├── Orders
│   ├── Products
│   └── Theme
│
├── Tenant B
│   ├── Website
│   ├── Products
│   └── Orders
│
└── Tenant C
```

Benefits

- Data isolation
- Better scalability
- White-label support
- Easy maintenance

---

# ⚡ Static Site Generation

Every tenant website can be exported as static HTML.

Advantages

- Extremely fast
- CDN Friendly
- Better SEO
- Low hosting cost
- Higher Lighthouse scores

Pipeline

```
Database

↓

Page Builder

↓

React Components

↓

Static HTML

↓

Assets

↓

CDN

↓

Visitors
```

---

# 🌐 Custom Domains

Supported:

```
example.com

shop.example.com

business.com

store.com.np
```

Each tenant may connect unlimited custom domains.

---

# 🛠 Technology Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS

---

## Backend

- Next.js API Routes
- Prisma ORM

---

## Database

- PostgreSQL

---

## Authentication

- NextAuth.js

Supports

- Credentials Login
- Session Management
- Role Based Access

---

## Email

Resend API

Used for

- Contact Forms
- Notifications
- Password Reset
- Order Confirmation

---

## Storage

Public Assets

Future support

- AWS S3
- Cloudflare R2
- Supabase Storage

---

# 🏗 System Architecture

```
                   Users
                     │
                     ▼
            Next.js Frontend
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
 Authentication   Dashboard     Tenant Site
        │            │             │
        └──────┬─────┴─────────────┘
               ▼
          API Routes
               │
               ▼
            Prisma ORM
               │
               ▼
          PostgreSQL
               │
      ┌────────┴────────┐
      ▼                 ▼
 Theme Config       Business Data
```

---

# 📂 Project Structure

```
.
├── app
│   ├── (auth)
│   ├── api
│   ├── dashboard
│   ├── [tenant]
│   ├── layout.tsx
│   └── page.tsx
│
├── components
│
├── lib
│   ├── auth
│   ├── themes
│   ├── utils
│   └── services
│
├── prisma
│   ├── schema.prisma
│   └── seed.ts
│
├── public
│
├── styles
│
├── middleware.ts
│
├── package.json
│
└── README.md
```

---

# 🗄 Database Models

Core entities include:

```
Tenant
User
Page
Product
Category
Order
OrderItem
Invoice
Payment
Ledger
Customer
Contact
PageView
FeatureFlag
```

Relationships

```
Tenant
 │
 ├── Users
 ├── Pages
 ├── Products
 ├── Orders
 ├── Customers
 ├── Ledger
 ├── Payments
 └── Analytics
```

---

# 🔐 Authentication

Uses NextAuth.

Supports

- Login
- Register
- Sessions
- Protected Routes
- Admin Dashboard
- Roles

Roles

```
Admin

Manager

Employee

Customer
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/yourusername/multi-tenant-builder.git

cd multi-tenant-builder
```

---

## Install Packages

```bash
npm install --legacy-peer-deps
```

---

## Environment Variables

Create

```
.env
```

Example

```env
DATABASE_URL="postgresql://username:password@localhost:5432/multitenant"

NEXTAUTH_SECRET="your-secret"

NEXTAUTH_URL="http://localhost:3000"

RESEND_API_KEY="re_xxxxx"

FROM_EMAIL="noreply@yourdomain.com"
```

---

## Database

Push schema

```bash
npx prisma db push
```

Generate Prisma Client

```bash
npx prisma generate
```

---

## Seed Database

```bash
npm run seed
```

Demo credentials

```
Email

demo@example.com

Password

password123
```

---

## Run Development Server

```bash
npm run dev
```

Visit

```
http://localhost:3000
```

Dashboard

```
http://localhost:3000/dashboard
```

---

# 🌐 Subdomain Routing

Development

```
tenant.localhost:3000
```

Alternative

```
tenant.127.0.0.1.nip.io:3000
```

Production

```
shop.company.com

company.com
```

---

# 🎨 Adding a Theme

Step 1

Create component

```
lib/themes/NewTheme.tsx
```

Step 2

Register

```tsx
THEME_REGISTRY.newTheme = NewTheme
```

Step 3

Done.

The dashboard will automatically display it.

---

# 🚀 Deployment

## Vercel

1. Push GitHub Repository

2. Import Project

3. Configure Environment Variables

4. Deploy

---

Other supported hosting

- Railway
- Render
- DigitalOcean
- VPS
- Docker
- Coolify

---

# 🔒 Security

Implemented

- Password Hashing
- Authentication Middleware
- Session Validation
- Role Permissions
- SQL Injection Protection
- Prisma ORM
- CSRF Protection
- Environment Variable Isolation

Future

- Two Factor Authentication
- Audit Logs
- API Rate Limiting
- Activity History

---

# ⚡ Performance

Optimizations

- Server Components
- Route Handlers
- Static Site Generation
- ISR
- Lazy Loading
- Dynamic Imports
- Image Optimization
- CDN Assets

---

# 📅 Roadmap

### Website Builder

- [x] Multi Tenant
- [x] Theme Engine
- [x] CMS
- [x] Static Sites
- [x] Page Builder

### Commerce

- [x] Products
- [x] Orders
- [x] POS
- [x] Accounting

### Upcoming

- [ ] AI Website Generator
- [ ] AI Content Generator
- [ ] AI Theme Generator
- [ ] Drag Drop Builder
- [ ] Plugin Marketplace
- [ ] Mobile App
- [ ] Email Marketing
- [ ] CRM
- [ ] Multi Language
- [ ] Multi Currency
- [ ] Webhooks
- [ ] API SDK

---

# 🤝 Contributing

Contributions are welcome!

```bash
Fork

↓

Create Branch

↓

Commit

↓

Push

↓

Pull Request
```

Example

```bash
git checkout -b feature/new-feature

git commit -m "Add new feature"

git push origin feature/new-feature
```

---

# 📜 License

This project is licensed under the **MIT License**.

See the **LICENSE** file for details.

---

# 🙏 Acknowledgements

This project is built using amazing open-source technologies.

- Next.js
- React
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- NextAuth.js
- Resend
- Vercel

---

# ❤️ Vision

The goal of this project is to become the **all-in-one business operating system** for SMEs and entrepreneurs by combining:

- Website Builder
- Online Store
- POS
- Inventory
- Accounting
- CRM
- Analytics
- Marketing
- AI

into a single platform that is easy to use, scalable, and affordable.

---

<div align="center">

### ⭐ If you like this project, consider giving it a star!

Made with ❤️ for entrepreneurs, startups, and businesses across Nepal and beyond.

</div>