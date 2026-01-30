-- Fix for "numeric field overflow" error in Payment Receipts
-- This creates/alters the payment_receipts table to ensure columns can hold the data

-- 1. Create table if it doesn't exist (safety check)
CREATE TABLE IF NOT EXISTS public.payment_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number TEXT UNIQUE NOT NULL,
    receipt_date DATE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_address TEXT,
    mobile_number TEXT,  -- Ensure this is TEXT
    receipt_amount NUMERIC(20, 2), -- Ensure large enough precision
    payment_mode TEXT,
    car_model TEXT,
    variant TEXT,
    sales_executive_name TEXT,
    remarks TEXT,
    hypothecated_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Alter existing columns to correct types (Fixes the overflow error)
-- We convert mobile_number to TEXT to avoid numeric overflow
ALTER TABLE public.payment_receipts ALTER COLUMN mobile_number TYPE TEXT;

-- We increase the precision of receipt_amount just in case
ALTER TABLE public.payment_receipts ALTER COLUMN receipt_amount TYPE NUMERIC(20, 2);

-- Enable RLS
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- Policy (Idempotent)
DROP POLICY IF EXISTS "Enable all access for all users" ON public.payment_receipts;
CREATE POLICY "Enable all access for all users" ON public.payment_receipts
    FOR ALL USING (true) WITH CHECK (true);
