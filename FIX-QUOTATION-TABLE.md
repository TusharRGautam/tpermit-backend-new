# Fix Quotation Table Schema Issue

## Problem
The database table has `vendor_id` defined as INTEGER, but the application generates string-based vendor IDs like "V-1750219550912-woiq9w".

**Error:** `invalid input syntax for type integer: "V-1750219550912-woiq9w"`

## Solution Options

### Option 1: Run the Fix Script (Recommended)

```bash
# Navigate to the backend directory
cd asw-backend

# Run the fix script
node scripts/fixQuotationTable.js
```

This script will:
- Check the current table schema
- Drop and recreate the table with correct VARCHAR(255) for vendor_id
- Add proper indexes and security policies
- Test the operations
- Insert sample data

### Option 2: Manual SQL Fix

If the script doesn't work, manually execute this SQL in your Supabase SQL Editor:

```sql
-- Step 1: Drop existing table (if it has wrong schema)
DROP TABLE IF EXISTS public.quotations CASCADE;

-- Step 2: Create table with correct schema
CREATE TABLE public.quotations (
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

-- Step 3: Add indexes for performance
CREATE INDEX idx_quotations_car_model ON public.quotations(car_model);
CREATE INDEX idx_quotations_model_variant ON public.quotations(model_variant);
CREATE INDEX idx_quotations_created_at ON public.quotations(created_at);

-- Step 4: Enable RLS (Row Level Security)
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policy for access (adjust as needed)
CREATE POLICY "Enable all operations for quotations" ON public.quotations
  FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Insert sample data to test
INSERT INTO public.quotations (
  vendor_id, car_model, model_variant, roi_emi_interest,
  sbi_bank, ex_showroom, on_the_road
) VALUES (
  'SAMPLE-001', 'Maruti Ertiga', 'ZXI+', 8.75,
  85.0, 1050000.00, 1205500.00
);
```

### Option 3: Quick Verification

Run this query to check if the fix worked:

```sql
-- Check table schema
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'quotations' 
AND table_schema = 'public' 
AND column_name = 'vendor_id';

-- Should return:
-- column_name: vendor_id
-- data_type: character varying
-- character_maximum_length: 255
```

## Changes Made to Backend Code

1. **Fixed table name mismatch:**
   - Changed `this.tableName = 'quotation'` to `this.tableName = 'quotations'`
   - The SQL files created table as 'quotations' (plural) but code was looking for 'quotation' (singular)

## Testing the Fix

After applying the fix:

1. **Start your backend server:**
   ```bash
   cd asw-backend
   npm start
   ```

2. **Test the API in your frontend:**
   - Go to the Invoice Creation page
   - Fill out the form
   - Click "Generate Quotation"
   - Should work without the integer error

3. **Check the database:**
   ```sql
   SELECT * FROM public.quotations ORDER BY created_at DESC LIMIT 5;
   ```

## Troubleshooting

### If you still get errors:

1. **Check Supabase connection:**
   ```bash
   node scripts/testSupabaseConnection.js
   ```

2. **Verify table exists:**
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'quotations';
   ```

3. **Check permissions:**
   - Ensure your Supabase API key has table creation permissions
   - Check RLS policies are not blocking operations

4. **Backend logs:**
   - Check console output for any connection errors
   - Verify environment variables are set correctly

### Common Issues:

- **RLS blocking operations:** Disable RLS temporarily or adjust policies
- **API key permissions:** Use service role key for admin operations
- **Network issues:** Check Supabase URL and network connectivity

## Success Indicators

✅ **Successful fix shows:**
- No more "integer" type errors
- Quotations save successfully
- vendor_id accepts string values like "V-1750219550912-woiq9w"
- Success modal displays after quotation creation

❌ **If still failing:**
- Check error messages in browser console
- Verify backend logs for SQL errors
- Test database connection directly

## Need Help?

1. Check browser Network tab for API call details
2. Look at backend console for detailed error messages
3. Verify Supabase dashboard shows the correct table structure
4. Test with a simple quotation first 