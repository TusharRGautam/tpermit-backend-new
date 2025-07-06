// Create a sample invoice in SQLite
require('dotenv').config();
const SqliteInvoice = require('../models/SqliteInvoice');

async function createSampleInvoice() {
  try {
    // Make sure table exists
    await SqliteInvoice.ensureInvoiceTable();
    
    // Generate an invoice ID
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const invoiceId = `INV-${year}${month}-${random}`;
    
    // Calculate on-road price
    const showroomCost = 1050000;
    const registration = 85000;
    const insurance = 32500;
    const noPlate = 2500;
    const cts = 10500;
    const gps = 6500;
    const fastag = 500;
    const speedGovernor = 1000;
    const accessories = 15000;
    
    const onRoadPrice = showroomCost + registration + insurance + noPlate + 
                      cts + gps + fastag + speedGovernor + accessories;
    
    // Create sample invoice data
    const invoiceData = {
      id: invoiceId,
      date: new Date().toISOString().split('T')[0],
      car_model: 'Maruti Suzuki ERTIGA',
      variant: 'ZXI+',
      showroom_cost: showroomCost,
      registration: registration,
      insurance: insurance,
      no_plate: noPlate,
      cts: cts,
      gps: gps,
      fastag: fastag,
      speed_governor: speedGovernor,
      accessories: accessories,
      on_road_price: onRoadPrice,
      loan_amount: 900000,
      margin: 303500,
      process_fee: 5000,
      stamp_duty: 2500,
      handling_charge: 7500,
      loan_insurance: 25000,
      customer_name: 'Sample Customer',
      customer_phone: '9876543210',
      customer_address: '123 Sample Street, City, 400001'
    };
    
    // Insert the sample invoice
    const result = await SqliteInvoice.createInvoice(invoiceData);
    
    if (result.error) {
      console.error('Error creating sample invoice:', result.error);
    } else {
      console.log('✅ Sample invoice created successfully!');
      console.log('Invoice ID:', invoiceId);
    }
    
    // List all invoices
    const invoices = await SqliteInvoice.getAllInvoices();
    console.log('\nAll Invoices:');
    console.table(invoices.data);
    
  } catch (error) {
    console.error('Error in creating sample invoice:', error);
  }
}

createSampleInvoice(); 