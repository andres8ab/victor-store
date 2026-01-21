# Victor Store Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Next Auth (if you want to add authentication later)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Database Setup

1. **Set up Neon PostgreSQL:**
   - Go to [neon.tech](https://neon.tech) and create an account
   - Create a new project
   - Copy the connection string to your `.env.local` file

2. **Run database migrations:**

   ```bash
   npm run db:generate
   npm run db:push
   ```

3. **Seed the database:**
   ```bash
   npm run db:seed
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data

## Features

- ✅ Next.js 15 with TypeScript
- ✅ Tailwind CSS for styling
- ✅ ESLint for code quality
- ✅ Drizzle ORM with Neon PostgreSQL
- ✅ Zustand for state management
- ✅ Product catalog with Victor items
- ✅ Shopping cart functionality
- ✅ Responsive design
- ✅ Image optimization with Next.js Image

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   └── products/   # Products API
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # React components
│   ├── ProductCard.tsx # Product display component
│   └── Cart.tsx       # Shopping cart component
├── db/                 # Database related files
│   ├── index.ts        # Database connection
│   ├── schema.ts       # Database schema
│   └── seed.ts         # Sample data
└── store/              # State management
    └── useStore.ts     # Zustand store
```
