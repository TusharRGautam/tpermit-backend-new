require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabaseClient } = require('./supabaseClient');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Test route to verify server is working
app.get('/', (req, res) => {
  res.send('ASW Backend API is running');
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

// Debug route to test API connectivity
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
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
    
    // Start the server - listen on all interfaces instead of just localhost
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`API also available at http://192.168.0.102:${PORT}/api`);
      
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