# Product Overview

Gloopi E-Commerce is a full-stack e-commerce platform built with TypeScript, featuring separate admin and storefront applications.

## Key Features

- **Dual Application Architecture**: Separate admin panel and customer storefront
- **Authentication**: JWT-based auth with httpOnly cookies and middleware verification
- **Database**: PostgreSQL with Prisma ORM
- **File Uploads**: Cloudinary integration for image management
- **Email System**: React Email templates with Nodemailer
- **Content Management**: MDX-powered blog system
- **Payment Integration**: Zarinpal payment gateway
- **SEO Optimized**: Dynamic sitemap generation and Next.js Metadata API

## Applications

- **Admin Panel** (`apps/admin`): Product management, orders, payments dashboard
- **Storefront** (`apps/storefront`): Customer-facing e-commerce site with blog

## Deployment

Both applications should be deployed separately with different root directories:
- Admin: `apps/admin`
- Storefront: `apps/storefront`