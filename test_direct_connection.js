require('dotenv').config();
const https = require('https');

// Test direct connection to Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing direct connection to Supabase...');
console.log(`URL: ${supabaseUrl}`);
console.log(`Service Role Key: ${supabaseKey ? 'Present' : 'Missing'}`);

// Test the REST API endpoint
const urlObj = new URL(supabaseUrl);

const options = {
  hostname: urlObj.hostname,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  }
};

console.log('\nMaking direct HTTPS request...');

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Direct connection successful!');
      
      // Now try to create tables using SQL
      console.log('\nTrying to execute SQL...');
      createTablesWithSQL();
    } else {
      console.log('❌ Connection failed with status:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
});

req.end();

async function createTablesWithSQL() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create_all_tables.sql'), 'utf8');
    
    // Split into individual statements (basic approach)
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Try to execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement.length === 0) continue;
      
      console.log(`\nExecuting statement ${i + 1}...`);
      console.log(statement.substring(0, 100) + '...');
      
      const success = await executeSQLStatement(statement);
      if (!success) {
        console.log(`❌ Failed to execute statement ${i + 1}`);
        break;
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
  } catch (error) {
    console.error('Error reading SQL file:', error.message);
  }
}

function executeSQLStatement(sql) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: new URL(supabaseUrl).hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(true);
        } else {
          console.log(`Status: ${res.statusCode}, Response: ${data}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error.message);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}