const express = require('express');
const router = express.Router();
const SupabaseBooking = require('../models/SupabaseBooking');

const bookingModel = new SupabaseBooking();

// Create a new booking
router.post('/', async (req, res) => {
  try {
    console.log('Creating new booking with data:', req.body);
    
    // Extract car details from request
    const {
      // Car details
      car_brand,
      car_model,
      car_variant,
      car_fuel_type,
      car_transmission,
      car_color,
      car_year,
      
      // Customer details
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_city,
      customer_state,
      customer_pincode,
      
      // Pricing details
      ex_showroom_price,
      on_road_price,
      booking_amount,
      total_amount,
      
      // Finance details (optional)
      finance_required,
      finance_bank,
      loan_amount,
      down_payment,
      emi_amount,
      loan_tenure_months,
      interest_rate,
      
      // Additional details
      special_requirements,
      preferred_delivery_date,
      lead_source,
      referral_source,
      marketing_campaign,
      
      // System tracking
      ip_address,
      user_agent,
      utm_source,
      utm_medium,
      utm_campaign
    } = req.body;
    
    // Prepare booking data
    const bookingData = {
      // Car details
      car_brand,
      car_model,
      car_variant,
      car_fuel_type,
      car_transmission,
      car_color,
      car_year,
      
      // Customer details
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_city,
      customer_state: customer_state || 'Maharashtra', // Default to Maharashtra
      customer_pincode,
      
      // Pricing
      ex_showroom_price: parseFloat(ex_showroom_price) || 0,
      on_road_price: parseFloat(on_road_price) || 0,
      booking_amount: parseFloat(booking_amount) || 0,
      total_amount: parseFloat(total_amount) || parseFloat(on_road_price) || 0,
      
      // Finance
      finance_required: finance_required || false,
      finance_bank,
      loan_amount: parseFloat(loan_amount) || 0,
      down_payment: parseFloat(down_payment) || 0,
      emi_amount: parseFloat(emi_amount) || 0,
      loan_tenure_months: parseInt(loan_tenure_months) || null,
      interest_rate: parseFloat(interest_rate) || 0,
      
      // Additional info
      special_requirements,
      preferred_delivery_date,
      lead_source: lead_source || 'website',
      referral_source,
      marketing_campaign,
      
      // System tracking
      ip_address: ip_address || req.ip || req.connection.remoteAddress,
      user_agent: user_agent || req.get('User-Agent'),
      utm_source,
      utm_medium,
      utm_campaign,
      
      // Default values
      booking_status: 'pending',
      payment_status: 'pending',
      documents_submitted: false,
      kyc_verified: false,
      agreement_signed: false,
      
      // Audit
      created_by: 'system',
      last_updated_by: 'system'
    };
    
    const booking = await bookingModel.create(bookingData);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking.toJSON(),
      booking_reference_id: booking.booking_reference_id
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await bookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.json({
      success: true,
      data: booking.toJSON()
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// Get booking by reference ID
router.get('/reference/:referenceId', async (req, res) => {
  try {
    const booking = await bookingModel.findByReferenceId(req.params.referenceId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.json({
      success: true,
      data: booking.toJSON()
    });
  } catch (error) {
    console.error('Error fetching booking by reference ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// Update booking
router.put('/:id', async (req, res) => {
  try {
    const booking = await bookingModel.update(req.params.id, {
      ...req.body,
      last_updated_by: 'admin'
    });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking.toJSON()
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
});

// Update payment status
router.put('/:id/payment', async (req, res) => {
  try {
    const { status, reference_id, gateway, method, date } = req.body;
    
    const booking = await bookingModel.updatePaymentStatus(req.params.id, {
      status,
      reference_id,
      gateway,
      method,
      date
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: booking.toJSON()
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
});

// Get all bookings (with pagination) - direct data without model transformation
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    
    // Get data directly from Supabase without model transformation
    const { supabaseAdmin } = require('../supabaseClient');
    const tableName = 'Booking-Relationship-Allocation';
    
    let query = supabaseAdmin
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('booking_status', status);
    }
    
    const { data: bookings, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedBookings = bookings.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedBookings,
      pagination: {
        page,
        limit,
        total: bookings.length,
        totalPages: Math.ceil(bookings.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Get bookings by customer email
router.get('/customer/:email', async (req, res) => {
  try {
    // Get raw data directly from Supabase without model transformation
    const { supabaseAdmin } = require('../supabaseClient');
    const tableName = 'Booking-Relationship-Allocation';

    const { data: bookings, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .eq('customer_email', req.params.email)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: bookings || []
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer bookings',
      error: error.message
    });
  }
});

// Get bookings by showroom
router.get('/showroom/:showroomId', async (req, res) => {
  try {
    const bookings = await bookingModel.getByShowroom(req.params.showroomId);
    res.json({
      success: true,
      data: bookings.map(b => b.toJSON())
    });
  } catch (error) {
    console.error('Error fetching showroom bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showroom bookings',
      error: error.message
    });
  }
});

// Get booking summary
router.get('/dashboard/summary', async (req, res) => {
  try {
    const stats = await bookingModel.getBookingStats();
    
    // Transform the stats into the expected summary format
    const summary = {
      total_bookings: stats.totalBookings || 0,
      pending_bookings: stats.statusBreakdown?.find(s => s.booking_status === 'pending')?.count || 0,
      confirmed_bookings: stats.statusBreakdown?.find(s => s.booking_status === 'confirmed')?.count || 0,
      cancelled_bookings: stats.statusBreakdown?.find(s => s.booking_status === 'cancelled')?.count || 0,
      completed_bookings: stats.statusBreakdown?.find(s => s.booking_status === 'completed')?.count || 0,
      revenue_generated: stats.totalBookingAmount || 0
    };
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching booking summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking summary',
      error: error.message
    });
  }
});

// Get booking statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const stats = await bookingModel.getBookingStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking stats',
      error: error.message
    });
  }
});

// Test showroom allocation
router.post('/test-allocation', async (req, res) => {
  try {
    const { pincode, city, brand } = req.body;
    const allocation = await bookingModel.testShowroomAllocation(pincode, city, brand);
    res.json({
      success: true,
      data: allocation
    });
  } catch (error) {
    console.error('Error testing showroom allocation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test showroom allocation',
      error: error.message
    });
  }
});

// Delete booking (admin only)
router.delete('/:id', async (req, res) => {
  try {
    await bookingModel.delete(req.params.id);
    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
});

module.exports = router;