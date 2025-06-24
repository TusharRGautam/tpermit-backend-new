const fs = require('fs');
const path = require('path');

// Define the path to your .env file
const envPath = path.resolve(__dirname, '.env');

// Generate a new .env file content
const envContent = `# Supabase Configuration
# NOTE: These values are likely outdated - replace with your current Supabase project credentials
SUPABASE_URL=https://idoaahigjtspwwdgzums.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb2FhaGlnanRzcHd3ZGd6dW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzI1NDksImV4cCI6MjA2NTY0ODU0OX0.vOgd2vLZsl7Waf_z-rrfkzI_Q8XAbzDHP2HmbCZeufM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb2FhaGlnanRzcHd3ZGd6dW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA3MjU0OSwiZXhwIjoyMDY1NjQ4NTQ5fQ.UcAbhRtd-x3DCdOyxZ_cEdbR-sGAiC6MN9Grp_gMLJA

# PostgreSQL Direct Connection
PG_HOST=db.idoaahigjtspwwdgzums.supabase.co
PG_PORT=5432
PG_DATABASE=postgres
PG_USER=postgres
PG_PASSWORD=Incorrect@#$%&*123

# PostgreSQL Transaction Pooler
PG_POOLER_HOST=aws-0-ap-south-1.pooler.supabase.com
PG_POOLER_PORT=6543
PG_POOLER_USER=postgres.idoaahigjtspwwdgzums
PG_POOLER_PASSWORD=Incorrect@#$%&*123

# Server Configuration
PORT=5000
HOST=0.0.0.0

# Database Implementation
# Possible values: auto, supabase, postgres, sqlite
DB_IMPLEMENTATION=supabase

# Skip PostgreSQL direct connection attempt (prevents DNS error messages)
SKIP_PG_DIRECT=true

# SQLite Configuration
SQLITE_DB_PATH=./data/invoice.db
`;

try {
  // Write the new .env file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file has been updated successfully!');
  console.log('The application will now:');
  console.log('1. Use the Supabase REST API directly (recommended)');
  console.log('2. PostgreSQL direct connection test will be skipped');
  console.log('3. If Supabase API fails, it will fall back to local SQLite database');
  console.log('\nTo update your Supabase credentials:');
  console.log('1. Create a new project at https://supabase.com');
  console.log('2. Go to Project Settings > API');
  console.log('3. Copy the URL, anon key, and service role key');
  console.log('4. Update the .env file with these new values');
  console.log('5. Run npm run migrate to create tables in your new Supabase project');
} catch (error) {
  console.error('Error updating .env file:', error);
  process.exit(1);
} 