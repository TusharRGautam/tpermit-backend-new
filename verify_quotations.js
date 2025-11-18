require('dotenv').config();
const { supabaseAdmin } = require('./supabaseClient');

async function verifyQuotations() {
  console.log('🔍 Verifying quotations data...\n');
  
  try {
    // Get total count
    const { data: allRecords, error: countError } = await supabaseAdmin
      .from('quotations')
      .select('*');
    
    if (countError) {
      console.error('❌ Error fetching quotations:', countError.message);
      return false;
    }
    
    console.log(`📊 Total quotations in database: ${allRecords.length}`);
    
    // Show car model breakdown
    console.log('\n🚗 Car Models in Database:');
    const modelCounts = {};
    allRecords.forEach(record => {
      modelCounts[record.car_model] = (modelCounts[record.car_model] || 0) + 1;
    });
    
    Object.entries(modelCounts).forEach(([model, count]) => {
      console.log(`   • ${model}: ${count} variants`);
    });
    
    // Show price range
    const prices = allRecords.map(r => r.ex_showroom).filter(p => p > 0);
    console.log('\n💰 Price Range:');
    console.log(`   • Minimum: ₹${Math.min(...prices).toLocaleString()}`);
    console.log(`   • Maximum: ₹${Math.max(...prices).toLocaleString()}`);
    console.log(`   • Average: ₹${Math.round(prices.reduce((a,b) => a+b, 0)/prices.length).toLocaleString()}`);
    
    // Show sample records
    console.log('\n📋 Sample Records:');
    allRecords.slice(0, 5).forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.car_model} ${record.model_variant}`);
      console.log(`      Ex-Showroom: ₹${record.ex_showroom?.toLocaleString()}, On-Road: ₹${record.on_the_road?.toLocaleString()}`);
      console.log(`      EMI: ₹${record.monthly_emi?.toLocaleString()} for ${record.emi_years} years`);
      console.log();
    });
    
    // Verify specific records
    const testVendorIds = ['V-1753189677363-326qfh', 'V-1753361327548-lsghbx', 'V-1753362699535-78kjbj'];
    console.log('🔍 Verifying specific records:');
    
    for (const vendorId of testVendorIds) {
      const record = allRecords.find(r => r.vendor_id === vendorId);
      if (record) {
        console.log(`   ✅ ${vendorId}: ${record.car_model} ${record.model_variant}`);
      } else {
        console.log(`   ❌ ${vendorId}: Not found`);
      }
    }
    
    console.log('\n🎉 Quotations data verification complete!');
    console.log(`✅ All ${allRecords.length} records are successfully stored in Supabase`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

verifyQuotations()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });