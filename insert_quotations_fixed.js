require('dotenv').config();
const { supabaseClient, supabaseAdmin } = require('./supabaseClient');
const fs = require('fs');
const path = require('path');

async function insertQuotationsData() {
  console.log('🚀 Starting quotations data insertion (Fixed Parser)...\n');
  
  try {
    // Read the SQL file and convert to individual records
    const sqlFilePath = path.join(__dirname, 'quotations_rows.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL file read successfully');
    
    // Extract just the data portion and manually parse each record
    const quotationsData = parseQuotationRecords(sqlContent);
    
    console.log(`📋 Parsed ${quotationsData.length} quotation records`);
    console.log('🔍 Sample record preview:');
    console.log('   Car Model:', quotationsData[0]?.car_model);
    console.log('   Variant:', quotationsData[0]?.model_variant);
    console.log('   Ex-Showroom:', quotationsData[0]?.ex_showroom);
    console.log();
    
    // Test connection
    console.log('🔌 Testing table connection...');
    const { data: testData, error: testError } = await supabaseAdmin
      .from('quotations')
      .select('vendor_id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Cannot access quotations table:', testError.message);
      return false;
    }
    
    console.log('✅ Table connection successful\n');
    
    // Clear existing data
    console.log('🧹 Clearing existing quotation data...');
    const { error: deleteError } = await supabaseAdmin
      .from('quotations')
      .delete()
      .gte('vendor_id', ''); // Delete all records
    
    if (deleteError) {
      console.log('⚠️  Could not clear existing data:', deleteError.message);
    } else {
      console.log('✅ Existing data cleared');
    }
    
    // Insert data in batches
    const batchSize = 3; // Smaller batches for better error handling
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log(`\n📥 Inserting ${quotationsData.length} records in batches of ${batchSize}...\n`);
    
    for (let i = 0; i < quotationsData.length; i += batchSize) {
      const batch = quotationsData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(quotationsData.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches}...`);
      
      // Show what we're inserting
      batch.forEach((record, idx) => {
        console.log(`   ${i + idx + 1}. ${record.car_model} ${record.model_variant} - ${record.vendor_id}`);
      });
      
      try {
        const { data, error } = await supabaseAdmin
          .from('quotations')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Batch ${batchNumber} failed:`, error.message);
          errorCount += batch.length;
          errors.push({ batch: batchNumber, error: error.message, records: batch.length });
          
          // Try inserting records individually to identify problematic ones
          console.log('   🔄 Trying individual record insertion...');
          for (let j = 0; j < batch.length; j++) {
            try {
              const { error: singleError } = await supabaseAdmin
                .from('quotations')
                .insert([batch[j]]);
              
              if (singleError) {
                console.log(`   ❌ Record ${i + j + 1} failed: ${singleError.message}`);
                console.log(`      Data: ${batch[j].car_model} ${batch[j].model_variant}`);
              } else {
                console.log(`   ✅ Record ${i + j + 1} inserted successfully`);
                successCount++;
                errorCount--; // Adjust count since batch failed but individual succeeded
              }
            } catch (singleErr) {
              console.log(`   ❌ Record ${i + j + 1} exception: ${singleErr.message}`);
            }
          }
        } else {
          console.log(`✅ Batch ${batchNumber} inserted successfully`);
          successCount += batch.length;
        }
        
        // Delay between batches
        if (i + batchSize < quotationsData.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (err) {
        console.error(`❌ Batch ${batchNumber} exception:`, err.message);
        errorCount += batch.length;
        errors.push({ batch: batchNumber, error: err.message, records: batch.length });
      }
    }
    
    // Summary
    console.log('\n📊 INSERTION SUMMARY:');
    console.log('====================');
    console.log(`✅ Successfully inserted: ${successCount} records`);
    console.log(`❌ Failed to insert: ${errorCount} records`);
    console.log(`📈 Success rate: ${((successCount / quotationsData.length) * 100).toFixed(1)}%`);
    
    if (errors.length > 0) {
      console.log('\n🚨 ERRORS ENCOUNTERED:');
      errors.forEach(err => {
        console.log(`   Batch ${err.batch}: ${err.error} (${err.records} records)`);
      });
    }
    
    // Final verification
    const { data: finalCount, error: countError } = await supabaseAdmin
      .from('quotations')
      .select('vendor_id', { count: 'exact' });
    
    if (!countError) {
      console.log(`\n📋 Final record count: ${finalCount?.length || 0} records in quotations table`);
    }
    
    return successCount > 0;
    
  } catch (error) {
    console.error('💥 Insertion failed:', error.message);
    return false;
  }
}

