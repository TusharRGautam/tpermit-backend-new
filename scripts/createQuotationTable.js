require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../supabaseClient');

// Function to create quotation table using SQL via Supabase
async function createQuotationTable() {
  try {
    console.log('Creating quotation table in Supabase...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'create_quotation_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Using the SQL API endpoint for Supabase
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
    
    console.log('Table creation response:', response.status);
    console.log('Table creation attempt complete');
    
    // Verify if the table exists
    await verifyQuotationTable();
    
  } catch (error) {
    console.error('Error creating quotation table:', error.message);
    
    // Display manual instructions in case of error
    console.log('\nAlternative method: Please create the quotations table manually in Supabase:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Click on "SQL Editor" in the left sidebar');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the SQL below:');
    console.log('\n-------------------------------------------\n');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'create_quotation_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log(sqlContent);
    console.log('\n-------------------------------------------\n');
    console.log('5. Click "Run"');
    
    // Try checking if the table exists anyway
    await verifyQuotationTable();
  }
}

// Function to check if quotation table exists directly using metadata tables
async function verifyQuotationTable() {
  try {
    console.log('Verifying if quotation table exists...');
    
    // Try to query for the existence of the table in the Postgres information schema
    const { data, error } = await supabaseAdmin
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'quotations')
      .maybeSingle();
    
    if (error) {
      // If the metadata table is not accessible, try a direct check
      console.error('Error checking table existence through metadata:', error.message);
      return await directCheckTableExists();
    }
    
    if (data) {
      console.log('✅ Quotations table exists!');
      return true;
    } else {
      console.log('❌ Quotations table does not exist.');
      return false;
    }
  } catch (error) {
    console.error('Failed to verify quotation table from metadata:', error);
    return await directCheckTableExists();
  }
}

// Function to directly check if the table exists by trying to select from it
async function directCheckTableExists() {
  try {
    // Try to access the quotations table directly
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist error code
        console.log('❌ Quotations table does not exist (confirmed by direct check).');
        return false;
      }
      console.error('Error in direct table check:', error);
      return false;
    }
    
    console.log('✅ Quotations table exists! (confirmed by direct check)');
    return true;
  } catch (error) {
    console.error('Failed in direct check for quotation table:', error);
    return false;
  }
}

// Main function to run the migration
async function main() {
  try {
    // First check if the table already exists
    const tableExists = await verifyQuotationTable();
    
    if (!tableExists) {
      // If table doesn't exist, create it
      await createQuotationTable();
    } else {
      console.log('Quotation table already exists, skipping creation.');
    }
    
    console.log('Migration process completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main(); 