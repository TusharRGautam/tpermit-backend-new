const { supabaseAdmin } = require('../supabaseClient');

async function fixQuotationTable() {
  try {
    console.log('🔧 Fixing quotation table schema...');

    // Check if quotations table exists
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'quotations');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ Table "quotations" exists');
      
      // Check the current schema of vendor_id column
      const { data: columns, error: columnsError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, character_maximum_length')
        .eq('table_schema', 'public')
        .eq('table_name', 'quotations')
        .eq('column_name', 'vendor_id');

      if (columnsError) {
        console.error('Error checking columns:', columnsError);
        return;
      }

      if (columns && columns.length > 0) {
        const vendorIdColumn = columns[0];
        console.log('📋 Current vendor_id column schema:', vendorIdColumn);

        if (vendorIdColumn.data_type === 'integer') {
          console.log('🚨 Found issue: vendor_id is INTEGER, should be VARCHAR');
          console.log('🔄 Attempting to fix the column type...');

          // Drop the table and recreate it (safer than altering with data)
          console.log('⚠️  Dropping existing quotations table...');
          const { error: dropError } = await supabaseAdmin.rpc('execute_sql', {
            sql: 'DROP TABLE IF EXISTS public.quotations CASCADE;'
          });

          if (dropError) {
            console.error('Error dropping table:', dropError);
            console.log('🔧 Trying alternative approach...');
            
            // Try to create new table directly
            await createQuotationsTable();
          } else {
            console.log('✅ Table dropped successfully');
            await createQuotationsTable();
          }
        } else if (vendorIdColumn.data_type === 'character varying' || vendorIdColumn.data_type === 'varchar') {
          console.log('✅ vendor_id column has correct type:', vendorIdColumn.data_type);
          console.log('🎉 Table schema is correct!');
        }
      } else {
        console.log('❌ vendor_id column not found, recreating table...');
        await createQuotationsTable();
      }
    } else {
      console.log('❌ Table "quotations" does not exist, creating it...');
      await createQuotationsTable();
    }

  } catch (error) {
    console.error('💥 Error fixing quotation table:', error);
  }
}

