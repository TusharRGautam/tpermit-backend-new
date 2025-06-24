require('dotenv').config();
const invoiceModel = require('../models/Invoice');

async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Initialize invoice table
    console.log('Creating invoice table...');
    await invoiceModel.createInvoiceTable();
    
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase(); 