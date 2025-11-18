require('dotenv').config();
const { supabaseClient, supabaseAdmin } = require('./supabaseClient');
const fs = require('fs');
const path = require('path');

async function insertQuotationsData() {
  console.log('🚀 Starting quotations data insertion...\n');
  
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'quotations_rows.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL file read successfully');
    console.log(`📊 File size: ${sqlContent.length} characters\n`);
    
    // Parse the SQL INSERT statement to extract data
    const quotationsData = parseInsertStatement(sqlContent);
    
    console.log(`📋 Parsed ${quotationsData.length} quotation records`);
    console.log('🔍 Sample record preview:');
    console.log('   Car Model:', quotationsData[0]?.car_model);
    console.log('   Variant:', quotationsData[0]?.model_variant);
    console.log('   Ex-Showroom:', quotationsData[0]?.ex_showroom);
    console.log('   On-Road:', quotationsData[0]?.on_the_road);
    console.log();
    
    // Check if quotations table exists and is accessible
    console.log('🔌 Testing table connection...');
    const { data: testData, error: testError } = await supabaseAdmin
      .from('quotations')
      .select('vendor_id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Cannot access quotations table:', testError.message);
      console.log('\n💡 Please ensure:');
      console.log('   1. The quotations table exists in Supabase');
      console.log('   2. Run the create_all_tables.sql script first');
      console.log('   3. Check your Supabase credentials in .env file');
      return false;
    }
    
    console.log('✅ Table connection successful\n');
    
    // Clear existing sample data (optional)
    console.log('🧹 Removing existing sample data...');
    const { error: deleteError } = await supabaseAdmin
      .from('quotations')
      .delete()
      .eq('vendor_id', 'VENDOR-001'); // Remove the default sample record
    
    if (deleteError) {
      console.log('⚠️  Could not remove sample data:', deleteError.message);
    } else {
      console.log('✅ Sample data cleared');
    }
    
    // Insert data in batches to avoid API limits
    const batchSize = 5;
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log(`\n📥 Inserting ${quotationsData.length} records in batches of ${batchSize}...\n`);
    
    for (let i = 0; i < quotationsData.length; i += batchSize) {
      const batch = quotationsData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(quotationsData.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);
      
      try {
        const { data, error } = await supabaseAdmin
          .from('quotations')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Batch ${batchNumber} failed:`, error.message);
          errorCount += batch.length;
          errors.push({ batch: batchNumber, error: error.message, records: batch.length });
        } else {
          console.log(`✅ Batch ${batchNumber} inserted successfully`);
          successCount += batch.length;
        }
        
        // Small delay between batches to be API-friendly
        if (i + batchSize < quotationsData.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (err) {
        console.error(`❌ Batch ${batchNumber} exception:`, err.message);
        errorCount += batch.length;
        errors.push({ batch: batchNumber, error: err.message, records: batch.length });
      }
    }
    
    // Summary report
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
    
    // Verify final count
    console.log('\n🔍 Verifying final record count...');
    const { data: finalCount, error: countError } = await supabaseAdmin
      .from('quotations')
      .select('vendor_id', { count: 'exact' });
    
    if (countError) {
      console.error('❌ Could not verify record count:', countError.message);
    } else {
      console.log(`📋 Total records in quotations table: ${finalCount?.length || 0}`);
    }
    
    return successCount > 0;
    
  } catch (error) {
    console.error('💥 Insertion failed:', error.message);
    return false;
  }
}

function parseInsertStatement(sqlContent) {
  try {
    // Extract the VALUES part from the INSERT statement
    const valuesMatch = sqlContent.match(/VALUES\s+(.+)/s);
    if (!valuesMatch) {
      throw new Error('Could not find VALUES clause in SQL');
    }
    
    const valuesString = valuesMatch[1];
    
    // Split by '), (' to get individual records
    const recordStrings = valuesString.split(/\),\s*\(/);
    
    // Clean up first and last records
    recordStrings[0] = recordStrings[0].replace(/^\(/, '');
    recordStrings[recordStrings.length - 1] = recordStrings[recordStrings.length - 1].replace(/\);?\s*$/, '');
    
    const quotations = [];
    
    recordStrings.forEach((recordString, index) => {
      try {
        // Parse individual record values
        const values = parseRecordValues(recordString);
        
        // Map to database structure
        const quotation = {
          vendor_id: values[0],
          car_model: values[1],
          model_variant: values[2],
          roi_emi_interest: parseFloat(values[3]),
          sbi_bank: parseFloat(values[4]) || null,
          union_bank: parseFloat(values[5]) || null,
          indusind_bank: parseFloat(values[6]) || null,
          au_bank: parseFloat(values[7]) || null,
          ex_showroom: parseFloat(values[8]),
          tcs: parseFloat(values[9]) || null,
          registration: parseFloat(values[10]) || null,
          insurance: parseFloat(values[11]) || null,
          number_plate_crtm_autocard: parseFloat(values[12]) || null,
          gps: parseFloat(values[13]) || null,
          fastag: parseFloat(values[14]) || null,
          speed_governor: parseFloat(values[15]) || null,
          accessories: parseFloat(values[16]) || null,
          on_the_road: parseFloat(values[17]),
          loan_amount: parseFloat(values[18]) || null,
          margin_down_payment: parseFloat(values[19]) || null,
          process_fee: parseFloat(values[20]) || null,
          stamp_duty: parseFloat(values[21]) || null,
          handling_document_charge: parseFloat(values[22]) || null,
          loan_suraksha_insurance: parseFloat(values[23]) || null,
          down_payment: parseFloat(values[24]) || null,
          offers: parseFloat(values[25]) || null,
          final_down_payment: parseFloat(values[26]) || null,
          emi_years: parseInt(values[27]) || null,
          monthly_emi: parseFloat(values[28]) || null,
          created_at: values[29],
          updated_at: values[30]
        };
        
        quotations.push(quotation);
        
      } catch (recordError) {
        console.warn(`⚠️  Skipping record ${index + 1}: ${recordError.message}`);
      }
    });
    
    return quotations;
    
  } catch (error) {
    throw new Error(`Failed to parse SQL: ${error.message}`);
  }
}

function parseRecordValues(recordString) {
  const values = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < recordString.length; i++) {
    const char = recordString[i];
    
    if (!inQuotes && (char === "'" || char === '"')) {
      inQuotes = true;
      quoteChar = char;
      continue;
    }
    
    if (inQuotes && char === quoteChar) {
      // Check for escaped quotes
      if (recordString[i + 1] === quoteChar) {
        current += char;
        i++; // Skip next quote
        continue;
      } else {
        inQuotes = false;
        continue;
      }
    }
    
    if (!inQuotes && char === ',') {
      values.push(current.trim());
      current = '';
      continue;
    }
    
    current += char;
  }
  
  // Add the last value
  if (current.trim()) {
    values.push(current.trim());
  }
  
  return values;
}

// Show preview of data before insertion
async function previewData() {
  console.log('👀 PREVIEW MODE - Data Analysis\n');
  
  try {
    const sqlContent = fs.readFileSync(path.join(__dirname, 'quotations_rows.sql'), 'utf8');
    const quotationsData = parseInsertStatement(sqlContent);
    
    console.log(`📊 Total Records: ${quotationsData.length}`);
    console.log('\n🚗 Car Models Found:');
    const models = [...new Set(quotationsData.map(q => q.car_model))];
    models.forEach(model => {
      const count = quotationsData.filter(q => q.car_model === model).length;
      console.log(`   • ${model}: ${count} variants`);
    });
    
    console.log('\n💰 Price Range:');
    const prices = quotationsData.map(q => q.ex_showroom).filter(p => p > 0);
    console.log(`   • Min Ex-Showroom: ₹${Math.min(...prices).toLocaleString()}`);
    console.log(`   • Max Ex-Showroom: ₹${Math.max(...prices).toLocaleString()}`);
    
    console.log('\n📋 Sample Records:');
    quotationsData.slice(0, 3).forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.car_model} ${q.model_variant} - ₹${q.ex_showroom?.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ Preview failed:', error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--preview')) {
    await previewData();
  } else {
    const success = await insertQuotationsData();
    process.exit(success ? 0 : 1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { insertQuotationsData, previewData };