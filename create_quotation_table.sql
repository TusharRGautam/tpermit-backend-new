-- Create quotation table
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

-- Add index on car_model for faster lookups
CREATE INDEX IF NOT EXISTS idx_quotations_car_model ON public.quotations(car_model);

-- Add index on model_variant for easier filtering
CREATE INDEX IF NOT EXISTS idx_quotations_model_variant ON public.quotations(model_variant);

-- Insert a sample quotation record for testing
INSERT INTO public.quotations (
  vendor_id, car_model, model_variant, roi_emi_interest,
  sbi_bank, union_bank, indusind_bank, au_bank,
  ex_showroom, tcs, registration, insurance,
  number_plate_crtm_autocard, gps, fastag, speed_governor,
  accessories, on_the_road, loan_amount, margin_down_payment,
  process_fee, stamp_duty, handling_document_charge, loan_suraksha_insurance,
  down_payment, offers, final_down_payment, emi_years, monthly_emi
) VALUES (
  'VENDOR-001', 'Maruti Ertiga', 'ZXI+', 8.75,
  8.50, 8.75, 9.00, 9.25,
  1050000.00, 10500.00, 85000.00, 35000.00,
  2500.00, 6000.00, 500.00, 1000.00,
  15000.00, 1205500.00, 900000.00, 305500.00,
  5000.00, 3000.00, 7500.00, 20000.00,
  305500.00, 25000.00, 280500.00, 5, 18740.00
); 