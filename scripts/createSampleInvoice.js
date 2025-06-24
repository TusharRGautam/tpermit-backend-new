require('dotenv').config();
const { supabaseAdmin } = require('../utils/httpClient');
const invoiceModel = require('../models/Invoice');

async function createSampleInvoice() {
  try {
    console.log('Creating a sample invoice...');
    
    // Generate an invoice ID
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const invoiceId = `INV-${year}${month}-${random}`;
    
    // Sample invoice data
    const invoiceData = {
      id: invoiceId,
      date: date.toISOString().split('T')[0],
      carModel: 'Maruti Ertiga',
      variant: 'ZXI+',
      showroomCost: '1050000',
      registration: '85000',
      insurance: '32500',
      noPlate: '2500',
      cts: '10500',
      gps: '6500',
      fastag: '500',
      speedGovernor: '1000',
      accessories: '15000',
      loanAmount: '900000',
      margin: '303500',
      processFee: '5000',
      stampDuty: '2500',
      handlingCharge: '7500',
      loanInsurance: '25000',
      customerName: 'Sample Customer',
      customerPhone: '9876543210',
      customerAddress: '123 Sample Street, City, 400001'
    };
    
    console.log('Invoice data:', invoiceData);
    
    // Create the invoice
    const result = await invoiceModel.createInvoice(invoiceData);
    
    if (result.success) {
      console.log('Sample invoice created successfully!');
      console.log('Invoice ID:', invoiceId);
    } else {
      console.error('Failed to create sample invoice');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample invoice:', error);
    process.exit(1);
  }
}

createSampleInvoice(); 