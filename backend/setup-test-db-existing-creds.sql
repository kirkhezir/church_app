-- Create test database for church_app tests
-- Uses same PostgreSQL instance and credentials as development database

-- Create test database if it doesn't exist
SELECT 'CREATE DATABASE church_app_test OWNER postgres'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'church_app_test')\gexec

-- Connect to test database
\c church_app_test

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

\echo '✅ Test database "church_app_test" setup complete!'
\echo '📝 Database URL: postgresql://postgres:admin123@localhost:5432/church_app_test'
