-- Create test user and database for church_app tests

-- Create test user if it doesn't exist
DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'test') THEN
    CREATE USER test WITH PASSWORD 'test';
    RAISE NOTICE 'User "test" created';
  ELSE
    RAISE NOTICE 'User "test" already exists';
  END IF;
END
$$;

-- Create test database if it doesn't exist
SELECT 'CREATE DATABASE church_app_test OWNER test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'church_app_test')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE church_app_test TO test;

\c church_app_test

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO test;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO test;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO test;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO test;

\echo 'Test database setup complete!'
