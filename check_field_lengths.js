require('dotenv').config();
const fs = require('fs');
const path = require('path');

function parseInsertStatement(sqlContent) {
  try {
    const valuesMatch = sqlContent.match(/VALUES\s+(.+)/s);
    if (!valuesMatch) {
      throw new Error('Could not find VALUES clause in SQL');
    }
    
    const valuesString = valuesMatch[1];
    const recordStrings = valuesString.split(/\),\s*\(/);
    
    recordStrings[0] = recordStrings[0].replace(/^\(/, '');
    recordStrings[recordStrings.length - 1] = recordStrings[recordStrings.length - 1].replace(/\);?\s*$/, '');
    
    const quotations = [];
    
    recordStrings.forEach((recordString, index) => {
      try {
        const values = parseRecordValues(recordString);
        
        const quotation = {
          vendor_id: values[0],
          car_model: values[1],
          model_variant: values[2],
          roi_emi_interest: values[3],
          recordIndex: index + 1
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
      if (recordString[i + 1] === quoteChar) {
        current += char;
        i++;
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
  
  if (current.trim()) {
    values.push(current.trim());
  }
  
  return values;
}

async function checkFieldLengths() {
  console.log('🔍 Checking field lengths in quotations data...\n');
  
  try {
    const sqlContent = fs.readFileSync(path.join(__dirname, 'quotations_rows.sql'), 'utf8');
    const quotationsData = parseInsertStatement(sqlContent);
    
    console.log(`📊 Analyzing ${quotationsData.length} records...\n`);
    
    let hasIssues = false;
    
    quotationsData.forEach(record => {
      const issues = [];
      
      // Check car_model length (VARCHAR(100))
      if (record.car_model && record.car_model.length > 100) {
        issues.push(`car_model: ${record.car_model.length} chars (>${100})`);
      }
      
      // Check model_variant length (VARCHAR(100))  
      if (record.model_variant && record.model_variant.length > 100) {
        issues.push(`model_variant: ${record.model_variant.length} chars (>${100})`);
      }
      
      if (issues.length > 0) {
        hasIssues = true;
        console.log(`❌ Record ${record.recordIndex} (${record.vendor_id}):`);
        console.log(`   Car Model: "${record.car_model}" (${record.car_model.length} chars)`);
        console.log(`   Variant: "${record.model_variant}" (${record.model_variant.length} chars)`);
        console.log(`   Issues: ${issues.join(', ')}`);
        console.log();
      }
    });
    
    if (!hasIssues) {
      console.log('✅ All field lengths are within limits!');
      console.log('\n📏 Field length summary:');
      
      const carModelLengths = quotationsData.map(r => r.car_model.length);
      const variantLengths = quotationsData.map(r => r.model_variant.length);
      
      console.log(`   Car Model: Max ${Math.max(...carModelLengths)} chars, Avg ${Math.round(carModelLengths.reduce((a,b) => a+b, 0)/carModelLengths.length)} chars`);
      console.log(`   Variant: Max ${Math.max(...variantLengths)} chars, Avg ${Math.round(variantLengths.reduce((a,b) => a+b, 0)/variantLengths.length)} chars`);
    } else {
      console.log('🚨 Found field length issues! Need to update table schema or truncate data.');
    }
    
    // Show all unique values for debugging
    console.log('\n📋 All Car Models:');
    const uniqueModels = [...new Set(quotationsData.map(r => r.car_model))];
    uniqueModels.forEach(model => {
      console.log(`   "${model}" (${model.length} chars)`);
    });
    
    console.log('\n📋 All Variants:');
    const uniqueVariants = [...new Set(quotationsData.map(r => r.model_variant))];
    uniqueVariants.forEach(variant => {
      console.log(`   "${variant}" (${variant.length} chars)`);
    });
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkFieldLengths();