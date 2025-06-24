require('dotenv').config();
const { supabaseAdmin } = require('../supabaseClient');

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Get Supabase URL for confirmation
    console.log(`Connecting to Supabase URL: ${process.env.SUPABASE_URL}`);
    
    // List all tables to confirm connectivity
    const { data: tables, error: tablesError } = await supabaseAdmin
      .rpc('list_tables');
    
    if (tablesError) {
      console.error('Error getting tables:', tablesError);
      // Try an alternative approach if RPC is not available
      console.log('Trying alternative approach...');
      const { data, error } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Error connecting to invoices table:', error);
        console.error('Connection test failed');
        process.exit(1);
      } else {
        console.log('Successfully connected to invoices table');
        console.log('Found data:', data);
      }
    } else {
      console.log('Available tables:');
      console.log(tables);
      
      // Check if invoices table exists
      const invoicesTable = tables.find(t => t.name === 'invoices');
      if (invoicesTable) {
        console.log('Invoices table exists!');
        
        // Try to fetch one record from the invoices table
        const { data, error } = await supabaseAdmin
          .from('invoices')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error('Error querying invoices table:', error);
        } else {
          console.log(`Found ${data.length} records in invoices table`);
          if (data.length > 0) {
            console.log('Sample record:', data[0]);
          }
        }
      } else {
        console.log('Invoices table does not exist yet');
      }
    }
    
    console.log('Connection test completed');
    process.exit(0);
  } catch (error) {
    console.error('Connection test failed with error:', error);
    process.exit(1);
  }
}

testConnection(); 