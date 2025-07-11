const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testDatabaseFix() {
  try {
    console.log('🧪 Testing Database Fix Results...\n');

    // Test the car summary endpoint
    console.log(`📡 Fetching car summaries from: ${API_BASE_URL}/quotations/summary/cars`);
    
    const response = await axios.get(`${API_BASE_URL}/quotations/summary/cars`, {
      timeout: 10000
    });

    console.log(`✅ Status: ${response.status}\n`);

    const carSummaries = response.data;
    console.log(`📊 Found ${carSummaries.length} car models:\n`);

    // Define approved variants for verification
    const approvedVariants = {
      'Maruti Suzuki Wagon-R': ['H3 CNG', 'LXI CNG', 'VXI CNG'],
      'Maruti Suzuki ERTIGA': ['Tour M CNG 1.5 MT', 'VXI CNG 1.5 MT', 'ZXI CNG 1.5 MT'],
      'TOYOTA RUMION': ['S CNG 1.5 MT'],
      'HYUNDAI AURA': ['E CNG', 'S CNG', 'SX CNG'],
      'Maruti Suzuki Dzire': ['Tour\'s CNG'],
      'Toyota Innova Crysta': ['GX', 'GX+', 'VX', 'ZX']
    };

    let allCorrect = true;
    let duplicateErtiga = false;
    let ertigaCount = 0;

    carSummaries.forEach((car, index) => {
      console.log(`${index + 1}. ${car.name} (ID: ${car.id})`);
      console.log(`   Down Payment: ${car.downPayment}`);
      console.log(`   Monthly EMI: ${car.monthlyEmi}`);
      console.log(`   Variants: ${car.variants.length}`);

      // Check for duplicate Ertiga
      if (car.name.toLowerCase().includes('ertiga')) {
        ertigaCount++;
      }

      // Check if variants match approved list
      const expectedVariants = approvedVariants[car.name];
      if (expectedVariants) {
        const actualVariants = car.variants.map(v => v.name);
        const hasCorrectVariants = expectedVariants.every(expected => 
          actualVariants.includes(expected)
        );
        const hasOnlyCorrectVariants = actualVariants.every(actual => 
          expectedVariants.includes(actual)
        );

        if (hasCorrectVariants && hasOnlyCorrectVariants) {
          console.log(`   ✅ Variants are correct:`);
        } else {
          console.log(`   ❌ Variants are incorrect:`);
          allCorrect = false;
        }
      } else {
        console.log(`   ⚠️  Car not in approved list:`);
        allCorrect = false;
      }

      car.variants.forEach(variant => {
        console.log(`     - ${variant.name} (${variant.colors.length} colors)`);
      });
      console.log('');
    });

    // Check for duplicate Ertiga
    if (ertigaCount > 1) {
      duplicateErtiga = true;
      console.log(`❌ DUPLICATE ERTIGA DETECTED: Found ${ertigaCount} Ertiga entries!\n`);
    } else {
      console.log(`✅ No duplicate Ertiga entries found\n`);
    }

    // Final verification
    console.log('🔍 VERIFICATION RESULTS:');
    console.log(`   Total car models: ${carSummaries.length}`);
    console.log(`   Expected car models: ${Object.keys(approvedVariants).length}`);
    console.log(`   Duplicate Ertiga: ${duplicateErtiga ? 'YES ❌' : 'NO ✅'}`);
    console.log(`   All variants correct: ${allCorrect ? 'YES ✅' : 'NO ❌'}`);

    if (!duplicateErtiga && allCorrect && carSummaries.length === Object.keys(approvedVariants).length) {
      console.log('\n🎉 DATABASE FIX SUCCESSFUL!');
      console.log('   - No duplicate Ertiga entries');
      console.log('   - All variants match approved list');
      console.log('   - Correct number of car models');
      console.log('\n🚀 The website should now display correctly!');
    } else {
      console.log('\n❌ DATABASE FIX ISSUES DETECTED:');
      if (duplicateErtiga) {
        console.log('   - Multiple Ertiga entries found');
      }
      if (!allCorrect) {
        console.log('   - Some variants don\'t match approved list');
      }
      if (carSummaries.length !== Object.keys(approvedVariants).length) {
        console.log('   - Incorrect number of car models');
      }
      console.log('\n🔧 Please run the database fix script again.');
    }

  } catch (error) {
    console.error('\n❌ Error testing database fix:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Backend server is not running. Please start it first with: npm start');
    } else if (error.response) {
      console.error('📄 Response Status:', error.response.status);
      console.error('📄 Response Data:', error.response.data);
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseFix()
    .then(() => {
      console.log('\n✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testDatabaseFix
}; 