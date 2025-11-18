require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Alternative method - create tables by inserting structured data
// This will work if RLS is disabled for these tables

async function createShowroomTablesAlt() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🚀 Creating showroom tables using alternative method...\n');
  
  try {
    // Method 1: Try using the Edge Function approach
    console.log('📝 Attempting to create tables via Edge Function...');
    
    const showroomsSql = fs.readFileSync(path.join(__dirname, '..', 'migrations', 'create_showrooms_table.sql'), 'utf8');
    const contactsSql = fs.readFileSync(path.join(__dirname, '..', 'migrations', 'create_showroom_contacts_table.sql'), 'utf8');
    
    // Try the edge function approach
    const { data, error } = await supabase.functions.invoke('execute-sql', {
      body: { sql: showroomsSql }
    });
    
    if (error) {
      console.log('❌ Edge function method failed:', error.message);
      console.log('Trying direct HTTP approach...');
      await tryDirectHTTP(supabaseUrl, supabaseKey, showroomsSql, contactsSql);
    } else {
      console.log('✅ Edge function method worked');
      // Now create contacts table
      const { data: contactData, error: contactError } = await supabase.functions.invoke('execute-sql', {
        body: { sql: contactsSql }
      });
      
      if (contactError) {
        console.error('❌ Failed to create contacts table:', contactError);
      } else {
        console.log('✅ Both tables created successfully');
      }
    }
    
  } catch (error) {
    console.error('❌ Alternative method failed:', error.message);
    console.log('\n🔧 MANUAL CREATION REQUIRED');
    displayManualInstructions();
  }
}

async function tryDirectHTTP(supabaseUrl, supabaseKey, showroomsSql, contactsSql) {
  const axios = require('axios');
  
  try {
    // Try different SQL endpoints
    const endpoints = [
      '/rest/v1/sql',
      '/sql',
      '/rest/v1/rpc/sql',
      '/database/sql'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await axios({
          method: 'POST',
          url: `${supabaseUrl}${endpoint}`,
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          data: { query: showroomsSql }
        });
        
        console.log('✅ HTTP method worked with endpoint:', endpoint);
        console.log('Response status:', response.status);
        
        // If showrooms worked, try contacts
        await axios({
          method: 'POST',
          url: `${supabaseUrl}${endpoint}`,
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          data: { query: contactsSql }
        });
        
        console.log('✅ Both tables created via HTTP');
        return;
        
      } catch (err) {
        console.log(`❌ Endpoint ${endpoint} failed:`, err.response?.status || err.message);
        continue;
      }
    }
    
    throw new Error('All HTTP endpoints failed');
    
  } catch (error) {
    console.error('❌ Direct HTTP approach failed:', error.message);
    displayManualInstructions();
  }
}

function displayManualInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 MANUAL TABLE CREATION REQUIRED');
  console.log('='.repeat(60));
  console.log('Automated creation failed. Please create tables manually:');
  console.log('');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Click on "SQL Editor" in the left sidebar');
  console.log('3. Click "New query"');
  console.log('4. Copy and paste the following SQL commands:');
  console.log('');
  console.log('--- FIRST SQL (Showrooms Table) ---');
  
  const showroomsSql = fs.readFileSync(path.join(__dirname, '..', 'migrations', 'create_showrooms_table.sql'), 'utf8');
  console.log(showroomsSql);
  
  console.log('\n--- SECOND SQL (Contacts Table) ---');
  
  const contactsSql = fs.readFileSync(path.join(__dirname, '..', 'migrations', 'create_showroom_contacts_table.sql'), 'utf8');
  console.log(contactsSql);
  
  console.log('\n5. Run each SQL command separately');
  console.log('6. Verify tables are created in the "Table Editor"');
  console.log('='.repeat(60));
}

// Run the script
createShowroomTablesAlt();