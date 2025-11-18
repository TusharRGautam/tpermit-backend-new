require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabaseClient } = require('./supabaseClient');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// OLD: Localhost-only CORS configuration (commented out)
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// NEW: Production CORS configuration with domain support
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://t-permit.com',
    'https://www.t-permit.com',
    'https://backend.t-permit.com',
    'http://t-permit.com',
    'http://www.t-permit.com',
    'http://backend.t-permit.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

app.use(express.json());

// Test route to verify server is working
app.get('/', (req, res) => {
  res.send('T-Permit Backend API is running');
});

// Test route to verify Supabase connection
app.get('/api/test-supabase', async (req, res) => {
  try {
    // Test Supabase connection by querying the current timestamp
    const { data, error } = await supabaseClient.from('_test_').select('*').limit(1);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Supabase connection successful',
      data
    });
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Supabase',
      error: error.message
    });
  }
});

// User routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Invoice routes
const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api/invoices', invoiceRoutes);

// Quotation routes
const quotationRoutes = require('./routes/quotationRoutes');
app.use('/api/quotations', quotationRoutes);

// Authentication routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Showroom routes
const showroomRoutes = require('./routes/showroomRoutes');
app.use('/api/showrooms', showroomRoutes);

// Booking routes
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

// Debug route to test API connectivity
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    domain: req.get('host'),
    origin: req.get('origin')
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Auto-detect best database implementation
const invoiceFactory = require('./models/InvoiceFactory');
// Import SupabaseQuotation for fetching quotation data
const SupabaseQuotation = require('./models/SupabaseQuotation');

// Function to fetch and log all invoice data
async function fetchAndLogInvoiceData() {
  try {
    console.log('\n=== FETCHING ALL INVOICE DATA AT SERVER STARTUP ===');
    
    const invoices = await invoiceFactory.getAllInvoices();
    
    console.log('=== START: INVOICE TABLE DATA ===');
    console.log(JSON.stringify(invoices, null, 2));
    console.log(`Total Records: ${invoices.length}`);
    console.log('=== END: INVOICE TABLE DATA ===\n');
    
    return invoices;
  } catch (error) {
    console.error('Error fetching invoice data at startup:', error);
    return [];
  }
}

// Function to fetch and log all quotation data
async function fetchAndLogQuotationData() {
  try {
    console.log('\n=== FETCHING ALL QUOTATION DATA AT SERVER STARTUP ===');
    
    const quotationModel = new SupabaseQuotation();
    const quotations = await quotationModel.getAll();
    
    console.log('=== START: QUOTATION TABLE DATA ===');
    console.log(JSON.stringify(quotations, null, 2));
    console.log(`Total Records: ${quotations.length}`);
    console.log('=== END: QUOTATION TABLE DATA ===\n');
    
    return quotations;
  } catch (error) {
    console.error('Error fetching quotation data at startup:', error);
    return [];
  }
}

// Start server with auto-detection
async function startServer() {
  try {
    // Auto-detect the best implementation for database access
    console.log('Auto-detecting database implementation...');
    const implementation = await invoiceFactory.autoDetectImplementation();
    console.log(`Using ${implementation} implementation for database access`);
    
    // NEW: Production server configuration
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 T-Permit Backend Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🌐 Production API: https://backend.t-permit.com/api`);
      console.log(`🔗 Frontend: https://t-permit.com`);
      console.log(`✅ CORS enabled for: t-permit.com, www.t-permit.com, backend.t-permit.com`);
      console.log(`🔄 Preflight requests handled for all routes`);
      
      // After server has started, fetch and log all invoice and quotation data
      fetchAndLogInvoiceData();
      fetchAndLogQuotationData();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 