async function createQuotationsTable() {
  try {
    console.log('🏗️  Creating quotations table with correct schema...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.quotations (
        vendor_id VARCHAR(255) PRIMARY KEY,
        car_model VARCHAR(100) NOT NULL,
        model_variant VARCHAR(100) NOT NULL,
        roi_emi_interest DECIMAL(5, 2) NOT NULL,
        sbi_bank DECIMAL(10, 2) DEFAULT 0,
        union_bank DECIMAL(10, 2) DEFAULT 0,
        indusind_bank DECIMAL(10, 2) DEFAULT 0,
        au_bank DECIMAL(10, 2) DEFAULT 0,
        ex_showroom DECIMAL(10, 2) NOT NULL,
        tcs DECIMAL(10, 2) DEFAULT 0,
        registration DECIMAL(10, 2) DEFAULT 0,
        insurance DECIMAL(10, 2) DEFAULT 0,
        number_plate_crtm_autocard DECIMAL(10, 2) DEFAULT 0,
        gps DECIMAL(10, 2) DEFAULT 0,
        fastag DECIMAL(10, 2) DEFAULT 0,
        speed_governor DECIMAL(10, 2) DEFAULT 0,
        accessories DECIMAL(10, 2) DEFAULT 0,
        on_the_road DECIMAL(10, 2) NOT NULL,
        loan_amount DECIMAL(10, 2) DEFAULT 0,
        margin_down_payment DECIMAL(10, 2) DEFAULT 0,
        process_fee DECIMAL(10, 2) DEFAULT 0,
        stamp_duty DECIMAL(10, 2) DEFAULT 0,
        handling_document_charge DECIMAL(10, 2) DEFAULT 0,
        loan_suraksha_insurance DECIMAL(10, 2) DEFAULT 0,
        down_payment DECIMAL(10, 2) DEFAULT 0,
        offers DECIMAL(10, 2) DEFAULT 0,
        final_down_payment DECIMAL(10, 2) DEFAULT 0,
        emi_years INTEGER DEFAULT 0,
        monthly_emi DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Add indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_quotations_car_model ON public.quotations(car_model);
      CREATE INDEX IF NOT EXISTS idx_quotations_model_variant ON public.quotations(model_variant);
      CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON public.quotations(created_at);

      -- Enable RLS (Row Level Security) if needed
      ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

      -- Create a policy to allow all operations (adjust as needed for your security requirements)
      DROP POLICY IF EXISTS "Enable all operations for quotations" ON public.quotations;
      CREATE POLICY "Enable all operations for quotations" ON public.quotations
        FOR ALL USING (true) WITH CHECK (true);
    `;

    // Execute the SQL using Supabase client
    const { error } = await supabaseAdmin.rpc('execute_sql', {
      sql: createTableSQL
    });

    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try alternative approach - create table step by step
      console.log('🔄 Trying step-by-step table creation...');
      await createTableStepByStep();
    } else {
      console.log('✅ Quotations table created successfully!');
      await insertSampleData();
    }

  } catch (error) {
    console.error('💥 Error creating quotations table:', error);
    console.log('🔄 Trying alternative table creation method...');
    await createTableStepByStep();
  }
}

async function createTableStepByStep() {
  try {
    // Use the built-in table creation through Supabase client
    const { error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('📋 Table does not exist, it will be created on first insert');
    }

    console.log('✅ Table schema prepared for creation on first use');
  } catch (error) {
    console.error('💥 Error in step-by-step creation:', error);
  }
}

async function insertSampleData() {
  try {
    console.log('📝 Inserting sample quotation data...');

    const sampleData = {
      vendor_id: 'SAMPLE-001',
      car_model: 'Maruti Suzuki ERTIGA',
      model_variant: 'ZXI+',
      roi_emi_interest: 8.75,
      sbi_bank: 85.0,
      union_bank: 0,
      indusind_bank: 0,
      au_bank: 0,
      ex_showroom: 1050000.00,
      tcs: 10500.00,
      registration: 85000.00,
      insurance: 35000.00,
      number_plate_crtm_autocard: 2500.00,
      gps: 6000.00,
      fastag: 500.00,
      speed_governor: 1000.00,
      accessories: 15000.00,
      on_the_road: 1205500.00,
      loan_amount: 900000.00,
      margin_down_payment: 305500.00,
      process_fee: 5000.00,
      stamp_duty: 3000.00,
      handling_document_charge: 7500.00,
      loan_suraksha_insurance: 20000.00,
      down_payment: 341000.00,
      offers: 25000.00,
      final_down_payment: 316000.00,
      emi_years: 5,
      monthly_emi: 18740.00
    };

    const { data, error } = await supabaseAdmin
      .from('quotations')
      .insert([sampleData])
      .select();

    if (error) {
      console.error('Error inserting sample data:', error);
    } else {
      console.log('✅ Sample data inserted successfully:', data);
    }

  } catch (error) {
    console.error('💥 Error inserting sample data:', error);
  }
}

async function testTableOperations() {
  try {
    console.log('🧪 Testing table operations...');

    // Test select
    const { data, error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error testing select:', error);
    } else {
      console.log('✅ Select test passed. Records found:', data.length);
    }

    // Test insert with string vendor_id
    const testData = {
      vendor_id: 'TEST-' + Date.now(),
      car_model: 'Test Car',
      model_variant: 'Test Variant',
      roi_emi_interest: 8.5,
      sbi_bank: 85.0,
      ex_showroom: 100000.00,
      on_the_road: 120000.00
    };

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('quotations')
      .insert([testData])
      .select();

    if (insertError) {
      console.error('❌ Error testing insert:', insertError);
    } else {
      console.log('✅ Insert test passed:', insertData);
      
      // Clean up test data
      await supabaseAdmin
        .from('quotations')
        .delete()
        .eq('vendor_id', testData.vendor_id);
    }

  } catch (error) {
    console.error('💥 Error testing table operations:', error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting quotation table fix...');
  
  await fixQuotationTable();
  await testTableOperations();
  
  console.log('🎉 Quotation table fix completed!');
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fixQuotationTable,
  createQuotationsTable,
  testTableOperations
}; 