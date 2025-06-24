require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql() {
  try {
    console.log('Executing SQL to create invoice table in Supabase...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'invoice_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Use Supabase SQL API endpoint
    const response = await axios({
      method: 'POST',
      url: `${supabaseUrl}/rest/v1/sql`,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        query: sqlContent
      }
    });
    
    console.log('SQL execution response:', response.status);
    console.log('SQL execution successful!');
    return true;
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    // Print the SQL script for manual execution
    console.log('\nPlease execute the following SQL in Supabase SQL Editor:');
    console.log('1. Go to https://supabase.com/dashboard/project/idoaahigjtspwwdgzums');
    console.log('2. Click on "SQL Editor" in the left sidebar');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the SQL code below:');
    console.log('\n-------------------------------------------');
    
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'invoice_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(sqlContent);
    
    console.log('-------------------------------------------\n');
    console.log('5. Click "Run"');
    
    return false;
  }
}

async function verifyTable() {
  try {
    console.log('\nVerifying if invoice table exists...');
    
    // Test if the table exists by querying it
    const response = await axios({
      method: 'GET',
      url: `${supabaseUrl}/rest/v1/invoices?select=count=eq.true&limit=1`,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Invoice table exists and is accessible!');
      return true;
    } else {
      console.log('❌ Couldn\'t verify table existence. Status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error verifying table:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Try to execute the SQL
    const success = await executeSql();
    
    // Verify if the table now exists
    if (success) {
      await verifyTable();
    }
    
    console.log('Process completed.');
  } catch (error) {
    console.error('Process failed:', error);
  }
}

main(); 