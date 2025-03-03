# Fixing Supabase RLS Policy Issues

This guide provides step-by-step instructions for resolving Row-Level Security (RLS) policy issues in your Next.js application with Supabase.

## Understanding the Issue

The error "row violates row-level security policy for table user_settings" occurs when:

1. Your application is trying to access data in a table with RLS enabled
2. The RLS policies are preventing access because they can't identify the user

In our application, we're using NextAuth.js for authentication, but Supabase's RLS policies expect a JWT token from Supabase Auth. We need to bridge this gap by using a custom header.

## Solution Overview

1. Update the Supabase client to include a custom header with the user ID
2. Create a custom SQL function in Supabase to extract the user ID from this header
3. Update the RLS policies to use this function
4. Apply these changes to the database

## Step 1: Run the SQL Directly in Supabase Dashboard

The most reliable way to update your RLS policies is to run the SQL directly in the Supabase dashboard:

1. Log in to your Supabase project at https://app.supabase.com
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `fix-rls-policies.sql` into the editor
5. Run the query

This SQL script will:

- Drop existing policies
- Create a custom function `get_auth_user_id()` that retrieves the user ID from either the standard auth context or the custom header
- Create new policies for the `game_history` and `user_settings` tables
- Grant necessary permissions to roles

## Step 2: Verify the Changes

After running the SQL, you can verify that the changes were applied correctly:

1. Go to the "Authentication" section in the Supabase dashboard
2. Click on "Policies"
3. Check that the policies for `game_history` and `user_settings` are using the `get_auth_user_id()` function

## Step 3: Test the RLS Policies

You can test the RLS policies using the provided test script:

```bash
# First, set the TEST_USER_ID environment variable to a valid user ID
export TEST_USER_ID=your-user-id-here

# Then run the test script
npm run test-rls-policies
```

This script will test access to the tables with and without the custom header to verify that the RLS policies are working correctly.

## Step 4: Update Your Application Code

Make sure all your application code is using the authenticated Supabase client:

```typescript
import { getAuthenticatedSupabaseClient } from "@/lib/supabase";

// In your component or API route
const { session } = useAuth(); // or get the session from the request
const client = getAuthenticatedSupabaseClient(session);

// Use the client to access Supabase
const { data, error } = await client
  .from("user_settings")
  .select("*")
  .filter("user_id", "eq", session.user.id)
  .single();
```

## Troubleshooting

### Still Getting RLS Policy Violations

If you're still encountering RLS policy violations:

1. Check the Supabase logs for more detailed error messages
2. Verify that the `get_auth_user_id()` function is working correctly
3. Make sure your application is sending the correct `x-user-id` header
4. Check that you're using the authenticated client everywhere

### Module Import Errors

If you encounter errors like "Cannot use import statement outside a module" when running the scripts:

1. Use the CommonJS version of the scripts (with `require()` instead of `import`)
2. Or add `"type": "module"` to your package.json

### Testing in Development

You can add debugging headers in development mode:

```typescript
return createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      "x-user-id": session.user.id,
      ...(process.env.NODE_ENV === "development" && {
        "x-debug-user-id": session.user.id,
        "x-debug-auth": "true",
      }),
    },
  },
});
```

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [NextAuth.js with Supabase](https://authjs.dev/reference/adapter/supabase)
- [Supabase Custom Claims](https://supabase.com/docs/guides/auth/auth-helpers/nextjs#custom-claims)
