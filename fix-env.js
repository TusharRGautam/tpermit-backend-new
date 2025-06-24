const fs = require('fs');

const newEnvContent = `# Supabase Configuration
SUPABASE_URL=https://idoaahigjtspwwdgzums.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb2FhaGlnanRzcHd3ZGd6dW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzI1NDksImV4cCI6MjA2NTY0ODU0OX0.vOgd2vLZsl7Waf_z-rrfkzI_Q8XAbzDHP2HmbCZeufM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb2FhaGlnanRzcHd3ZGd6dW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA3MjU0OSwiZXhwIjoyMDY1NjQ4NTQ5fQ.UcAbhRtd-x3DCdOyxZ_cEdbR-sGAiC6MN9Grp_gMLJA

# PostgreSQL Direct Connection - Using URL extracted from SUPABASE_URL
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
`;

try {
  fs.writeFileSync('.env', newEnvContent);
  console.log('Successfully updated .env file');
} catch (err) {
  console.error('Error writing to .env file:', err);
} 