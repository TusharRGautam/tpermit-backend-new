require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const axios = require('axios');

async function runMigration() {
  console.log('🚀 Running database migration for facebook_leads table...\n');

  // Read SQL content
  const sqlFilePath = path.join(__dirname, '..', 'migrations', 'create_facebook_leads_table.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Try PostgreSQL connection first (direct connection)
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (connectionString) {
    console.log('🔌 Connecting directly to PostgreSQL database...');
    const client = new Client({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL!');
      
      console.log('Executing SQL migration script...');
      await client.query(sqlContent);
      console.log('✅ Migration query executed successfully!');
      
      // Verify table
      const res = await client.query("SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'facebook_leads');");
      const exists = res.rows[0].exists;
      
      await client.end();
      
      if (exists) {
        console.log('🎉 facebook_leads table verified to exist in the database!');
        return true;
      } else {
        console.log('❌ Query finished but table not found in pg_tables.');
      }
    } catch (pgError) {
      console.error('❌ PostgreSQL migration failed:', pgError.message);
      console.log('Attempting fallback to Supabase REST SQL API...');
    }
  } else {
    console.log('⚠️ No DIRECT_URL or DATABASE_URL found. Attempting Supabase REST SQL API...');
  }

  // Fallback to Supabase REST SQL API
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    console.log('🔌 Connecting to Supabase REST SQL API...');
    try {
      const response = await axios({
        method: 'POST',
        url: `${supabaseUrl}/rest/v1/sql`,
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        data: {
          query: sqlContent
        }
      });
      
      console.log(`✅ REST SQL endpoint response: ${response.status}`);
      console.log('🎉 Migration query executed successfully via Supabase REST SQL API!');
      return true;
    } catch (restError) {
      console.error('❌ REST SQL API fallback failed:', restError.message);
      if (restError.response) {
        console.error('Response details:', restError.response.data);
      }
    }
  } else {
    console.log('⚠️ Missing Supabase credentials in environment.');
  }

  console.log('\n❌ ALL MIGRATION METHODS FAILED.');
  console.log('Please run the following SQL manually in the Supabase SQL Editor:');
  console.log('------------------------------------------------------------');
  console.log(sqlContent);
  console.log('------------------------------------------------------------');
  return false;
}

runMigration().then(success => {
  if (success) {
    console.log('\n✅ Database setup completed successfully!');
    process.exit(0);
  } else {
    console.error('\n❌ Database setup failed.');
    process.exit(1);
  }
}).catch(err => {
  console.error('\n💥 Unexpected error:', err);
  process.exit(1);
});
