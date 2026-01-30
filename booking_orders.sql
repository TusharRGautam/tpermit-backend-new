-- Create booking_orders table
CREATE TABLE IF NOT EXISTS public.booking_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    company_name TEXT NOT NULL,
    tours_travels_name TEXT NOT NULL,
    car_model TEXT NOT NULL,
    variant TEXT,
    color TEXT NOT NULL,
    rto_passing TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_contact TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.booking_orders ENABLE ROW LEVEL SECURITY;

-- Create policies (modify as per your security requirements)
-- Allow anyone to read/insert for now (development mode)
CREATE POLICY "Enable all access for all users" ON public.booking_orders
    FOR ALL USING (true) WITH CHECK (true);
