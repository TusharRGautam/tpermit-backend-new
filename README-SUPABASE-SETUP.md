# Setting Up the Invoice Table in Supabase

Since we're experiencing connectivity issues with Supabase through the Node.js client, follow these instructions to set up the Invoice table manually in the Supabase Dashboard.

## Step 1: Log in to Supabase Dashboard

1. Go to [https://app.supabase.io/](https://app.supabase.io/)
2. Log in with your credentials
3. Select your project

## Step 2: Create the Invoice Table

### Option 1: Using SQL Editor (Recommended)

1. Click on **SQL Editor** in the left sidebar
2. Create a new query
3. Copy and paste the SQL code from `migrations/invoice_table.sql`
4. Click **Run**

### Option 2: Using Table Editor

1. Click on **Table Editor** in the left sidebar
2. Click **+ New Table**
3. Set the name to `invoices`
4. Add the following columns:

| Column Name       | Type              | Default Value          | Primary Key | Is Nullable |
|-------------------|-------------------|------------------------|------------|-------------|
| id                | varchar           | -                      | ✅         | ❌          |
| date              | date              | -                      | ❌         | ❌          |
| car_model         | varchar           | -                      | ❌         | ❌          |
| variant           | varchar           | -                      | ❌         | ❌          |
| showroom_cost     | decimal(10,2)     | -                      | ❌         | ❌          |
| registration      | decimal(10,2)     | -                      | ❌         | ❌          |
| insurance         | decimal(10,2)     | -                      | ❌         | ❌          |
| no_plate          | decimal(10,2)     | -                      | ❌         | ✅          |
| cts               | decimal(10,2)     | -                      | ❌         | ✅          |
| gps               | decimal(10,2)     | -                      | ❌         | ✅          |
| fastag            | decimal(10,2)     | -                      | ❌         | ✅          |
| speed_governor    | decimal(10,2)     | -                      | ❌         | ✅          |
| accessories       | decimal(10,2)     | -                      | ❌         | ✅          |
| on_road_price     | decimal(10,2)     | -                      | ❌         | ❌          |
| loan_amount       | decimal(10,2)     | -                      | ❌         | ✅          |
| margin            | decimal(10,2)     | -                      | ❌         | ✅          |
| process_fee       | decimal(10,2)     | -                      | ❌         | ✅          |
| stamp_duty        | decimal(10,2)     | -                      | ❌         | ✅          |
| handling_charge   | decimal(10,2)     | -                      | ❌         | ✅          |
| loan_insurance    | decimal(10,2)     | -                      | ❌         | ✅          |
| customer_name     | varchar           | -                      | ❌         | ❌          |
| customer_phone    | varchar(15)       | -                      | ❌         | ❌          |
| customer_address  | text              | -                      | ❌         | ✅          |
| created_at        | timestamptz       | CURRENT_TIMESTAMP      | ❌         | ❌          |
| updated_at        | timestamptz       | CURRENT_TIMESTAMP      | ❌         | ❌          |

5. Click **Save**

## Step 3: Add Indexes (Using SQL Editor)

Run the following SQL to create indexes:

```sql
-- Add index on customer_phone for faster lookups
CREATE INDEX idx_invoices_customer_phone ON public.invoices(customer_phone);

-- Add index on date for easier date-based filtering
CREATE INDEX idx_invoices_date ON public.invoices(date);
```

## Step 4: Set Up Row Level Security (RLS)

By default, Supabase tables have RLS enabled but no policies. You need to add policies to allow your app to interact with the table:

1. Go to **Authentication > Policies**
2. Find your `invoices` table
3. Click **Add Policy**
4. Select **Allow all operations based on a condition**
5. Give your policy a name, e.g., `Enable all operations for authenticated users`
6. In the **Using expression** field, enter `auth.role() = 'authenticated'` or `true` for unrestricted access (not recommended for production)
7. Click **Save**

## Step 5: Test Connection

Once you've set up the table in Supabase, you can test the backend connection by running:

```bash
npm run test-connection
```

## Step 6: Insert Sample Data (Optional)

You can insert sample data by running the INSERT statement in the SQL editor:

```sql
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
);
```

## Troubleshooting

If you're experiencing connectivity issues from your Node.js backend:

1. **Check Supabase URL and API Keys**: Ensure they are correctly set in your `.env` file
2. **Network Issues**: Check if your network allows outbound HTTPS connections
3. **CORS Settings**: In the Supabase dashboard, go to **Settings > API** and add your app's URL to the CORS Origins allowed list
4. **API Rate Limits**: Ensure you're not exceeding Supabase's API rate limits 