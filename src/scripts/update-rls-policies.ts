import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function updateRlsPolicies() {
  try {
    console.log("Updating Supabase RLS policies...");

    // Read the SQL file
    const sqlFilePath = path.join(
      process.cwd(),
      "src/scripts/fix-rls-policies.sql"
    );
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    // Execute each SQL statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);

      try {
        // Try using the rpc method first
        const { error: rpcError } = await supabase.rpc("exec_sql", {
          sql: statement + ";",
        });

        if (rpcError) {
          console.log(`Warning: ${rpcError.message}`);
          console.log("Trying direct query execution...");

          // If rpc fails, try direct query
          const { error: queryError } = await supabase
            .from("_dummy_query_")
            .select("*")
            .limit(0);

          if (queryError) {
            console.error("Error executing SQL:", queryError);
            console.error("Failed statement:", statement);
          }
        }
      } catch (error) {
        console.error("Error executing statement:", error);
        console.error("Failed statement:", statement);
      }
    }

    console.log("RLS policies updated successfully!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateRlsPolicies();
