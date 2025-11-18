# Database Setup Instructions for T-Permit Booking Website

## ✅ Setup Status
- Environment file created: `.env` with Supabase credentials
- Connection to Supabase: **SUCCESSFUL** ✅
- SQL files prepared: **READY FOR EXECUTION** ✅

## 🗃️ Database Schema Overview

The backend requires 3 main tables:

### 1. **quotations** table
- **Purpose**: Store car quotation data with pricing and EMI details
- **Key Fields**: vendor_id (PK), car_model, model_variant, roi_emi_interest, bank rates, pricing details
- **Features**: Supports multiple bank rates (SBI, Union, IndusInd, AU), comprehensive cost breakdown

### 2. **invoices** table  
- **Purpose**: Store invoice records with customer and car details
- **Key Fields**: id (PK), customer details, car model, pricing breakdown, loan details
- **Features**: Complete invoice management with on-road price calculation

### 3. **login** table
- **Purpose**: User authentication and authorization
- **Key Fields**: id (PK), email, password, name, role
- **Features**: Role-based access control with default admin user

## 🚀 Manual Setup Instructions

Since the automated API execution is restricted (normal security practice), please follow these steps:

### Step 1: Access Supabase Dashboard
1. Go to [https://app.supabase.com/project/gbcncisbxiuzkrazbyew/sql](https://app.supabase.com/project/gbcncisbxiuzkrazbyew/sql)
2. Log in with your Supabase credentials

### Step 2: Execute Database Setup
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"+ New query"**
3. Copy the entire content from `create_all_tables.sql` file
4. Paste it in the SQL Editor
5. Click **"Run"** to execute all commands

### Step 3: Verify Setup
After running the SQL, execute this verification script:
```bash
cd tpermit-backend
node verify_database_setup.js
```

## 📋 What the SQL Script Creates

### Tables Created:
- ✅ `public.quotations` - Car quotation management
- ✅ `public.invoices` - Invoice management  
- ✅ `public.login` - User authentication

### Indexes Created:
- `idx_quotations_car_model` - Fast car model lookups
- `idx_quotations_model_variant` - Variant filtering
- `idx_invoices_customer_phone` - Customer phone lookups
- `idx_invoices_date` - Date-based filtering
- `idx_invoices_car_model` - Invoice car model searches
- `idx_login_email` - Fast email-based authentication

### Sample Data:
- Sample quotation for "Maruti Suzuki ERTIGA ZXI+"
- Sample invoice record
- Default admin user: `asw@gmail.com`

## 🔧 Environment Configuration

Your `.env` file is already configured with:
```env
SUPABASE_URL=https://gbcncisbxiuzkrazbyew.supabase.co
SUPABASE_ANON_KEY=[configured]
SUPABASE_SERVICE_ROLE_KEY=[configured]
DATABASE_URL=[configured with connection pooling]
DIRECT_URL=[configured for migrations]
```

## 🧪 Testing After Setup

Run these commands to test your setup:

```bash
# Test database connection and table creation
node verify_database_setup.js

# Test individual table scripts
node scripts/testSupabaseConnection.js

# Test specific functionality
node scripts/testInvoiceTable.js
node scripts/testCarDetailIntegration.js
```

## 🔒 Security Considerations

- Row Level Security (RLS) policies can be enabled for production
- Default admin password should be changed after first login
- Service role key provides full database access - keep it secure

## 📊 Expected Verification Output

After successful setup, you should see:
```
✅ Connection successful
✅ Quotations table exists with 1 sample records
✅ Invoices table exists with 1 sample records
✅ Login table exists with 1 user records
🎉 All tables are set up correctly! Database is ready to use.
```

## 🆘 Troubleshooting

If you encounter issues:
1. Verify your Supabase project URL and keys
2. Check network connectivity
3. Ensure you have the correct permissions in Supabase
4. Review the SQL execution logs in Supabase dashboard

## 📞 Support

- Backend scripts are in `./scripts/` directory
- SQL files are in `./migrations/` directory  
- Main configuration is in `supabaseClient.js`

---

**Ready to proceed?** Execute the SQL script in Supabase dashboard and run the verification script!