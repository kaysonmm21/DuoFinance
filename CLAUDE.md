# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Architecture

DuoFinance is a personal budgeting app built with Next.js 16 (App Router) and Supabase.

### Tech Stack
- **Framework**: Next.js 16 with App Router, React 19, TypeScript
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS 4, shadcn/ui components (Radix primitives)
- **Forms**: react-hook-form + Zod validation
- **Charts**: Recharts

### Route Groups
- `(auth)` - Public auth pages: login, signup, forgot-password, reset-password
- `(app)` - Protected app pages: dashboard, transactions, categories, budgets, analytics, settings

### Key Patterns

**Server Actions** (`src/actions/`): All database operations use Next.js Server Actions with Supabase client. Each action validates auth, performs the operation, and calls `revalidatePath()` for affected routes.

**Supabase Clients**:
- `src/lib/supabase/server.ts` - Server-side client using cookies
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/middleware.ts` - Session refresh middleware

**Type System** (`src/types/database.ts`): Supabase database schema types with helper types for rows, inserts, updates, and relations (e.g., `TransactionWithCategory`, `BudgetWithCategory`).

**Validation** (`src/lib/validations/`): Zod schemas for all forms with exported TypeScript types.

### Data Model
- **profiles**: User settings (currency, name)
- **categories**: Income/expense categories with icon and color
- **budgets**: Per-category budget limits (monthly/weekly/yearly)
- **transactions**: Income and expense records linked to categories

### Environment Variables
Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
