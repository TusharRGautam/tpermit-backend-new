const express = require('express');
const router = express.Router();
const invoiceModel = require('../models/InvoiceFactory'); // Auto-selects the best implementation

// Check invoice table existence - this route helps verify the table is set up correctly
router.get('/check-table', async (req, res) => {
  try {
    const tableExists = await invoiceModel.ensureInvoiceTable();
    
    if (tableExists) {
      res.status(200).json({
        success: true,
        message: 'Invoice table is set up correctly'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Invoice table does not exist or is not accessible',
        instructions: 'Please create the invoices table in Supabase using the SQL script in migrations/invoice_table.sql'
      });
    }
  } catch (error) {
    console.error('Error checking invoice table:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking invoice table',
      error: error.message
    });
  }
});

// Fetch all data from invoices table and log to console
router.get('/debug/all-data', async (req, res) => {
  try {
    console.log('=== DEBUG: Fetching all columns from invoices table ===');
    
    const invoices = await invoiceModel.getAllInvoices();
    
    // Log the entire result set to the console for debugging
    console.log('=== START: Invoice Data ===');
    console.log(JSON.stringify(invoices, null, 2));
    console.log(`Total Records: ${invoices.length}`);
    console.log('=== END: Invoice Data ===');
    
    res.json({
      success: true,
      message: 'Invoices data fetched successfully. Check server console for complete data log.',
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching all invoice data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice data',
      error: error.message
    });
  }
});

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await invoiceModel.getAllInvoices();
    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceModel.getInvoiceById(id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error(`Error fetching invoice with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['id', 'date', 'carModel', 'variant', 'showroomCost', 'registration', 'insurance', 'customerName', 'customerPhone'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const result = await invoiceModel.createInvoice(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
});

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if invoice exists first
    const existingInvoice = await invoiceModel.getInvoiceById(id);
    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: `Invoice with ID ${id} not found`
      });
    }
    
    const result = await invoiceModel.updateInvoice(id, req.body);
    
    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error(`Error updating invoice with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if invoice exists first
    const existingInvoice = await invoiceModel.getInvoiceById(id);
    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: `Invoice with ID ${id} not found`
      });
    }
    
    await invoiceModel.deleteInvoice(id);
    
    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting invoice with ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
});

module.exports = router; 