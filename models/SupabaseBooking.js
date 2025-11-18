const { supabaseAdmin } = require('../supabaseClient');
const Booking = require('./Booking');

class SupabaseBooking {
  constructor() {
    this.tableName = 'Booking-Relationship-Allocation';
    this.supabase = supabaseAdmin;
  }

  async create(bookingData) {
    try {
      console.log('Creating booking with data:', bookingData);
      
      const booking = new Booking(bookingData);
      
      if (!booking.isValid()) {
        throw new Error('Invalid booking data: ' + JSON.stringify({
          name: booking.customer_name,
          phone: booking.customer_phone,
          email: booking.customer_email,
          city: booking.customer_city,
          pincode: booking.customer_pincode,
          brand: booking.car_brand,
          model: booking.car_model,
          amount: booking.booking_amount
        }));
      }
      
      const dbData = booking.toDatabase();
      
      // Generate booking reference ID if not provided
      if (!dbData.booking_reference_id) {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        dbData.booking_reference_id = `BKG-${year}-${timestamp}`;
      }
      
      console.log('Inserting booking data:', dbData);
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([dbData])
        .select();
        
      if (error) {
        console.error('Database error details:', error);
        throw error;
      }
      
      console.log('Booking created successfully:', data[0]);
      return data[0] ? Booking.fromDatabase(data[0]) : null;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data ? Booking.fromDatabase(data) : null;
    } catch (error) {
      console.error(`Error finding booking by ID ${id}:`, error);
      throw error;
    }
  }

  async findByReferenceId(referenceId) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('booking_reference_id', referenceId)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data ? Booking.fromDatabase(data) : null;
    } catch (error) {
      console.error(`Error finding booking by reference ID ${referenceId}:`, error);
      throw error;
    }
  }

  async update(id, bookingData) {
    try {
      bookingData.updated_at = new Date().toISOString();
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(bookingData)
        .eq('id', id)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0] ? Booking.fromDatabase(data[0]) : null;
    } catch (error) {
      console.error(`Error updating booking ${id}:`, error);
      throw error;
    }
  }

  async updatePaymentStatus(bookingId, paymentData) {
    try {
      const updateData = {
        payment_status: paymentData.status,
        payment_reference_id: paymentData.reference_id,
        payment_date: paymentData.date || new Date().toISOString(),
        payment_gateway: paymentData.gateway,
        payment_method: paymentData.method,
        updated_at: new Date().toISOString()
      };

      // If payment is successful, update booking status
      if (paymentData.status === 'paid') {
        updateData.booking_status = 'confirmed';
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', bookingId)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0] ? Booking.fromDatabase(data[0]) : null;
    } catch (error) {
      console.error(`Error updating payment status for booking ${bookingId}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting booking ${id}:`, error);
      throw error;
    }
  }

  async getAll() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map(item => Booking.fromDatabase(item));
    } catch (error) {
      console.error('Error getting all bookings:', error);
      throw error;
    }
  }

  async getByStatus(status) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('booking_status', status)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map(item => Booking.fromDatabase(item));
    } catch (error) {
      console.error(`Error getting bookings by status ${status}:`, error);
      throw error;
    }
  }

  async getByCustomer(customerEmail) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map(item => Booking.fromDatabase(item));
    } catch (error) {
      console.error(`Error getting bookings by customer ${customerEmail}:`, error);
      throw error;
    }
  }

  async getByShowroom(showroomId) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('allocated_showroom_id', showroomId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map(item => Booking.fromDatabase(item));
    } catch (error) {
      console.error(`Error getting bookings by showroom ${showroomId}:`, error);
      throw error;
    }
  }

  async getBookingSummary() {
    try {
      const { data, error } = await this.supabase
        .from('booking_summary')
        .select('*')
        .limit(50);
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting booking summary:', error);
      throw error;
    }
  }

  async getBookingStats() {
    try {
      // Get booking counts by status
      const { data: statusStats, error: statusError } = await this.supabase
        .from(this.tableName)
        .select('booking_status, count(*)')
        .group('booking_status');

      if (statusError) throw statusError;

      // Get payment stats
      const { data: paymentStats, error: paymentError } = await this.supabase
        .from(this.tableName)
        .select('payment_status, count(*)')
        .group('payment_status');

      if (paymentError) throw paymentError;

      // Get total booking amount
      const { data: amountData, error: amountError } = await this.supabase
        .from(this.tableName)
        .select('booking_amount')
        .eq('payment_status', 'paid');

      if (amountError) throw amountError;

      const totalAmount = amountData?.reduce((sum, item) => sum + (item.booking_amount || 0), 0) || 0;

      return {
        statusBreakdown: statusStats,
        paymentBreakdown: paymentStats,
        totalBookingAmount: totalAmount,
        totalBookings: statusStats?.reduce((sum, item) => sum + item.count, 0) || 0
      };
    } catch (error) {
      console.error('Error getting booking stats:', error);
      throw error;
    }
  }

  // Test showroom allocation manually
  async testShowroomAllocation(pincode, city, brand) {
    try {
      const { data, error } = await this.supabase
        .rpc('allocate_showroom_for_booking', {
          p_pincode: pincode,
          p_city: city,
          p_car_brand: brand
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error testing showroom allocation:', error);
      throw error;
    }
  }
}

module.exports = SupabaseBooking;