-- Complete database setup for T-Permit Booking Website
-- Run this entire script in Supabase SQL Editor

-- 1. Create quotations table
CREATE TABLE IF NOT EXISTS public.quotations (
  vendor_id VARCHAR(255) PRIMARY KEY,
  car_model VARCHAR(100) NOT NULL,
  model_variant VARCHAR(100) NOT NULL,
  roi_emi_interest DECIMAL(5, 2) NOT NULL,
  sbi_bank DECIMAL(10, 2),
  union_bank DECIMAL(10, 2),
  indusind_bank DECIMAL(10, 2),
  au_bank DECIMAL(10, 2),
  ex_showroom DECIMAL(10, 2) NOT NULL,
  tcs DECIMAL(10, 2),
  registration DECIMAL(10, 2),
  insurance DECIMAL(10, 2),
  number_plate_crtm_autocard DECIMAL(10, 2),
  gps DECIMAL(10, 2),
  fastag DECIMAL(10, 2),
  speed_governor DECIMAL(10, 2),
  accessories DECIMAL(10, 2),
  on_the_road DECIMAL(10, 2) NOT NULL,
  loan_amount DECIMAL(10, 2),
  margin_down_payment DECIMAL(10, 2),
  process_fee DECIMAL(10, 2),
  stamp_duty DECIMAL(10, 2),
  handling_document_charge DECIMAL(10, 2),
  loan_suraksha_insurance DECIMAL(10, 2),
  down_payment DECIMAL(10, 2),
  offers DECIMAL(10, 2),
  final_down_payment DECIMAL(10, 2),
  emi_years INTEGER,
  monthly_emi DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id VARCHAR(255) PRIMARY KEY,
  date DATE NOT NULL,
  car_model VARCHAR(100) NOT NULL,
  variant VARCHAR(50) NOT NULL,
  showroom_cost DECIMAL(10, 2) NOT NULL,
  registration DECIMAL(10, 2) NOT NULL,
  insurance DECIMAL(10, 2) NOT NULL,
  no_plate DECIMAL(10, 2),
  cts DECIMAL(10, 2),
  gps DECIMAL(10, 2),
  fastag DECIMAL(10, 2),
  speed_governor DECIMAL(10, 2),
  accessories DECIMAL(10, 2),
  on_road_price DECIMAL(10, 2) NOT NULL,
  loan_amount DECIMAL(10, 2),
  margin DECIMAL(10, 2),
  process_fee DECIMAL(10, 2),
  stamp_duty DECIMAL(10, 2),
  handling_charge DECIMAL(10, 2),
  loan_insurance DECIMAL(10, 2),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(15) NOT NULL,
  customer_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create login table
CREATE TABLE IF NOT EXISTS public.login (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes for better performance

-- Quotations table indexes
CREATE INDEX IF NOT EXISTS idx_quotations_car_model ON public.quotations(car_model);
CREATE INDEX IF NOT EXISTS idx_quotations_model_variant ON public.quotations(model_variant);

-- Invoices table indexes
CREATE INDEX IF NOT EXISTS idx_invoices_customer_phone ON public.invoices(customer_phone);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_car_model ON public.invoices(car_model);

-- Login table indexes
CREATE INDEX IF NOT EXISTS idx_login_email ON public.login(email);

-- 5. Insert sample data

-- Sample quotation data
INSERT INTO public.quotations (
  vendor_id, car_model, model_variant, roi_emi_interest,
  sbi_bank, union_bank, indusind_bank, au_bank,
  ex_showroom, tcs, registration, insurance,
  number_plate_crtm_autocard, gps, fastag, speed_governor,
  accessories, on_the_road, loan_amount, margin_down_payment,
  process_fee, stamp_duty, handling_document_charge, loan_suraksha_insurance,
  down_payment, offers, final_down_payment, emi_years, monthly_emi
) VALUES (
  'VENDOR-001', 'Maruti Suzuki ERTIGA', 'ZXI+', 8.75,
  8.50, 8.75, 9.00, 9.25,
  1050000.00, 10500.00, 85000.00, 35000.00,
  2500.00, 6000.00, 500.00, 1000.00,
  15000.00, 1205500.00, 900000.00, 305500.00,
  5000.00, 3000.00, 7500.00, 20000.00,
  305500.00, 25000.00, 280500.00, 5, 18740.00
) ON CONFLICT (vendor_id) DO NOTHING;

-- Sample invoice data
INSERT INTO public.invoices (
  id, date, car_model, variant, 
  showroom_cost, registration, insurance, 
  no_plate, cts, gps, fastag, 
  speed_governor, accessories, on_road_price,
  loan_amount, margin, process_fee,
  stamp_duty, handling_charge, loan_insurance,
  customer_name, customer_phone, customer_address
) VALUES (
  'INV-202406-01', '2024-06-15', 'Maruti Ertiga', 'ZXI+',
  1050000.00, 85000.00, 32500.00,
  2500.00, 10500.00, 6500.00, 500.00,
  1000.00, 15000.00, 1203500.00,
  900000.00, 303500.00, 5000.00,
  2500.00, 7500.00, 25000.00,
  'John Doe', '9876543210', '123 Main Street, City, State, 400001'
) ON CONFLICT (id) DO NOTHING;

-- Default admin user (you should change the password hash)
INSERT INTO public.login (email, password, name, role) VALUES 
('asw@gmail.com', '$2b$10$YqZ3G9B3H3PwfZY7aZ1H3u7v1Y4sZb3a1Zb3a1Zb3a1Zb3a1Zb3a1Z', 'ASW Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 6. Enable Row Level Security (RLS) - Optional but recommended for production
-- ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.login ENABLE ROW LEVEL SECURITY;

-- 7. Create policies (uncomment and modify as needed)
-- CREATE POLICY "Enable read access for all users" ON public.quotations FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users only" ON public.quotations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE public.quotations IS 'Table for storing car quotation data with pricing and EMI details';
COMMENT ON TABLE public.invoices IS 'Table for storing invoice records with customer and car details';
COMMENT ON TABLE public.login IS 'Table for user authentication and authorization';

SELECT 'Database setup completed successfully!' as status;