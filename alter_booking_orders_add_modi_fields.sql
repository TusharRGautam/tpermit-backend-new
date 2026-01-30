-- Add missing columns for Modi Hyundai Proforma Invoice
ALTER TABLE public.booking_orders 
ADD COLUMN IF NOT EXISTS consumer_offer NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS fastag_charges NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS hypothecation_amount NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS safety_package NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS acc_package NUMERIC(15,2);

-- Also add generic fields if missing
ALTER TABLE public.booking_orders 
ADD COLUMN IF NOT EXISTS tcs NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS extended_warranty NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS corporate_offer NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS exchange_bonus NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS loyalty_card NUMERIC(15,2);

SELECT 'Added Modi Hyundai fields to booking_orders' as status;
