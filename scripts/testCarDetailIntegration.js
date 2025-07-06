const SupabaseQuotation = require('../models/SupabaseQuotation');
const quotationService = new SupabaseQuotation();

async function testCarDetailIntegration() {
  console.log('🚀 Testing Car Detail Integration...\n');

  try {
    console.log('1. Testing quotation service...');
    const allQuotations = await quotationService.getAll();
    console.log(`✅ Found ${allQuotations.length} quotations in database\n`);

    // Test car model filtering - Updated with final car model names
    const testCarModels = [
      'Maruti Suzuki Wagon-R',
      'Maruti Suzuki ERTIGA',
      'TOYOTA RUMION',
      'HYUNDAI AURA',
      'Maruti Suzuki Dzire',
      'Toyota Innova Crysta'
    ];

    console.log('2. Testing car model filtering...');
    for (const carModel of testCarModels) {
      const carQuotations = allQuotations.filter(q => q.car_model === carModel);
      console.log(`   ${carModel}: ${carQuotations.length} quotations`);
      
      if (carQuotations.length > 0) {
        // Show variant details
        const variants = [...new Set(carQuotations.map(q => q.model_variant))];
        console.log(`     Variants: ${variants.join(', ')}`);
        
        // Show bank availability
        const banks = [];
        if (carQuotations.some(q => q.sbi_bank > 0)) banks.push('SBI');
        if (carQuotations.some(q => q.union_bank > 0)) banks.push('Union');
        if (carQuotations.some(q => q.indusind_bank > 0)) banks.push('IndusInd');
        if (carQuotations.some(q => q.au_bank > 0)) banks.push('AU');
        console.log(`     Banks: ${banks.join(', ')}\n`);
      }
    }

    console.log('3. Testing car ID mapping...');
    const carIdMap = {
      'maruti-suzuki-wagon-r': 'Maruti Suzuki Wagon-R',
      'wagnor': 'Maruti Suzuki Wagon-R',
      'maruti-suzuki-ertiga': 'Maruti Suzuki ERTIGA',
      'ertiga': 'Maruti Suzuki ERTIGA',
      'toyota-rumion': 'TOYOTA RUMION',
      'rumion': 'TOYOTA RUMION',
      'hyundai-aura': 'HYUNDAI AURA',
      'aura': 'HYUNDAI AURA',
      'maruti-suzuki-dzire': 'Maruti Suzuki Dzire',
      'dzire': 'Maruti Suzuki Dzire',
      'toyota-innova-crysta': 'Toyota Innova Crysta',
      'crysta': 'Toyota Innova Crysta'
    };

    for (const [carId, carModel] of Object.entries(carIdMap)) {
      const quotations = allQuotations.filter(q => q.car_model === carModel);
      const status = quotations.length > 0 ? '✅' : '❌';
      console.log(`   ${status} ${carId} -> ${carModel}: ${quotations.length} quotations`);
    }

    console.log('\n4. Testing sample data conversion...');
    const sampleQuotation = allQuotations[0];
    if (sampleQuotation) {
      console.log('Sample quotation data:');
      console.log('   Car Model:', sampleQuotation.car_model);
      console.log('   Variant:', sampleQuotation.model_variant);
      console.log('   Ex-showroom:', `₹${sampleQuotation.ex_showroom.toLocaleString('en-IN')}`);
      console.log('   Final Down Payment:', `₹${sampleQuotation.final_down_payment.toLocaleString('en-IN')}`);
      console.log('   Monthly EMI:', `₹${Math.round(sampleQuotation.monthly_emi).toLocaleString('en-IN')}`);
      console.log('   ROI:', `${sampleQuotation.roi_emi_interest}%`);
    }

    console.log('\n🎉 Integration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Database contains ${allQuotations.length} quotations`);
    console.log(`   - ${testCarModels.filter(model => allQuotations.some(q => q.car_model === model)).length}/${testCarModels.length} car models have data`);
    console.log('   - Car navigation should work properly');
    console.log('   - CarDetailWithInvoices component will display real data');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

testCarDetailIntegration(); 