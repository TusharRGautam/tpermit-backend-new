require('dotenv').config();
const { supabaseClient, supabaseAdmin } = require('./supabaseClient');

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying database setup...\n');
  
  const results = {
    quotations: false,
    invoices: false,
    login: false,
    connection: false
  };

  try {
    // Test basic connection
    console.log('1. Testing Supabase connection...');
    const { data: connectionTest } = await supabaseClient.from('information_schema.tables').select('table_name').limit(1);
    
    if (connectionTest !== null) {
      results.connection = true;
      console.log('✅ Connection successful');
    } else {
      console.log('❌ Connection failed');
      return results;
    }

    // Test quotations table
    console.log('\n2. Testing quotations table...');
    try {
      const { data: quotationData, error: quotationError } = await supabaseClient
        .from('quotations')
        .select('*')
        .limit(1);
      
      if (!quotationError) {
        results.quotations = true;
        console.log(`✅ Quotations table exists with ${quotationData ? quotationData.length : 0} sample records`);
      } else {
        console.log('❌ Quotations table error:', quotationError.message);
      }
    } catch (error) {
      console.log('❌ Quotations table not accessible:', error.message);
    }

    // Test invoices table
    console.log('\n3. Testing invoices table...');
    try {
      const { data: invoiceData, error: invoiceError } = await supabaseClient
        .from('invoices')
        .select('*')
        .limit(1);
      
      if (!invoiceError) {
        results.invoices = true;
        console.log(`✅ Invoices table exists with ${invoiceData ? invoiceData.length : 0} sample records`);
      } else {
        console.log('❌ Invoices table error:', invoiceError.message);
      }
    } catch (error) {
      console.log('❌ Invoices table not accessible:', error.message);
    }

    // Test login table
    console.log('\n4. Testing login table...');
    try {
      const { data: loginData, error: loginError } = await supabaseClient
        .from('login')
        .select('email, name, role')
        .limit(5);
      
      if (!loginError) {
        results.login = true;
        console.log(`✅ Login table exists with ${loginData ? loginData.length : 0} user records`);
        if (loginData && loginData.length > 0) {
          console.log('   Users found:', loginData.map(u => `${u.name} (${u.email})`).join(', '));
        }
      } else {
        console.log('❌ Login table error:', loginError.message);
      }
    } catch (error) {
      console.log('❌ Login table not accessible:', error.message);
    }

    // Summary
    console.log('\n📊 SETUP SUMMARY:');
    console.log('==================');
    console.log(`Connection: ${results.connection ? '✅' : '❌'}`);
    console.log(`Quotations Table: ${results.quotations ? '✅' : '❌'}`);
    console.log(`Invoices Table: ${results.invoices ? '✅' : '❌'}`);
    console.log(`Login Table: ${results.login ? '✅' : '❌'}`);
    
    const allGood = Object.values(results).every(r => r === true);
    
    if (allGood) {
      console.log('\n🎉 All tables are set up correctly! Database is ready to use.');
    } else {
      console.log('\n⚠️  Some tables are missing. Please run the SQL script in Supabase dashboard:');
      console.log('   1. Go to https://app.supabase.com/project/gbcncisbxiuzkrazbyew/sql');
      console.log('   2. Copy and paste the content from create_all_tables.sql');
      console.log('   3. Click "Run" to execute all commands');
      console.log('   4. Run this verification script again');
    }

    return results;

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return results;
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyDatabaseSetup()
    .then(results => {
      process.exit(Object.values(results).every(r => r === true) ? 0 : 1);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyDatabaseSetup };