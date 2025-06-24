require('dotenv').config();
const { Pool } = require('pg');

// Create a PostgreSQL connection pool using the direct connection
const pgPool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Required for Supabase PostgreSQL
  }
});

// Create a PostgreSQL connection pool using the connection pooler
const pgPooler = new Pool({
  host: process.env.PG_POOLER_HOST,
  port: process.env.PG_POOLER_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_POOLER_USER,
  password: process.env.PG_POOLER_PASSWORD || process.env.PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Required for Supabase PostgreSQL
  }
});

// Test the direct connection
async function testDirectConnection() {
  try {
    const client = await pgPool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Direct PostgreSQL connection successful:', result.rows[0]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Direct PostgreSQL connection error:', error);
    return { success: false, error };
  }
}

// Test the connection pooler
async function testPoolerConnection() {
  try {
    const client = await pgPooler.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Pooler PostgreSQL connection successful:', result.rows[0]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Pooler PostgreSQL connection error:', error);
    return { success: false, error };
  }
}

// Create the invoices table if it doesn't exist
async function createInvoiceTable() {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if the table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'invoices'
      );
    `);
    
    // If table doesn't exist, create it
    if (!tableCheck.rows[0].exists) {
      console.log('Creating invoices table...');
      
      await client.query(`
        CREATE TABLE public.invoices (
          id VARCHAR(255) PRIMARY KEY,
          date DATE NOT NULL,
          car_model VARCHAR(100) NOT NULL,
          variant VARCHAR(50) NOT NULL,
          showroom_cost DECIMAL(10, 2) NOT NULL,
          registration DECIMAL(10, 2) NOT NULL,
          insurance DECIMAL(10, 2) NOT NULL,
          no_plate DECIMAL(10, 2),
          cts DECIMAL(10, 2),
          gps DECIMAL(10, 2),
          fastag DECIMAL(10, 2),
          speed_governor DECIMAL(10, 2),
          accessories DECIMAL(10, 2),
          on_road_price DECIMAL(10, 2) NOT NULL,
          loan_amount DECIMAL(10, 2),
          margin DECIMAL(10, 2),
          process_fee DECIMAL(10, 2),
          stamp_duty DECIMAL(10, 2),
          handling_charge DECIMAL(10, 2),
          loan_insurance DECIMAL(10, 2),
          customer_name VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(15) NOT NULL,
          customer_address TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX idx_invoices_customer_phone ON public.invoices(customer_phone);
      `);
      
      await client.query(`
        CREATE INDEX idx_invoices_date ON public.invoices(date);
      `);
      
      console.log('Invoices table created successfully');
    } else {
      console.log('Invoices table already exists');
    }
    
    await client.query('COMMIT');
    return { success: true, message: 'Invoice table setup complete' };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error setting up invoice table:', error);
    return { success: false, error };
  } finally {
    client.release();
  }
}

// Insert a sample invoice
async function insertSampleInvoice() {
  const client = await pgPool.connect();
  try {
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
    
    // Insert the sample invoice
    await client.query(`
      INSERT INTO invoices (
        id, date, car_model, variant, 
        showroom_cost, registration, insurance, 
        no_plate, cts, gps, fastag, 
        speed_governor, accessories, on_road_price,
        loan_amount, margin, process_fee,
        stamp_duty, handling_charge, loan_insurance,
        customer_name, customer_phone, customer_address
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20,
        $21, $22, $23
      )
    `, [
      invoiceId, 
      new Date().toISOString().split('T')[0], 
      'Maruti Ertiga', 
      'ZXI+',
      showroomCost,
      registration,
      insurance,
      noPlate,
      cts,
      gps,
      fastag,
      speedGovernor,
      accessories,
      onRoadPrice,
      900000,
      303500,
      5000,
      2500,
      7500,
      25000,
      'Sample Customer',
      '9876543210',
      '123 Sample Street, City, 400001'
    ]);
    
    console.log('Sample invoice inserted successfully:', invoiceId);
    return { success: true, invoiceId };
  } catch (error) {
    console.error('Error inserting sample invoice:', error);
    return { success: false, error };
  } finally {
    client.release();
  }
}

module.exports = {
  pgPool,
  pgPooler,
  testDirectConnection,
  testPoolerConnection,
  createInvoiceTable,
  insertSampleInvoice
}; 