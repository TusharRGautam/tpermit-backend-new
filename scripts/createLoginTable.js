require('dotenv').config();
const { supabaseAdmin } = require('../supabaseClient');
const fs = require('fs');
const path = require('path');

async function createLoginTable() {
  try {
    console.log('Creating Login table in Supabase...');
    console.log('Supabase URL:', process.env.SUPABASE_URL ? 'Configured' : 'Not configured');
    
    // First, check if the table already exists
    const tableExists = await checkIfLoginTableExists();
    
    if (tableExists) {
      console.log('✅ Login table already exists!');
      await verifyLoginTable();
      return;
    }
    
    // Since we can't use exec_sql, provide instructions for manual creation
    console.log('\n❌ Login table does not exist and automated creation failed.');
    console.log('Please create the table manually using Supabase dashboard:');
    console.log('\n1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Execute the following SQL:');
    console.log('\n------- COPY THE SQL BELOW -------');
    
    // Read and display the SQL
    const sqlPath = path.join(__dirname, '..', 'migrations', 'create_login_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(sql);
    console.log('------- END OF SQL -------\n');
    
    console.log('4. Click "Run" to execute the SQL');
    console.log('5. Run this script again to verify the table was created');
    
  } catch (error) {
    console.error('Error in createLoginTable:', error);
  }
}

async function checkIfLoginTableExists() {
  try {
    const { data, error } = await supabaseAdmin
      .from('login')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {  // Table doesn't exist
        return false;
      }
      console.error('Error checking for login table:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in checkIfLoginTableExists:', error);
    return false;
  }
}

async function verifyLoginTable() {
  try {
    console.log('\nVerifying Login table...');
    
    const { data, error } = await supabaseAdmin
      .from('login')
      .select('*');
    
    if (error) {
      console.error('Error verifying table:', error);
      return;
    }
    
    console.log(`✅ Login table found with ${data.length} records`);
    
    // Check if our hardcoded credentials exist
    const aswUser = data.find(user => user.email === 'asw@gmail.com');
    if (aswUser) {
      console.log('✅ ASW admin credentials (asw@gmail.com) found in database');
      console.log('✅ Login system is ready to use!');
    } else {
      console.log('❌ ASW admin credentials not found');
      console.log('Please run the SQL script to insert the credentials');
    }
    
  } catch (error) {
    console.error('Error verifying Login table:', error);
  }
}

// Run the script
if (require.main === module) {
  createLoginTable()
    .then(() => {
      console.log('\nScript completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createLoginTable, verifyLoginTable }; 