require('dotenv').config();
const { supabaseAdmin } = require('../supabaseClient');
const invoiceModel = require('../models/Invoice');

async function testInvoiceTable() {
  try {
    console.log('Testing connection to Supabase and the invoices table...');
    
    // First, test basic connectivity to Supabase
    console.log('\nChecking Supabase connection...');
    
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      console.error('Could not connect to Supabase. Please check your credentials and network connection.');
      process.exit(1);
    }
    
    console.log('\nChecking invoice table...');
    const tableExists = await invoiceModel.ensureInvoiceTable();
    
    if (!tableExists) {
      console.log('\nInvoice table does not exist or is not accessible.');
      console.log('Please create the invoices table in Supabase using the SQL script:');
      console.log('migrations/invoice_table.sql');
    } else {
      console.log('\nInvoice table exists and is accessible!');
      console.log('Your backend is ready to handle invoice operations.');
      
      // Try to get all invoices to test further
      console.log('\nTrying to fetch all invoices...');
      const invoices = await invoiceModel.getAllInvoices();
      console.log(`Found ${invoices.length} invoices in the table.`);
      
      if (invoices.length > 0) {
        console.log('Sample invoice data:', invoices[0]);
      } else {
        console.log('No invoice data found. You can add test data using the SQL in migrations/invoice_table.sql');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
}

// Test basic Supabase connectivity
async function testSupabaseConnection() {
  try {
    // Use a simple health check endpoint
    const response = await supabaseAdmin.axios.get('/rest/v1/');
    if (response.status === 200) {
      console.log('Successfully connected to Supabase!');
      return { success: true };
    } else {
      console.error(`Unexpected status code: ${response.status}`);
      return { success: false, error: `Unexpected status code: ${response.status}` };
    }
  } catch (error) {
    console.error('Supabase connection error:', error.message);
    return { success: false, error: error.message };
  }
}

testInvoiceTable(); 