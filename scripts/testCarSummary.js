const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testCarSummaryEndpoint() {
  try {
    console.log('🧪 Testing Car Summary Endpoint...');
    console.log(`Requesting: ${API_BASE_URL}/quotations/summary/cars`);
    
    const response = await axios.get(`${API_BASE_URL}/quotations/summary/cars`, {
      timeout: 10000
    });
    
    console.log('\n✅ Response Status:', response.status);
    console.log('✅ Response Headers:', response.headers['content-type']);
    
    const carSummaries = response.data;
    console.log(`\n📊 Found ${carSummaries.length} car summaries:`);
    
    carSummaries.forEach((car, index) => {
      console.log(`\n${index + 1}. ${car.name}`);
      console.log(`   ID: ${car.id}`);
      console.log(`   Image: ${car.image}`);
      console.log(`   ${car.downPayment}`);
      console.log(`   Variants: ${car.variants.length}`);
      car.variants.forEach(variant => {
        console.log(`     - ${variant.name} (${variant.colors.length} colors: ${variant.colors.join(', ')})`);
      });
      if (car.bestQuotation) {
        console.log(`   Best Offer: ₹${car.bestQuotation.final_down_payment.toLocaleString('en-IN')} down payment`);
        console.log(`   On-Road Price: ₹${car.bestQuotation.on_the_road.toLocaleString('en-IN')}`);
        console.log(`   Monthly EMI: ₹${car.bestQuotation.monthly_emi.toLocaleString('en-IN')}`);
      }
    });
    
    console.log('\n🎉 Car Summary Endpoint Test Passed!');
    
  } catch (error) {
    console.error('\n❌ Error testing car summary endpoint:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Server is not running. Please start the backend server first with: npm start');
    } else if (error.response) {
      console.error('📄 Response Status:', error.response.status);
      console.error('📄 Response Data:', error.response.data);
    }
  }
}

// Test individual quotation endpoint as well
async function testQuotationEndpoints() {
  try {
    console.log('\n🧪 Testing Individual Quotation Endpoints...');
    
    // Test get all quotations
    const allQuotationsResponse = await axios.get(`${API_BASE_URL}/quotations`);
    console.log(`✅ Total quotations in database: ${allQuotationsResponse.data.length}`);
    
    if (allQuotationsResponse.data.length > 0) {
      const firstQuotation = allQuotationsResponse.data[0];
      console.log(`✅ Sample quotation: ${firstQuotation.vendor_id} - ${firstQuotation.car_model} ${firstQuotation.model_variant}`);
      
      // Test get single quotation
      const singleQuotationResponse = await axios.get(`${API_BASE_URL}/quotations/${firstQuotation.vendor_id}`);
      console.log(`✅ Individual quotation fetch: ${singleQuotationResponse.data.vendor_id}`);
    }
    
    console.log('🎉 Quotation Endpoints Test Passed!');
    
  } catch (error) {
    console.error('❌ Error testing quotation endpoints:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting ASW Backend API Tests...\n');
  
  await testCarSummaryEndpoint();
  await testQuotationEndpoints();
  
  console.log('\n✨ All tests completed!');
}

main(); 