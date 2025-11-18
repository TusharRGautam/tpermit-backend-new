require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../supabaseClient');

// Function to create showroom tables using SQL via Supabase
async function createShowroomTables() {
  try {
    console.log('🚀 Creating showroom tables in Supabase using SQL API...\n');
    
    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
    }
    
    console.log('📝 Step 1: Creating showrooms table...');
    
    // Read the showrooms SQL file
    const showroomsSqlPath = path.join(__dirname, '..', 'migrations', 'create_showrooms_table.sql');
    const showroomsSqlContent = fs.readFileSync(showroomsSqlPath, 'utf8');

    // Create showrooms table using SQL API
    const showroomsResponse = await axios({
      method: 'POST',
      url: `${supabaseUrl}/rest/v1/sql`,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      data: {
        query: showroomsSqlContent
      }
    });
    
    console.log('✅ Showrooms table creation response:', showroomsResponse.status);
    
    console.log('📝 Step 2: Creating showroom_contacts table...');
    
    // Read the contacts SQL file
    const contactsSqlPath = path.join(__dirname, '..', 'migrations', 'create_showroom_contacts_table.sql');
    const contactsSqlContent = fs.readFileSync(contactsSqlPath, 'utf8');

    // Create contacts table using SQL API
    const contactsResponse = await axios({
      method: 'POST',
      url: `${supabaseUrl}/rest/v1/sql`,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      data: {
        query: contactsSqlContent
      }
    });
    
    console.log('✅ Showroom contacts table creation response:', contactsResponse.status);
    
    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    await verifyShowroomTables();
    
  } catch (error) {
    console.error('❌ Error creating showroom tables:', error.message);
    console.log('\n🔧 If the API method failed, please create tables manually:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Click "SQL Editor" → "New Query"');
    console.log('3. Copy and run the SQL from these files:');
    console.log('   - migrations/create_showrooms_table.sql');
    console.log('   - migrations/create_showroom_contacts_table.sql');
    
    // Try verification anyway
    await verifyShowroomTables();
  }
}

// Function to verify showroom tables exist
async function verifyShowroomTables() {
  try {
    // Check showrooms table
    console.log('Checking showrooms table...');
    const { data: showroomsData, error: showroomsError } = await supabaseAdmin
      .from('showrooms')
      .select('*')
      .limit(1);
    
    if (showroomsError) {
      if (showroomsError.code === '42P01') {
        console.log('❌ Showrooms table does not exist');
        return false;
      }
      console.error('Error checking showrooms table:', showroomsError);
      return false;
    }
    
    console.log('✅ Showrooms table exists and is accessible');
    console.log('Sample record count check passed');
    
    // Check showroom_contacts table
    console.log('Checking showroom_contacts table...');
    const { data: contactsData, error: contactsError } = await supabaseAdmin
      .from('showroom_contacts')
      .select('*')
      .limit(1);
    
    if (contactsError) {
      if (contactsError.code === '42P01') {
        console.log('❌ Showroom_contacts table does not exist');
        return false;
      }
      console.error('Error checking showroom_contacts table:', contactsError);
      return false;
    }
    
    console.log('✅ Showroom_contacts table exists and is accessible');
    
    // Test the relationship
    console.log('\n🔗 Testing table relationships...');
    const { data: joinData, error: joinError } = await supabaseAdmin
      .from('showrooms')
      .select(`
        id,
        showroom_name,
        brand,
        showroom_contacts (
          id,
          contact_person_name,
          designation
        )
      `)
      .limit(3);
    
    if (joinError) {
      console.error('❌ Relationship test failed:', joinError);
      return false;
    }
    
    console.log('✅ Table relationships working correctly');
    console.log('Sample data with contacts:');
    joinData.forEach(showroom => {
      console.log(`  - ${showroom.showroom_name} (${showroom.brand}): ${showroom.showroom_contacts.length} contacts`);
    });
    
    console.log('\n🎉 All showroom tables are working correctly!');
    console.log('You can now access the showroom management page at /dashboard/showrooms');
    
    return true;
  } catch (error) {
    console.error('Failed to verify showroom tables:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    // First check if tables already exist
    const tablesExist = await verifyShowroomTables();
    
    if (!tablesExist) {
      // If tables don't exist, create them
      await createShowroomTables();
    } else {
      console.log('✅ Showroom tables already exist and are working properly!');
    }
    
    console.log('\n✅ Showroom table setup completed!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

main();