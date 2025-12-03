// routes/receiptRoutes.js
const express = require('express');
const router = express.Router();
const SupabaseReceipt = require('../models/SupabaseReceipt');

const receiptModel = new SupabaseReceipt();

// Get next receipt number
router.get('/next-number', async (req, res) => {
  try {
    const nextNumber = await receiptModel.getNextReceiptNumber();
    res.status(200).json(nextNumber);
  } catch (error) {
    console.error('Error getting next receipt number:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new receipt
router.post('/', async (req, res) => {
  try {
    console.log('Creating receipt with data:', JSON.stringify(req.body, null, 2));

    const newReceipt = await receiptModel.create(req.body);
    res.status(201).json(newReceipt);
  } catch (error) {
    console.error('Error creating receipt:', error);
    res.status(400).json({
      error: error.message,
      details: error.details || null,
      code: error.code || null,
      hint: error.hint || null
    });
  }
});

// Get all receipts
router.get('/', async (req, res) => {
  try {
    const receipts = await receiptModel.getAll();
    res.status(200).json(receipts);
  } catch (error) {
    console.error('Error getting receipts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search receipts
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const receipts = await receiptModel.search(searchTerm);
    res.status(200).json(receipts);
  } catch (error) {
    console.error('Error searching receipts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a receipt by ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const receipt = await receiptModel.findById(id);

    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    res.status(200).json(receipt);
  } catch (error) {
    console.error('Error getting receipt:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a receipt
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`Updating receipt ${id} with data:`, JSON.stringify(req.body, null, 2));

    const updatedReceipt = await receiptModel.update(id, req.body);

    if (!updatedReceipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    res.status(200).json(updatedReceipt);
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(400).json({
      error: error.message,
      details: error.details || null,
      code: error.code || null,
      hint: error.hint || null
    });
  }
});

// Delete a receipt
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await receiptModel.delete(id);
    res.status(200).json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
