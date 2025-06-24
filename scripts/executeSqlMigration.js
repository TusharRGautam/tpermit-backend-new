require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../supabaseClient');

// Function to execute SQL migration using the Supabase client
async function executeSqlMigration() {
  try {
    console.log('Executing migration for quotation table...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'create_quotation_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL using the Supabase client
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      if (error.message.includes('function "exec_sql" does not exist')) {
        console.error('The function exec_sql does not exist in your Supabase instance.');
        console.log('Please execute the SQL migration manually through Supabase SQL Editor:');
        console.log('\n-------------------------------------------\n');
        console.log(sqlContent);
        console.log('\n-------------------------------------------\n');
      } else {
        console.error('Error executing SQL migration:', error);
      }
      return;
    }
    
    console.log('Migration executed successfully:', data);
    
    // Verify if the table exists
    await verifyQuotationTable();
    
  } catch (error) {
    console.error('Migration execution failed:', error);
    console.log('Please execute the SQL migration manually through Supabase SQL Editor:');
    console.log('\n-------------------------------------------\n');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'create_quotation_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log(sqlContent);
    console.log('\n-------------------------------------------\n');
  }
}

// Function to verify if the quotation table exists
async function verifyQuotationTable() {
  try {
    console.log('Verifying if quotation table exists...');
    
    // Try to access the quotations table by querying metadata
    const { data, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'quotations');
      
    if (error) {
      console.error('Error checking if quotations table exists:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Quotations table exists!');
      return true;
    } else {
      console.log('❌ Quotations table does not exist.');
      return false;
    }
  } catch (error) {
    console.error('Failed to verify quotation table:', error);
    return false;
  }
}

// Execute the migration
executeSqlMigration(); 