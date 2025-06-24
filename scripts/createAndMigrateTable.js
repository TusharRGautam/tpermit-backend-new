require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Function to create tables using SQL management endpoints
async function createInvoiceTable() {
  try {
    console.log('Creating invoice table in Supabase using REST API...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'invoice_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Call Supabase SQL endpoint
    const response = await axios({
      method: 'POST',
      url: `${supabaseUrl}/rest/v1/`,
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
    
    console.log('Table creation attempt complete');
    
    // Try to verify if the table exists now
    const verifyResponse = await axios({
      method: 'GET',
      url: `${supabaseUrl}/rest/v1/invoices?limit=1`,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Invoice table verification response:', verifyResponse.status);
    console.log('Table appears to be created successfully!');
    
  } catch (error) {
    console.error('Error creating invoice table:', error.message);
    
    // Check if the error is because the table already exists
    if (error.response && error.response.data && error.response.data.message.includes('already exists')) {
      console.log('Table already exists, no need to create it.');
    } else {
      console.log('\nAlternative method: Please create the invoices table manually in Supabase:');
      console.log('1. Go to https://supabase.com/dashboard/project/idoaahigjtspwwdgzums');
      console.log('2. Click on "SQL Editor" in the left sidebar');
      console.log('3. Create a new query');
      console.log('4. Copy and paste the SQL below:');
      console.log('\n-------------------------------------------\n');
      console.log(sqlContent);
      console.log('\n-------------------------------------------\n');
      console.log('5. Click "Run"');
    }
  }
}

// Function to check if table exists and has data
async function checkAndVerifyTable() {
  try {
    console.log('Checking if invoice table exists and has data...');
    
    const response = await axios({
      method: 'GET',
      url: `${supabaseUrl}/rest/v1/invoices?select=*&limit=5`,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('Invoice table exists!');
      if (response.data && response.data.length > 0) {
        console.log(`Found ${response.data.length} records in the table.`);
        console.log('Sample data:', response.data[0]);
      } else {
        console.log('Table exists but has no data yet.');
      }
      return true;
    }
  } catch (error) {
    console.error('Error checking invoice table:', error.message);
    return false;
  }
}

// Main function to run the migration
async function main() {
  try {
    // First check if the table already exists
    const tableExists = await checkAndVerifyTable();
    
    if (!tableExists) {
      // If table doesn't exist, try to create it
      await createInvoiceTable();
      
      // Verify if the table was created
      await checkAndVerifyTable();
    }
    
    console.log('Migration process completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main(); 