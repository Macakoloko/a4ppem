-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function to create tables if they don't exist
CREATE OR REPLACE FUNCTION create_table_if_not_exists(table_name text, columns text)
RETURNS void AS $$
DECLARE
  table_exists boolean;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = create_table_if_not_exists.table_name
  ) INTO table_exists;
  
  -- If table doesn't exist, create it
  IF NOT table_exists THEN
    EXECUTE format('CREATE TABLE %I (%s)', table_name, columns);
    RAISE NOTICE 'Table % created successfully', table_name;
  ELSE
    RAISE NOTICE 'Table % already exists', table_name;
  END IF;
END;
$$ LANGUAGE plpgsql; 