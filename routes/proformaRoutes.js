const express = require('express');
const router = express.Router();
const SupabaseProformaInvoice = require('../models/SupabaseProformaInvoice');

const proformaModel = new SupabaseProformaInvoice();

// Get next serial number
router.get('/next-serial', async (req, res) => {
  try {
    const nextSerial = await proformaModel.getNextSerialNumber();
    res.json({ success: true, serialNumber: nextSerial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create proforma invoice
router.post('/', async (req, res) => {
  try {
    const result = await proformaModel.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all proforma invoices
router.get('/', async (req, res) => {
  try {
    const results = await proformaModel.getAll();
    res.json(results);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get proforma by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await proformaModel.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Proforma Invoice not found' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete proforma
router.delete('/:id', async (req, res) => {
  try {
    await proformaModel.delete(req.params.id);
    res.json({ success: true, message: 'Proforma Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// Update proforma
router.put('/:id', async (req, res) => {
  try {
    const updated = await proformaModel.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
