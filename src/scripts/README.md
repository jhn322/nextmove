# Supabase RLS Policy Update Scripts

This directory contains scripts for managing Supabase Row-Level Security (RLS) policies.

## Available Scripts

### `fix-rls-policies.sql`

This SQL file contains the definitions for the RLS policies that control access to the database tables. It:

1. Drops existing policies
2. Creates a custom function `get_auth_user_id()` that retrieves the user ID from either:
   - The standard Supabase auth context (`auth.uid()`)
   - A custom header (`x-user-id`)
3. Creates new policies for the `game_history` and `user_settings` tables
4. Grants necessary permissions to roles

## Running the SQL Directly in Supabase Dashboard (Recommended)

The most reliable way to update your RLS policies is to run the SQL directly in the Supabase dashboard:

1. Log in to your Supabase project
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `fix-rls-policies.sql` into the editor
5. Run the query

This method ensures that the SQL is executed with the correct permissions and in the correct context.

## Running via Node.js Script (Alternative)

Alternatively, you can use the TypeScript script to execute the SQL statements:

### `update-rls-policies.ts`

This script executes the SQL statements from `fix-rls-policies.sql` against your Supabase database.

To update your Supabase RLS policies:

1. Ensure you have the required environment variables set:

   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (with admin privileges)

2. Run the script using one of the following methods:

   ```bash
   # Using ts-node (if installed globally)
   ts-node src/scripts/update-rls-policies.ts

   # Using npx
   npx ts-node src/scripts/update-rls-policies.ts

   # Or add it to your package.json scripts and run
   npm run update-rls-policies
   ```

## Troubleshooting

### Module Import Errors

If you encounter errors like "Cannot use import statement outside a module" when running the scripts:

1. Make sure you're using the CommonJS version of the scripts
2. Or add `"type": "module"` to your package.json

### RLS Policy Errors

If you're still encountering RLS policy errors after running the scripts:

1. Check the Supabase logs for more detailed error messages
2. Verify that the `get_auth_user_id()` function is working correctly
3. Make sure your application is sending the correct `x-user-id` header
4. Try running the SQL directly in the Supabase dashboard

## Security Considerations

- The service role key has admin privileges, so handle it with care.
- Never commit environment variables to your repository.
- Consider using a `.env` file for local development.