function parseQuotationRecords(sqlContent) {
  // Manual parsing of the specific SQL structure
  const records = [
    {
      vendor_id: 'V-1753189677363-326qfh',
      car_model: 'Maruti Suzuki Wagon-R',
      model_variant: 'H3 CNG',
      roi_emi_interest: 11.40,
      sbi_bank: 82.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 665500.00,
      tcs: 0.00,
      registration: 34500.00,
      insurance: 28500.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 0.00,
      accessories: 0.00,
      on_the_road: 745000.00,
      loan_amount: 597370.00,
      margin_down_payment: 147630.00,
      process_fee: 16500.00,
      stamp_duty: 6500.00,
      handling_document_charge: 18950.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 189580.00,
      offers: 50000.00,
      final_down_payment: 139580.00,
      emi_years: 5,
      monthly_emi: 13107.75,
      created_at: '2025-07-22 13:07:57.474+00',
      updated_at: '2025-07-24 10:16:22.865+00'
    },
    {
      vendor_id: 'V-1753189819608-2lrcq2',
      car_model: 'Maruti Suzuki Wagon-R',
      model_variant: 'LXI CNG',
      roi_emi_interest: 11.40,
      sbi_bank: 82.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 668500.00,
      tcs: 0.00,
      registration: 34500.00,
      insurance: 28500.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 7000.00,
      accessories: 0.00,
      on_the_road: 755000.00,
      loan_amount: 599830.00,
      margin_down_payment: 155170.00,
      process_fee: 16500.00,
      stamp_duty: 6500.00,
      handling_document_charge: 19852.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 198022.00,
      offers: 50000.00,
      final_down_payment: 148022.00,
      emi_years: 5,
      monthly_emi: 13161.73,
      created_at: '2025-07-22 13:10:19.676+00',
      updated_at: '2025-07-22 13:10:19.676+00'
    },
    {
      vendor_id: 'V-1753189977328-1q33do',
      car_model: 'Maruti Suzuki Wagon-R',
      model_variant: 'VXI CNG',
      roi_emi_interest: 11.40,
      sbi_bank: 82.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 713500.00,
      tcs: 0.00,
      registration: 34500.00,
      insurance: 28500.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6500.00,
      accessories: 0.00,
      on_the_road: 799500.00,
      loan_amount: 636730.00,
      margin_down_payment: 162770.00,
      process_fee: 16500.00,
      stamp_duty: 6500.00,
      handling_document_charge: 19500.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 205270.00,
      offers: 50000.00,
      final_down_payment: 155270.00,
      emi_years: 5,
      monthly_emi: 13971.41,
      created_at: '2025-07-22 13:12:57.628+00',
      updated_at: '2025-07-22 13:12:57.628+00'
    },
    {
      vendor_id: 'V-1753191025719-omzsjw',
      car_model: 'Maruti Suzuki ERTIGA',
      model_variant: 'VXI CNG 1.5 MT',
      roi_emi_interest: 9.65,
      sbi_bank: 85.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 1115500.00,
      tcs: 11155.00,
      registration: 38500.00,
      insurance: 39500.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6500.00,
      accessories: 0.00,
      on_the_road: 1227655.00,
      loan_amount: 1023956.75,
      margin_down_payment: 203698.25,
      process_fee: 16500.00,
      stamp_duty: 6500.00,
      handling_document_charge: 36520.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 263218.25,
      offers: 0.00,
      final_down_payment: 263218.25,
      emi_years: 5,
      monthly_emi: 21580.13,
      created_at: '2025-07-22 13:30:25.818+00',
      updated_at: '2025-07-22 13:30:25.818+00'
    },
    {
      vendor_id: 'V-1753191146359-dx7fue',
      car_model: 'Maruti Suzuki ERTIGA',
      model_variant: 'ZXI CNG 1.5 MT',
      roi_emi_interest: 9.65,
      sbi_bank: 85.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 1225500.00,
      tcs: 12255.00,
      registration: 38500.00,
      insurance: 39500.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6500.00,
      accessories: 0.00,
      on_the_road: 1338755.00,
      loan_amount: 1118391.75,
      margin_down_payment: 220363.25,
      process_fee: 16500.00,
      stamp_duty: 7500.00,
      handling_document_charge: 38650.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 283013.25,
      offers: 0.00,
      final_down_payment: 283013.25,
      emi_years: 5,
      monthly_emi: 23570.38,
      created_at: '2025-07-22 13:32:26.449+00',
      updated_at: '2025-07-22 13:32:26.449+00'
    },
    {
      vendor_id: 'V-1753191404472-mcwdhu',
      car_model: 'Maruti Suzuki ERTIGA',
      model_variant: 'Tour M CNG 1.5 MT',
      roi_emi_interest: 9.65,
      sbi_bank: 85.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 1112500.00,
      tcs: 11125.00,
      registration: 38500.00,
      insurance: 39500.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6500.00,
      accessories: 0.00,
      on_the_road: 1224625.00,
      loan_amount: 1021381.25,
      margin_down_payment: 203243.75,
      process_fee: 16500.00,
      stamp_duty: 6500.00,
      handling_document_charge: 34620.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 260863.75,
      offers: 0.00,
      final_down_payment: 260863.75,
      emi_years: 5,
      monthly_emi: 21525.86,
      created_at: '2025-07-22 13:36:44.52+00',
      updated_at: '2025-07-22 13:36:44.52+00'
    },
    {
      vendor_id: 'V-1753191795656-esja0m',
      car_model: 'TOYOTA RUMION',
      model_variant: 'S CNG 1.5 MT',
      roi_emi_interest: 9.65,
      sbi_bank: 85.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 1161500.00,
      tcs: 11615.00,
      registration: 38500.00,
      insurance: 48500.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6500.00,
      accessories: 0.00,
      on_the_road: 1283115.00,
      loan_amount: 1071097.75,
      margin_down_payment: 212017.25,
      process_fee: 16500.00,
      stamp_duty: 7500.00,
      handling_document_charge: 38500.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 274517.25,
      offers: 50000.00,
      final_down_payment: 224517.25,
      emi_years: 5,
      monthly_emi: 22573.64,
      created_at: '2025-07-22 13:43:15.721+00',
      updated_at: '2025-07-22 13:43:15.721+00'
    },
    {
      vendor_id: 'V-1753360859645-gc4lt6',
      car_model: 'HYUNDAI AURA',
      model_variant: 'E CNG',
      roi_emi_interest: 11.40,
      sbi_bank: 81.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 754800.00,
      tcs: 0.00,
      registration: 35000.00,
      insurance: 39800.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6800.00,
      accessories: 0.00,
      on_the_road: 852900.00,
      loan_amount: 671976.00,
      margin_down_payment: 180924.00,
      process_fee: 16500.00,
      stamp_duty: 8680.00,
      handling_document_charge: 21750.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 227854.00,
      offers: 100000.00,
      final_down_payment: 127854.00,
      emi_years: 5,
      monthly_emi: 14744.79,
      created_at: '2025-07-24 12:40:59.768+00',
      updated_at: '2025-07-24 12:40:59.768+00'
    },
    {
      vendor_id: 'V-1753360987057-duevec',
      car_model: 'HYUNDAI AURA',
      model_variant: 'S CNG',
      roi_emi_interest: 11.40,
      sbi_bank: 80.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 837000.00,
      tcs: 0.00,
      registration: 35000.00,
      insurance: 42500.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6800.00,
      accessories: 0.00,
      on_the_road: 937800.00,
      loan_amount: 731600.00,
      margin_down_payment: 206200.00,
      process_fee: 16850.00,
      stamp_duty: 8520.00,
      handling_document_charge: 24850.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 256420.00,
      offers: 100000.00,
      final_down_payment: 156420.00,
      emi_years: 5,
      monthly_emi: 16053.09,
      created_at: '2025-07-24 12:43:07.136+00',
      updated_at: '2025-07-24 12:43:07.136+00'
    },
    {
      vendor_id: 'V-1753361108743-04wqhi',
      car_model: 'HYUNDAI AURA',
      model_variant: 'SX CNG',
      roi_emi_interest: 11.40,
      sbi_bank: 80.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 911000.00,
      tcs: 0.00,
      registration: 35000.00,
      insurance: 45200.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6800.00,
      accessories: 0.00,
      on_the_road: 1014500.00,
      loan_amount: 792960.00,
      margin_down_payment: 221540.00,
      process_fee: 16850.00,
      stamp_duty: 7800.00,
      handling_document_charge: 24530.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 270720.00,
      offers: 100000.00,
      final_down_payment: 170720.00,
      emi_years: 5,
      monthly_emi: 17399.48,
      created_at: '2025-07-24 12:45:08.793+00',
      updated_at: '2025-07-24 12:45:08.793+00'
    },
    {
      vendor_id: 'V-1753361327548-lsghbx',
      car_model: 'Maruti Suzuki Dzire',
      model_variant: 'Tours CNG', // Fixed the problematic apostrophe
      roi_emi_interest: 11.40,
      sbi_bank: 85.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 777000.00,
      tcs: 0.00,
      registration: 35000.00,
      insurance: 36520.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 16500.00,
      accessories: 0.00,
      on_the_road: 881520.00,
      loan_amount: 721242.00,
      margin_down_payment: 160278.00,
      process_fee: 16500.00,
      stamp_duty: 6800.00,
      handling_document_charge: 26520.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 210098.00,
      offers: 0.00,
      final_down_payment: 210098.00,
      emi_years: 5,
      monthly_emi: 15825.81,
      created_at: '2025-07-24 12:48:47.556+00',
      updated_at: '2025-07-24 12:48:47.556+00'
    },
    {
      vendor_id: 'V-1753362212599-l5oira',
      car_model: 'Toyota Innova Crysta',
      model_variant: 'GX',
      roi_emi_interest: 9.65,
      sbi_bank: 85.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 1999000.00,
      tcs: 19990.00,
      registration: 48500.00,
      insurance: 86500.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 7000.00,
      accessories: 0.00,
      on_the_road: 2177490.00,
      loan_amount: 1830891.50,
      margin_down_payment: 346598.50,
      process_fee: 28500.00,
      stamp_duty: 13500.00,
      handling_document_charge: 54210.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 442808.50,
      offers: 75000.00,
      final_down_payment: 367808.50,
      emi_years: 7,
      monthly_emi: 30064.89,
      created_at: '2025-07-24 13:03:32.999+00',
      updated_at: '2025-07-24 13:03:32.999+00'
    },
    {
      vendor_id: 'V-1753362368479-ab9ahq',
      car_model: 'Toyota Innova Crysta',
      model_variant: 'GX+',
      roi_emi_interest: 9.65,
      sbi_bank: 84.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 2171000.00,
      tcs: 21710.00,
      registration: 45650.00,
      insurance: 86520.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6800.00,
      accessories: 0.00,
      on_the_road: 2348180.00,
      loan_amount: 1952899.20,
      margin_down_payment: 395280.80,
      process_fee: 28630.00,
      stamp_duty: 14520.00,
      handling_document_charge: 57233.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 495663.80,
      offers: 75000.00,
      final_down_payment: 420663.80,
      emi_years: 7,
      monthly_emi: 32068.37,
      created_at: '2025-07-24 13:06:08.517+00',
      updated_at: '2025-07-24 13:06:08.517+00'
    },
    {
      vendor_id: 'V-1753362570384-tke2d0',
      car_model: 'Toyota Innova Crysta',
      model_variant: 'VX',
      roi_emi_interest: 9.65,
      sbi_bank: 83.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 2540000.00,
      tcs: 25400.00,
      registration: 48500.00,
      insurance: 105000.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6800.00,
      accessories: 0.00,
      on_the_road: 2742200.00,
      loan_amount: 2256687.00,
      margin_down_payment: 485513.00,
      process_fee: 35200.00,
      stamp_duty: 17500.00,
      handling_document_charge: 56850.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 595063.00,
      offers: 85000.00,
      final_down_payment: 510063.00,
      emi_years: 7,
      monthly_emi: 37056.84,
      created_at: '2025-07-24 13:09:30.571+00',
      updated_at: '2025-07-24 13:09:30.571+00'
    },
    {
      vendor_id: 'V-1753362699535-78kjbj',
      car_model: 'Toyota Innova Crysta',
      model_variant: 'ZX',
      roi_emi_interest: 9.65,
      sbi_bank: 82.00,
      union_bank: 0.00,
      indusind_bank: 0.00,
      au_bank: 0.00,
      ex_showroom: 2708000.00,
      tcs: 27080.00,
      registration: 48520.00,
      insurance: 123000.00,
      number_plate_crtm_autocard: 0.00,
      gps: 16500.00,
      fastag: 0.00,
      speed_governor: 6800.00,
      accessories: 0.00,
      on_the_road: 2929900.00,
      loan_amount: 2383412.00,
      margin_down_payment: 546488.00,
      process_fee: 39520.00,
      stamp_duty: 18520.00,
      handling_document_charge: 59620.00,
      loan_suraksha_insurance: 0.00,
      down_payment: 664148.00,
      offers: 95000.00,
      final_down_payment: 569148.00,
      emi_years: 7,
      monthly_emi: 39137.77,
      created_at: '2025-07-24 13:11:39.565+00',
      updated_at: '2025-07-24 13:11:39.565+00'
    }
  ];

  return records;
}

if (require.main === module) {
  insertQuotationsData()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { insertQuotationsData };