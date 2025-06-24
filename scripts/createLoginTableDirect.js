require('dotenv').config();
const { supabaseAdmin } = require('../supabaseClient');

async function createLoginTableDirect() {
  try {
    console.log('🚀 Creating Login table directly...');
    console.log('Supabase URL:', process.env.SUPABASE_URL ? 'Configured ✅' : 'Not configured ❌');
    
    // Try to insert the login record directly
    // This will fail with a clear error if the table doesn't exist
    const { data, error } = await supabaseAdmin
      .from('login')
      .insert([
        {
          email: 'asw@gmail.com',
          password: 'asw@789'
        }
      ])
      .select();
    
    if (error) {
      if (error.code === '42P01') {
        console.log('\n❌ Login table does not exist.');
        console.log('You need to create the table manually in Supabase dashboard.');
        console.log('\n📋 INSTRUCTIONS:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Click on "SQL Editor" in the left sidebar');
        console.log('3. Click "New query"');
        console.log('4. Copy and paste this SQL:');
        console.log('\n' + '='.repeat(50));
        console.log(`-- Create Login table for user authentication
CREATE TABLE IF NOT EXISTS login (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert the hardcoded credentials
INSERT INTO login (email, password) VALUES ('asw@gmail.com', 'asw@789')
ON CONFLICT (email) DO NOTHING;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_login_email ON login(email);

-- Enable Row Level Security (RLS)
ALTER TABLE login ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access (for authentication)
CREATE POLICY "Allow read access for authentication" ON login
    FOR SELECT USING (true);`);
        console.log('='.repeat(50));
        console.log('5. Click "Run" to execute the SQL');
        console.log('6. Run this script again to verify');
        
      } else if (error.code === '23505') {
        console.log('✅ Login table exists and credentials already inserted!');
        console.log('📧 Email: asw@gmail.com');
        console.log('🔐 Password: asw@789');
      } else {
        console.error('❌ Error inserting login credentials:', error);
      }
    } else {
      console.log('✅ Login table created and credentials inserted successfully!');
      console.log('📧 Email: asw@gmail.com');
      console.log('🔐 Password: asw@789');
      console.log('📊 Data:', data);
    }
    
    // Verify the table and credentials
    await verifyLoginTable();
    
  } catch (error) {
    console.error('❌ Error in createLoginTableDirect:', error);
  }
}

async function verifyLoginTable() {
  try {
    console.log('\n🔍 Verifying Login table...');
    
    const { data, error } = await supabaseAdmin
      .from('login')
      .select('*');
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Login table does not exist');
        return false;
      }
      console.error('❌ Error verifying table:', error);
      return false;
    }
    
    console.log(`✅ Login table verified with ${data.length} record(s)`);
    
    // Check if our credentials exist
    const aswUser = data.find(user => user.email === 'asw@gmail.com');
    if (aswUser) {
      console.log('✅ ASW admin credentials verified in database:');
      console.log('   📧 Email: asw@gmail.com');
      console.log('   🆔 ID:', aswUser.id);
      console.log('   📅 Created:', aswUser.created_at);
      console.log('\n🎉 Login system is ready to use!');
      return true;
    } else {
      console.log('❌ ASW admin credentials not found in database');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error verifying Login table:', error);
    return false;
  }
}

// Run the script
if (require.main === module) {
  createLoginTableDirect()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createLoginTableDirect, verifyLoginTable }; 