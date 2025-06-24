require('dotenv').config();
const axios = require('axios');
const { pgPool, pgPooler } = require('../utils/pgClient');
const { supabaseClient, supabaseAdmin } = require('../utils/httpClient');

async function diagnoseConnections() {
  console.log('💉 Database Connection Diagnostics 💉');
  console.log('===================================\n');
  
  // Check environment variables
  console.log('📋 Checking environment variables:');
  const envVars = {
    'SUPABASE_URL': process.env.SUPABASE_URL,
    'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY ? '***' + process.env.SUPABASE_ANON_KEY.slice(-5) : undefined,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY ? '***' + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-5) : undefined,
    'PG_HOST': process.env.PG_HOST,
    'PG_PORT': process.env.PG_PORT,
    'PG_DATABASE': process.env.PG_DATABASE,
    'PG_USER': process.env.PG_USER,
    'PG_PASSWORD': process.env.PG_PASSWORD ? '***' : undefined,
    'PG_POOLER_HOST': process.env.PG_POOLER_HOST,
    'PG_POOLER_PORT': process.env.PG_POOLER_PORT,
    'PG_POOLER_USER': process.env.PG_POOLER_USER,
    'PG_POOLER_PASSWORD': process.env.PG_POOLER_PASSWORD ? '***' : undefined,
  };
  
  // Check which variables are set
  const missingVars = [];
  Object.entries(envVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
      console.log(`  ❌ ${key}: Missing`);
    } else {
      console.log(`  ✅ ${key}: ${value}`);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`\n⚠️ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('Please set these variables in your .env file.');
  } else {
    console.log('\n✅ All environment variables are set!');
  }

  // Test direct HTTP connectivity to Supabase
  console.log('\n🌐 Testing direct HTTP connectivity to Supabase:');
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    console.log(`  Trying to connect to ${supabaseUrl}...`);
    
    const response = await axios.get(supabaseUrl, { 
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    
    console.log(`  Response status: ${response.status}`);
    if (response.status >= 200 && response.status < 500) {
      console.log('  ✅ HTTP connectivity to Supabase is working!');
    } else {
      console.log('  ❌ HTTP connectivity to Supabase failed with status:', response.status);
    }
  } catch (error) {
    console.error('  ❌ HTTP connectivity error:', error.message);
    console.log('  This indicates network connectivity issues or DNS resolution problems.');
  }

  // Test Supabase REST API with anonymous key
  console.log('\n🔑 Testing Supabase REST API with anonymous key:');
  try {
    const { error } = await supabaseClient.select('invoices', { limit: 1 });
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('  ⚠️ Table "invoices" does not exist yet. This is expected if you\'re setting up for the first time.');
        console.log('  Connection to Supabase is working, but you need to create the table.');
      } else {
        console.log(`  ❌ Supabase REST API error: ${error.message}`);
      }
    } else {
      console.log('  ✅ Supabase REST API with anonymous key is working!');
    }
  } catch (error) {
    console.error('  ❌ Supabase REST API error:', error.message);
  }
  
  // Test Supabase REST API with service role key
  console.log('\n👑 Testing Supabase REST API with service role key:');
  try {
    const { error } = await supabaseAdmin.select('invoices', { limit: 1 });
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('  ⚠️ Table "invoices" does not exist yet. This is expected if you\'re setting up for the first time.');
        console.log('  Connection to Supabase is working, but you need to create the table.');
      } else {
        console.log(`  ❌ Supabase REST API error: ${error.message}`);
      }
    } else {
      console.log('  ✅ Supabase REST API with service role key is working!');
    }
  } catch (error) {
    console.error('  ❌ Supabase REST API error:', error.message);
  }
  
  // Test direct PostgreSQL connectivity
  console.log('\n🐘 Testing direct PostgreSQL connectivity:');
  try {
    const client = await pgPool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      console.log(`  ✅ PostgreSQL direct connection successful! Server time: ${result.rows[0].now}`);
      
      // Check if invoices table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'invoices'
        );
      `);
      
      if (tableCheck.rows[0].exists) {
        console.log('  ✅ Invoices table exists!');
      } else {
        console.log('  ⚠️ Invoices table does not exist yet. You need to create it.');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('  ❌ PostgreSQL direct connection error:', error.message);
  }
  
  // Test PostgreSQL connection pooler
  console.log('\n🏊 Testing PostgreSQL connection pooler:');
  try {
    const client = await pgPooler.connect();
    try {
      const result = await client.query('SELECT NOW()');
      console.log(`  ✅ PostgreSQL pooler connection successful! Server time: ${result.rows[0].now}`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('  ❌ PostgreSQL pooler connection error:', error.message);
  }

  // Final diagnosis
  console.log('\n📊 Diagnosis Summary:');
  console.log('------------------');
  console.log('Based on the tests above, your options are:');
  
  // Give recommendations
  console.log('\n1. Use the server.js with auto-detection:');
  console.log('   This will automatically choose the best working connection method.');
  console.log('   Command: npm run dev');
  
  console.log('\n2. Create the invoice table in Supabase:');
  console.log('   Use the SQL script in migrations/invoice_table.sql');
  console.log('   Run it in the Supabase SQL Editor');
  
  console.log('\n3. Fix any connection issues:');
  console.log('   - Make sure your .env file has correct credentials');
  console.log('   - Check if you need to whitelist your IP in Supabase');
  console.log('   - Verify that your network allows the connections');
  
  process.exit(0);
}

diagnoseConnections().catch(err => {
  console.error('Fatal error during diagnostics:', err);
  process.exit(1);
}); 