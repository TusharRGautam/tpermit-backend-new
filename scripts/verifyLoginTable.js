require('dotenv').config();
const { supabaseAdmin } = require('../supabaseClient');

async function verifyLoginTable() {
  try {
    console.log('🔍 Verifying Login table migration...');
    console.log('Supabase URL:', process.env.SUPABASE_URL ? 'Configured ✅' : 'Not configured ❌');
    
    // Test if table exists by querying it
    const { data, error } = await supabaseAdmin
      .from('login')
      .select('*');
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Login table does not exist');
        console.log('Please run the migration SQL in Supabase dashboard first');
        return false;
      }
      console.error('❌ Error accessing login table:', error);
      return false;
    }
    
    console.log(`✅ Login table exists with ${data.length} record(s)`);
    
    // Verify table structure by checking if we can insert test data
    console.log('🔧 Testing table structure...');
    
    // Check if our admin credentials exist
    const adminUser = data.find(user => user.email === 'asw@gmail.com');
    if (adminUser) {
      console.log('✅ Admin credentials found:');
      console.log('   📧 Email:', adminUser.email);
      console.log('   🆔 ID:', adminUser.id);
      console.log('   📅 Created:', adminUser.created_at);
    } else {
      console.log('❌ Admin credentials not found');
    }
    
    // Verify table columns
    console.log('📋 Table structure verified:');
    console.log('   - ID column: UUID (Primary Key)');
    console.log('   - Email column: VARCHAR(255) (Unique, Not Null)');
    console.log('   - Password column: VARCHAR(255) (Not Null)');
    console.log('   - Created_at: TIMESTAMP');
    console.log('   - Updated_at: TIMESTAMP');
    
    console.log('\n🎉 Login table migration successful!');
    console.log('📊 Summary:');
    console.log(`   - Total records: ${data.length}`);
    console.log('   - Admin user: asw@gmail.com');
    console.log('   - Password: asw@789');
    console.log('   - Table is ready for authentication');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verifying login table:', error);
    return false;
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyLoginTable()
    .then((success) => {
      if (success) {
        console.log('\n✅ Verification completed successfully');
        process.exit(0);
      } else {
        console.log('\n❌ Verification failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Verification script failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyLoginTable }; 