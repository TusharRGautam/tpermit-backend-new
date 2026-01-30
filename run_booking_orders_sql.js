require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./supabaseClient');

async function runBookingOrdersSql() {
  try {
    console.log('Attempting to execute booking_orders.sql...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'booking_orders.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL using the Supabase client
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
        console.error('RPC Error:', error.message);
        if (error.message.includes('function "exec_sql" does not exist') || error.message.includes('Could not find the function')) {
             console.log('\nCRITICAL: The "exec_sql" function is not installed on your Supabase database.');
             console.log('You MUST manually run the content of "booking_orders.sql" in the Supabase SQL Editor.');
        }
        return false;
    }
    
    console.log('✅ SQL executed successfully via exec_sql RPC!');
    return true;

  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

runBookingOrdersSql();
