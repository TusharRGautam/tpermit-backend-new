require('dotenv').config();
const { supabaseAdmin } = require('../supabaseClient');

// Function to check if column exists in a table
async function columnExists(tableName, columnName) {
  try {
    // Using the information_schema to check if a column exists
    const { data, error } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('column_name', columnName);
      
    if (error) {
      console.error(`Error checking if column ${columnName} exists:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Failed to check if column ${columnName} exists:`, error);
    return false;
  }
}

// Function to validate the invoice table structure
async function validateInvoiceTable() {
  try {
    console.log('Checking if invoices table exists...');
    
    // Try to access the invoices table
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('count')
      .limit(1);
      
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist error code
        console.log('Invoices table does not exist. Please create it first.');
        return false;
      }
      console.error('Error accessing invoices table:', error);
      return false;
    }
    
    console.log('Invoices table exists. Proceeding with migration...');
    return true;
  } catch (error) {
    console.error('Failed to validate invoice table:', error);
    return false;
  }
}

// Function to get current table structure
async function getTableStructure(tableName) {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_table_structure', { table_name: tableName });
      
    if (error) {
      console.error(`Error getting structure for table ${tableName}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to get structure for table ${tableName}:`, error);
    return null;
  }
}

// Main migration function
async function migrateInvoiceTable() {
  try {
    console.log('Starting invoice table migration...');
    
    const tableExists = await validateInvoiceTable();
    if (!tableExists) {
      console.log('Please create the invoices table in Supabase with the following structure:');
      console.log(`
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

-- Add index on customer_phone for faster lookups
CREATE INDEX idx_invoices_customer_phone ON public.invoices(customer_phone);

-- Add index on date for easier date-based filtering
CREATE INDEX idx_invoices_date ON public.invoices(date);
      `);
      return;
    }
    
    console.log('Migration completed successfully.');
    
    // Insert a test record
    console.log('Would you like to insert a test record? (Run with --test argument)');
    if (process.argv.includes('--test')) {
      const testInvoiceData = {
        id: `TEST-${new Date().getTime()}`,
        date: new Date().toISOString().split('T')[0],
        car_model: 'Test Model',
        variant: 'Test Variant',
        showroom_cost: 1000000.00,
        registration: 50000.00,
        insurance: 25000.00,
        no_plate: 2000.00,
        cts: 10000.00,
        on_road_price: 1087000.00,
        customer_name: 'Test Customer',
        customer_phone: '1234567890',
        customer_address: 'Test Address'
      };
      
      const { data, error } = await supabaseAdmin
        .from('invoices')
        .insert([testInvoiceData])
        .select();
        
      if (error) {
        console.error('Error inserting test record:', error);
      } else {
        console.log('Test record inserted successfully:', data);
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateInvoiceTable(); 