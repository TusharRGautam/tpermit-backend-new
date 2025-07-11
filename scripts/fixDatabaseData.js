const { supabaseAdmin } = require('../supabaseClient');
const { seedQuotationData, carQuotationData, bankRates } = require('./seedQuotationData');

async function fixDatabaseData() {
  try {
    console.log('🧹 Starting database cleanup and fix...\n');

    // Step 1: Clear existing quotations table
    console.log('1. Clearing existing quotations...');
    const { error: deleteError } = await supabaseAdmin
      .from('quotations')
      .delete()
      .neq('vendor_id', 'dummy'); // This will delete all records

    if (deleteError) {
      console.error('Error clearing quotations:', deleteError);
    } else {
      console.log('✅ Cleared all existing quotations\n');
    }

    // Step 2: Verify approved car variants
    console.log('2. Approved car variants to be seeded:');
    Object.entries(carQuotationData).forEach(([carModel, variants]) => {
      console.log(`   ${carModel}:`);
      Object.keys(variants).forEach(variant => {
        console.log(`     - ${variant}`);
      });
    });
    console.log('');

    // Step 3: Reseed with correct data
    console.log('3. Reseeding database with approved variants...');
    await seedQuotationData();
    console.log('✅ Database reseeded successfully\n');

    // Step 4: Verify the seeded data
    console.log('4. Verifying seeded data...');
    const { data: quotations, error: fetchError } = await supabaseAdmin
      .from('quotations')
      .select('car_model, model_variant')
      .order('car_model', { ascending: true });

    if (fetchError) {
      console.error('Error fetching verification data:', fetchError);
      return;
    }

    // Group by car model for verification
    const verificationData = {};
    quotations.forEach(q => {
      if (!verificationData[q.car_model]) {
        verificationData[q.car_model] = new Set();
      }
      verificationData[q.car_model].add(q.model_variant);
    });

    console.log('Database now contains:');
    Object.entries(verificationData).forEach(([carModel, variants]) => {
      console.log(`   ${carModel}:`);
      Array.from(variants).forEach(variant => {
        console.log(`     - ${variant}`);
      });
    });

    console.log('\n🎉 Database fix completed successfully!');
    console.log('🚀 The website should now display only approved car variants without duplicates.');

  } catch (error) {
    console.error('❌ Error fixing database:', error);
    throw error;
  }
}

// Run the fix if this file is executed directly
if (require.main === module) {
  fixDatabaseData()
    .then(() => {
      console.log('\n✅ Database fix completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database fix failed:', error);
      process.exit(1);
    });
}

module.exports = {
  fixDatabaseData
}; 