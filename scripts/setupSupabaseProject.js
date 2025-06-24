require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../supabaseClient');

// Function to display SQL for manual setup
async function displaySqlForManualSetup() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'invoice_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('\n============ SUPABASE SETUP INSTRUCTIONS ============');
    console.log('Your Supabase project is set up with these credentials:');
    console.log('URL:', process.env.SUPABASE_URL);
    console.log('Project ID:', process.env.SUPABASE_URL.split('https://')[1].split('.')[0]);
    console.log('\nTo set up your database tables:');
    console.log('1. Go to https://supabase.com/dashboard/project/idoaahigjtspwwdgzums');
    console.log('2. Click on "SQL Editor" in the left sidebar');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the SQL below:');
    console.log('\n-------------------------------------------\n');
    console.log(sqlContent);
    console.log('\n-------------------------------------------\n');
    console.log('5. Click "Run"');
    console.log('\nAfter executing the SQL, you can test the connection with:');
    console.log('   node scripts/testSupabaseConnection.js');
    console.log('============================================\n');
  } catch (error) {
    console.error('Error reading SQL file:', error);
  }
}

// Test if we can connect to Supabase
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to access public schema info to test connection
    const { data, error } = await supabaseAdmin
      .from('_test_')
      .select('*')
      .limit(1)
      .catch(err => ({ error: err }));
    
    if (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        console.error('Network error - cannot connect to Supabase');
        console.error('Please check your internet connection');
      } else if (error.code === '42P01') {
        // Table doesn't exist but connection works
        console.log('✓ Supabase connection successful!');
        console.log('✓ Authentication successful with service role key');
        return true;
      } else {
        console.error('Connection error:', error.message);
      }
    } else {
      console.log('✓ Supabase connection successful!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to test Supabase connection:', error);
    return false;
  }
}

// Main function
async function main() {
  // Test connection first
  const connected = await testSupabaseConnection();
  
  if (connected) {
    console.log('✓ Your Supabase connection is working properly');
  } else {
    console.log('✗ Could not connect to Supabase with the current credentials');
    console.log('Please check your .env file and internet connection');
  }
  
  // Display manual setup instructions regardless of connection status
  await displaySqlForManualSetup();
}

main(); 