# Project Structure

## Monorepo Organization

```
├── apps/                    # Applications
│   ├── admin/              # Admin dashboard (port 8888)
│   └── storefront/         # Customer storefront (port 7777)
├── packages/               # Shared utilities
│   ├── mail/              # Email service (@persepolis/mail)
│   ├── oauth/             # OAuth helpers (@persepolis/oauth)
│   ├── regex/             # Regex patterns (@persepolis/regex)
│   ├── rng/               # Random number generation (@persepolis/rng)
│   ├── slugify/           # URL slug generation (@persepolis/slugify)
│   ├── sms/               # SMS service (@persepolis/sms)
│   └── zarinpal/          # Payment gateway (@persepolis/zarinpal)
└── scripts/               # Build and utility scripts
```

## Application Structure

Both apps follow Next.js 14 App Router conventions:

```
apps/{admin|storefront}/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (dashboard)/   # Route groups (admin)
│   │   ├── (store)/       # Route groups (storefront)
│   │   ├── api/           # API routes
│   │   ├── login/         # Auth pages
│   │   ├── globals.css    # Global styles
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── native/        # Custom components (storefront)
│   │   └── modals/        # Modal components
│   ├── lib/               # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── providers/         # Context providers
│   ├── actions/           # Server actions (admin)
│   ├── state/             # State management (storefront)
│   ├── emails/            # Email templates
│   ├── config/            # Configuration files
│   ├── types/             # TypeScript type definitions
│   └── middleware.ts      # Next.js middleware
├── prisma/                # Database schema and seeds
├── public/                # Static assets
└── package.json           # App dependencies
```

## Key Conventions

- **Route Groups**: Use parentheses for layout grouping without affecting URL structure
- **API Routes**: RESTful structure under `app/api/`
- **Components**: 
  - `ui/` for shadcn/ui components
  - `native/` for custom components (storefront)
  - `modals/` for modal dialogs
- **Database**: Each app has its own Prisma schema but can share the same database
- **Authentication**: Handled via middleware.ts with JWT verification
- **Styling**: Tailwind classes with component-level CSS modules when needed

## Shared Packages

All packages follow the same structure:
```
packages/{name}/
├── src/
│   └── index.ts           # Main export
├── dist/                  # Compiled output
├── package.json           # Package config
└── tsconfig.json          # TypeScript config
```

## Environment Configuration

- `.env.example` files in each app for required environment variables
- Database connection via `DATABASE_URL` and `DIRECT_URL`
- Separate deployment configurations for admin and storefront