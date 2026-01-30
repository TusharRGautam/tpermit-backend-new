const express = require('express');
const router = express.Router();
const SupabaseBookingOrder = require('../models/SupabaseBookingOrder');

const bookingOrderModel = new SupabaseBookingOrder();

// Get next order number
router.get('/next-number', async (req, res) => {
  try {
    const nextNumber = await bookingOrderModel.getNextOrderNumber();
    res.json({
      success: true,
      data: nextNumber
    });
  } catch (error) {
    console.error('Error fetching next order number:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch next order number'
    });
  }
});

// Create new booking order
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    const newOrder = await bookingOrderModel.create(orderData);
    
    res.status(201).json({
      success: true,
      message: 'Booking order created successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Error creating booking order:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create booking order',
      error: error.message
    });
  }
});

// Get all booking orders
router.get('/', async (req, res) => {
  try {
    const orders = await bookingOrderModel.getAll();
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching booking orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking orders'
    });
  }
});

// Get booking order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await bookingOrderModel.getById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Booking order not found'
      });
    }
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching booking order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking order'
    });
  }
});

// Delete booking order
router.delete('/:id', async (req, res) => {
  try {
    const success = await bookingOrderModel.delete(req.params.id);
    res.json({
      success: true,
      message: 'Booking order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking order'
    });
  }
});


// Update booking order
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await bookingOrderModel.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Booking order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating booking order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking order'
    });
  }
});

module.exports = router;
