require('dotenv').config();
const pgClient = require('../utils/pgClient');

async function testDatabaseConnection() {
  console.log('Testing connections to PostgreSQL database...');
  
  // Test direct connection
  console.log('\n1. Testing direct PostgreSQL connection...');
  const directResult = await pgClient.testDirectConnection();
  
  if (directResult.success) {
    console.log('✅ Direct connection successful!');
    
    // Set up invoice table
    console.log('\nSetting up invoice table...');
    const tableResult = await pgClient.createInvoiceTable();
    
    if (tableResult.success) {
      console.log('✅ Invoice table is ready!');
      
      // Insert sample invoice if requested
      if (process.argv.includes('--sample')) {
        console.log('\nInserting sample invoice...');
        const sampleResult = await pgClient.insertSampleInvoice();
        
        if (sampleResult.success) {
          console.log(`✅ Sample invoice created with ID: ${sampleResult.invoiceId}`);
        } else {
          console.error('❌ Failed to insert sample invoice:', sampleResult.error);
        }
      }
    } else {
      console.error('❌ Failed to set up invoice table:', tableResult.error);
    }
  } else {
    console.error('❌ Direct connection failed:', directResult.error);
    
    // Try connection pooler as fallback
    console.log('\n2. Trying connection pooler as fallback...');
    const poolerResult = await pgClient.testPoolerConnection();
    
    if (poolerResult.success) {
      console.log('✅ Pooler connection successful!');
      console.log('Please update your code to use the pooler connection instead of the direct one.');
    } else {
      console.error('❌ Pooler connection also failed:', poolerResult.error);
      console.error('\n⚠️ Please check your PostgreSQL connection settings in the .env file.');
      console.error('⚠️ Make sure your IP address is allowed in the Supabase dashboard.');
    }
  }
  
  // Exit the process
  process.exit(0);
}

testDatabaseConnection().catch(err => {
  console.error('Unhandled error during test:', err);
  process.exit(1);
}); 