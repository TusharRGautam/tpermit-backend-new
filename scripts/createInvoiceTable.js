require('dotenv').config();
const { supabaseAdmin } = require('../supabaseClient');
const fs = require('fs');
const path = require('path');

async function createInvoiceTable() {
  try {
    console.log('Creating invoice table in Supabase...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'invoice_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL directly
    const { data, error } = await supabaseAdmin.rpc('pgp_sql_raw', { query: sqlContent });
    
    if (error) {
      console.error('Error creating invoice table:', error);
      
      console.log('\nAlternative method: Please create the invoices table manually in Supabase:');
      console.log('1. Go to https://supabase.com/dashboard/project/idoaahigjtspwwdgzums');
      console.log('2. Click on "SQL Editor" in the left sidebar');
      console.log('3. Create a new query');
      console.log('4. Copy and paste the SQL code from migrations/invoice_table.sql');
      console.log('5. Click "Run"');
      return;
    }
    
    console.log('Invoice table created successfully!');
    console.log(data);
  } catch (error) {
    console.error('Failed to create invoice table:', error);
  }
}

createInvoiceTable(); 