-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own game history" ON game_history;
DROP POLICY IF EXISTS "Users can insert their own game history" ON game_history;
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;

-- Create a function to get the user ID from the custom header
CREATE OR REPLACE FUNCTION get_auth_user_id() 
RETURNS uuid 
LANGUAGE sql 
STABLE
AS $$
  -- First try to get the ID from the standard auth.uid()
  -- If that's not available, try to get it from our custom header
  SELECT 
    CASE
      WHEN auth.uid() IS NOT NULL THEN auth.uid()
      WHEN current_setting('request.headers', true)::json->>'x-user-id' IS NOT NULL 
        THEN (current_setting('request.headers', true)::json->>'x-user-id')::uuid
      ELSE NULL
    END;
$$;

-- Enable RLS on tables if not already enabled
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for game_history
CREATE POLICY "Users can view their own game history" 
ON game_history FOR SELECT 
USING (user_id = get_auth_user_id());

CREATE POLICY "Users can insert their own game history" 
ON game_history FOR INSERT 
WITH CHECK (user_id = get_auth_user_id());

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings" 
ON user_settings FOR SELECT 
USING (user_id = get_auth_user_id());

CREATE POLICY "Users can update their own settings" 
ON user_settings FOR UPDATE 
USING (user_id = get_auth_user_id());

CREATE POLICY "Users can insert their own settings" 
ON user_settings FOR INSERT 
WITH CHECK (user_id = get_auth_user_id());

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_auth_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_user_id() TO anon;

-- Grant access to tables
GRANT SELECT, INSERT, UPDATE ON TABLE game_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE user_settings TO authenticated;
GRANT SELECT ON TABLE game_history TO anon;
GRANT SELECT ON TABLE user_settings TO anon; 