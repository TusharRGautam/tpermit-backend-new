require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`API Key is ${supabaseKey ? 'provided' : 'missing'}`);

// Test direct HTTP request to Supabase
console.log('\nTesting connection to Supabase using direct HTTPS request...');

// Get URL without the protocol
const urlWithoutProtocol = supabaseUrl.replace(/(^\w+:|^)\/\//, '');

const options = {
  hostname: urlWithoutProtocol,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
};

// Make a direct HTTPS request to test connectivity
const req = https.request(options, res => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', d => {
    console.log('Response data:', d.toString());
  });
});

req.on('error', error => {
  console.error('Connection Error:', error);
});

req.end();

// Generate SQL Schema for the invoices table
console.log('\nGenerating SQL Schema for the invoices table...');

const invoiceTableSql = `
-- Create invoice table
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
`;

// Output the SQL to a file
const sqlOutputPath = path.join(__dirname, '../migrations/invoice_table.sql');
fs.writeFileSync(sqlOutputPath, invoiceTableSql);

console.log(`SQL schema written to ${sqlOutputPath}`);
console.log('\nTo create the invoice table in Supabase:');
console.log('1. Log in to your Supabase dashboard');
console.log('2. Go to the SQL Editor');
console.log(`3. Copy and paste the content from ${sqlOutputPath}`);
console.log('4. Run the SQL query');
console.log('\nAfter creating the table, run "npm run test-connection" to verify the connection.'); 