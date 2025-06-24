require('dotenv').config();
const { supabaseAdmin } = require('../supabaseClient');
const invoiceModel = require('../models/InvoiceFactory');

// Function to test our debug endpoint logic directly
async function testDebugEndpoint() {
  try {
    console.log('=== DEBUG: Fetching all columns from invoices table ===');
    
    // Use the same logic as the endpoint
    const invoices = await invoiceModel.getAllInvoices();
    
    // Log the entire result set to the console for debugging
    console.log('=== START: Invoice Data ===');
    console.log(JSON.stringify(invoices, null, 2));
    console.log(`Total Records: ${invoices.length}`);
    console.log('=== END: Invoice Data ===');
    
    return {
      success: true,
      message: 'Invoices data fetched successfully.',
      count: invoices.length,
      data: invoices
    };
  } catch (error) {
    console.error('Error fetching all invoice data:', error);
    return {
      success: false,
      message: 'Failed to fetch invoice data',
      error: error.message
    };
  }
}

// Run the test
testDebugEndpoint()
  .then(result => {
    if (result.success) {
      console.log(`Successfully fetched ${result.count} records from invoices table`);
    } else {
      console.error('Failed to fetch data:', result.message);
    }
  })
  .catch(error => {
    console.error('Unhandled error during test:', error);
  }); 