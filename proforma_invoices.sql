-- Create proforma_invoices table
CREATE TABLE IF NOT EXISTS public.proforma_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number TEXT UNIQUE NOT NULL, -- e.g. PI13000
    proforma_date DATE NOT NULL,
    
    -- Customer & Vehicle Details (Snapshot)
    customer_name TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_contact TEXT NOT NULL,
    customer_email TEXT,
    
    car_model TEXT NOT NULL,
    registration_place TEXT,
    
    -- Pricing Details
    ex_showroom_price NUMERIC DEFAULT 0,
    reg_service_charges NUMERIC DEFAULT 0,
    insurance_zero_dep NUMERIC DEFAULT 0,
    extended_warranty NUMERIC DEFAULT 0,
    accessories NUMERIC DEFAULT 0,
    tcs NUMERIC DEFAULT 0,
    loyalty_card NUMERIC DEFAULT 0,
    fastag_charges NUMERIC DEFAULT 0,
    
    -- Offers
    consumer_offer NUMERIC DEFAULT 0,
    corporate_offer NUMERIC DEFAULT 0,
    exchange_bonus NUMERIC DEFAULT 0,
    
    -- Finance Details
    bank_name TEXT,
    loan_tenure TEXT,
    cost_of_vehicle NUMERIC DEFAULT 0,
    loan_amount NUMERIC DEFAULT 0,
    margin_money NUMERIC DEFAULT 0,
    emi NUMERIC DEFAULT 0,
    finance_insurance NUMERIC DEFAULT 0,
    finance_fastag NUMERIC DEFAULT 0,
    finance_ew NUMERIC DEFAULT 0,
    finance_registration NUMERIC DEFAULT 0,
    finance_accessories NUMERIC DEFAULT 0,
    stamp_duty_pf NUMERIC DEFAULT 0,
    finance_corporate_offer NUMERIC DEFAULT 0,
    finance_msil_offer NUMERIC DEFAULT 0,
    
    -- Relations
    booking_order_id UUID REFERENCES public.booking_orders(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.proforma_invoices ENABLE ROW LEVEL SECURITY;

-- Policy
DROP POLICY IF EXISTS "Enable all access for all users" ON public.proforma_invoices;

CREATE POLICY "Enable all access for all users" ON public.proforma_invoices
    FOR ALL USING (true) WITH CHECK (true);
