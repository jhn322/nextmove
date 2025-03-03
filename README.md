# Next Move - Chess Application

A modern chess application built with Next.js, TypeScript, and Supabase.

## Features

- Play chess against AI opponents of varying difficulty levels
- User authentication with NextAuth.js and Supabase
- Game history tracking and statistics
- Customizable user settings
- Sound effects and animations
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI, Shadcn UI
- **Authentication**: NextAuth.js with Supabase adapter
- **Database**: Supabase (PostgreSQL)
- **Chess Logic**: chess.js
- **AI Engine**: Stockfish

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/next-move.git
   cd next-move
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   ```bash
   npm run setup-db
   npm run create-tables
   npm run update-rls-policies
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication System

The application uses NextAuth.js with the Supabase adapter for authentication. Here's how it works:

1. Users sign in through NextAuth.js, which creates a session.
2. The session contains the user's ID and other information.
3. When making requests to Supabase, we use the `getAuthenticatedSupabaseClient` function to create a client with the user's session.
4. The client includes a custom header `x-user-id` with the user's ID.
5. Supabase Row-Level Security (RLS) policies use this header to verify the user's identity and restrict access to data.

### Row-Level Security (RLS) Policies

The application uses Supabase RLS policies to ensure that users can only access their own data. The policies are defined in `src/scripts/fix-rls-policies.sql` and can be applied using:

```bash
npm run update-rls-policies
```

The RLS policies use a custom function `get_auth_user_id()` that retrieves the user ID from either:

- The standard Supabase auth context (`auth.uid()`)
- The custom header (`x-user-id`)

This allows the application to work with both the Supabase Auth system and our custom NextAuth.js integration.

## Database Schema

The application uses two main tables:

### game_history

Stores the history of games played by users:

- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `opponent`: String (name of the AI opponent)
- `result`: Enum ('win', 'loss', 'draw')
- `date`: Timestamp
- `moves_count`: Integer
- `time_taken`: Integer (seconds)
- `difficulty`: String

### user_settings

Stores user preferences and settings:

- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `display_name`: String
- `avatar_url`: String
- `preferred_difficulty`: String
- `theme_preference`: String
- `sound_enabled`: Boolean
- `notifications_enabled`: Boolean
- `piece_set`: String (optional)
- `default_color`: String (optional)
- `show_coordinates`: Boolean (optional)
- `enable_animations`: Boolean (optional)

## Troubleshooting

### Authentication Issues

If you encounter 401 Unauthorized errors when accessing Supabase:

1. Make sure your RLS policies are correctly set up:

   ```bash
   npm run update-rls-policies
   ```

2. Check that you're using the authenticated Supabase client:

   ```typescript
   const client = getAuthenticatedSupabaseClient(session);
   ```

3. Verify that your session contains a valid user ID.

### Database Issues

If you encounter issues with the database:

1. Check your Supabase project settings and ensure the environment variables are correct.
2. Run the setup scripts again:
   ```bash
   npm run setup-db
   npm run create-tables
   npm run update-rls-policies
   ```

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [chess.js](https://github.com/jhlywa/chess.js)
- [Stockfish](https://stockfishchess.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn UI](https://ui.shadcn.com/)
