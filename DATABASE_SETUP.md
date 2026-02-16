# Database Setup Guide

This project uses **Supabase** (PostgreSQL) with **Prisma** ORM for database management and collaboration features.

## Quick Start

### 1. Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Get Your Database Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy your **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
3. Copy your **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Go to **Settings** → **Database**
5. Copy your **Connection string** (DATABASE_URL) - select "URI" format

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/[database]
```

### 4. Initialize the Database

Run the Prisma migration to create all tables:

```bash
# Generate Prisma Client
npx prisma generate

# Push the schema to your database
npx prisma db push
```

### 5. View Your Database (Optional)

Open Prisma Studio to view and manage your data:

```bash
npx prisma studio
```

## Database Schema

The database includes the following tables:

### Core Tables
- **users** - User accounts (synced with Clerk)
- **projects** - CAD design projects
- **project_members** - Team members and their roles
- **conversation_messages** - Chat history for each project

### Collaboration Tables
- **project_invites** - Pending invitations to projects
- **project_versions** - Version history of designs
- **project_comments** - Comments on specific designs
- **project_activities** - Activity feed/audit log

## Features

### ✅ Project Management
- Create unlimited projects (free tier: 500MB storage)
- Auto-save conversations and designs
- Version history tracking

### ✅ Team Collaboration
- Invite members via email
- Role-based access (Owner, Editor, Viewer)
- Real-time presence (who's viewing)
- Activity feed

### ✅ Real-time Features
- Live cursor tracking
- Real-time updates via Supabase Realtime
- WebSocket connections for collaboration

## Free Tier Limits

Supabase free tier includes:
- **Database**: 500MB storage
- **Bandwidth**: 2GB per month
- **Realtime**: 200 concurrent connections
- **API Requests**: Unlimited

**Estimate**: Supports ~10,000 projects and 100 concurrent users

## Troubleshooting

### Error: "Missing Supabase environment variables"

Make sure you've added all three environment variables to `.env.local`:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- DATABASE_URL

### Error: "Schema not found"

Run the database migration:
```bash
npx prisma db push
```

### Can't connect to database

1. Check your DATABASE_URL format
2. Verify your Supabase project is active
3. Check if your IP is allowed (Supabase allows all by default)

## Development

### Reset Database
```bash
npx prisma db push --force-reset
```

### View Database Schema
```bash
npx prisma studio
```

### Generate Prisma Client (after schema changes)
```bash
npx prisma generate
```

## Production Deployment

When deploying to Vercel:

1. Add environment variables in Vercel dashboard
2. Database migrations run automatically via Prisma
3. Connection pooling is handled by Supabase

## Next Steps

- [ ] Set up email notifications for invites
- [ ] Add file upload for thumbnails
- [ ] Implement commenting system
- [ ] Add real-time cursor tracking
- [ ] Set up webhook for Clerk user sync
