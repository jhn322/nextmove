import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseApiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseApiUrl || !supabaseApiKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabaseClient = createSupabaseClient(supabaseApiUrl, supabaseApiKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTables() {
  try {
    console.log("Creating NextAuth tables in Supabase...");

    console.log("Creating users table...");
    const { error: usersError } = await supabaseClient
      .from("users")
      .insert({
        id: "00000000-0000-0000-0000-000000000000",
        name: "Test User",
        email: "test@example.com",
      })
      .select();

    if (usersError) {
      if (usersError.code === "23505") {
        console.log("Users table already exists");
      } else {
        console.error("Error creating users table:", usersError);
      }
    } else {
      console.log("Users table created successfully");
    }

    console.log("Creating accounts table...");
    const { error: accountsError } = await supabaseClient
      .from("accounts")
      .insert({
        id: "00000000-0000-0000-0000-000000000000",
        user_id: "00000000-0000-0000-0000-000000000000",
        type: "oauth",
        provider: "google",
        provider_account_id: "test",
      })
      .select();

    if (accountsError) {
      if (accountsError.code === "23505") {
        console.log("Accounts table already exists");
      } else {
        console.error("Error creating accounts table:", accountsError);
      }
    } else {
      console.log("Accounts table created successfully");
    }

    console.log("Creating sessions table...");
    const { error: sessionsError } = await supabaseClient
      .from("sessions")
      .insert({
        id: "00000000-0000-0000-0000-000000000000",
        user_id: "00000000-0000-0000-0000-000000000000",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        session_token: "test-token",
      })
      .select();

    if (sessionsError) {
      if (sessionsError.code === "23505") {
        console.log("Sessions table already exists");
      } else {
        console.error("Error creating sessions table:", sessionsError);
      }
    } else {
      console.log("Sessions table created successfully");
    }

    console.log("Creating verification_tokens table...");
    const { error: verificationTokensError } = await supabaseClient
      .from("verification_tokens")
      .insert({
        identifier: "test@example.com",
        token: "test-token",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
      .select();

    if (verificationTokensError) {
      if (verificationTokensError.code === "23505") {
        console.log("Verification tokens table already exists");
      } else {
        console.error(
          "Error creating verification tokens table:",
          verificationTokensError
        );
      }
    } else {
      console.log("Verification tokens table created successfully");
    }

    console.log("All tables created or verified!");

    // Clean up test data
    await supabaseClient
      .from("verification_tokens")
      .delete()
      .eq("identifier", "test@example.com");
    await supabaseClient
      .from("sessions")
      .delete()
      .eq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseClient
      .from("accounts")
      .delete()
      .eq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseClient
      .from("users")
      .delete()
      .eq("id", "00000000-0000-0000-0000-000000000000");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createTables();
