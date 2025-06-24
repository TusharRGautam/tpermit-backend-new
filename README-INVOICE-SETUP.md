# Invoice System Setup for ASW-Backend

This guide explains how to set up and use the invoice system in the ASW-Backend project.

## Overview

The invoice system consists of:

1. **Database Structure**: A Supabase table for storing invoices
2. **API Endpoints**: REST API for CRUD operations on invoices
3. **Client Classes**: Utility classes for Supabase connectivity
4. **Test Scripts**: Tools to verify connections and create sample data

## Setup Instructions

### Step 1: Set up the Supabase Table

In the Supabase Dashboard:

1. Go to the SQL Editor
2. Copy and paste the contents of `migrations/invoice_table.sql`
3. Run the SQL to create the invoices table and indexes

```sql
-- Create invoice table
CREATE TABLE public.invoices (
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

-- Add index on customer_phone for faster lookups
CREATE INDEX idx_invoices_customer_phone ON public.invoices(customer_phone);

-- Add index on date for easier date-based filtering
CREATE INDEX idx_invoices_date ON public.invoices(date);
```

### Step 2: Configure RLS (Row Level Security)

To make the table accessible from your API:

1. Go to **Authentication > Policies** in Supabase Dashboard
2. Find your `invoices` table
3. Click **Add Policy**
4. Select "Enable read access to everyone" and "Enable write access to everyone" 
   (You can make this more restrictive later by using `auth.role() = 'authenticated'`)

### Step 3: Test the Setup

1. Run the test script to verify connections:

```bash
npm run test-invoice
```

2. If successful, create a sample invoice:

```bash
npm run create-sample
```

3. Run the server:

```bash
npm run dev
```

## API Endpoints

Once your server is running, the following endpoints are available:

### Check Invoice Table Status
```
GET /api/invoices/check-table
```

### List All Invoices
```
GET /api/invoices
```

### Get Invoice by ID
```
GET /api/invoices/:id
```

### Create New Invoice
```
POST /api/invoices
```

Required fields in request body:
- `id`: Unique invoice ID (string)
- `date`: Invoice date (YYYY-MM-DD)
- `carModel`: Car model name
- `variant`: Car variant name
- `showroomCost`: Ex-showroom cost (numeric)
- `registration`: Registration fee (numeric)
- `insurance`: Insurance amount (numeric)
- `customerName`: Customer's full name
- `customerPhone`: Customer's phone number

### Update Invoice
```
PUT /api/invoices/:id
```

### Delete Invoice
```
DELETE /api/invoices/:id
```

## Troubleshooting

### Connection Issues

If you're experiencing connectivity issues:

1. **Check .env File**: Ensure your Supabase URL and keys are correct
2. **Network Access**: Make sure your network allows outbound HTTPS connections
3. **CORS Settings**: In Supabase, go to **Settings > API** and add your application's URL to the allowed CORS origins

### Table Does Not Exist Error

If you get "table does not exist" errors:

1. Verify you've run the SQL script in the Supabase SQL Editor
2. Check if you're using the correct Supabase project
3. Make sure the table name is exactly `invoices` (lowercase)

## Integration with Frontend

The invoice system is designed to work with the InvoiceCreationPage.tsx component:

1. When a user submits the form in InvoiceCreationPage.tsx, make a POST request to `/api/invoices`
2. Format the request data to match the required fields
3. To list invoices, fetch from GET `/api/invoices`
4. To view a specific invoice, fetch from GET `/api/invoices/:id` 