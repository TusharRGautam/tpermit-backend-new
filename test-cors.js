// Test script to verify CORS configuration
const axios = require('axios');

const testUrls = [
  'http://localhost:5000/api/test',
  'http://localhost:5000/health',
  'http://localhost:5000/api/quotations/summary/cars'
];

async function testCors() {
  console.log('🧪 Testing CORS Configuration...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      
      // Test with different origins
      const origins = [
        'https://aswcars.com',
        'https://www.aswcars.com', 
        'https://backend.aswcars.com',
        'http://localhost:3000'
      ];
      
      for (const origin of origins) {
        try {
          const response = await axios.get(url, {
            headers: {
              'Origin': origin
            },
            timeout: 5000
          });
          
          console.log(`  ✅ ${origin} → Status: ${response.status}`);
          console.log(`     CORS Headers:`, {
            'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
            'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
            'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
          });
          
        } catch (error) {
          console.log(`  ❌ ${origin} → Error: ${error.message}`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ Failed to test ${url}: ${error.message}\n`);
    }
  }
  
  console.log('🎉 CORS Test Complete!');
}

// Run the test
testCors().catch(console.error); 