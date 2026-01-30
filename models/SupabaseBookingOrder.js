const { supabaseAdmin } = require('../supabaseClient');

class SupabaseBookingOrder {
  constructor() {
    this.tableName = 'booking_orders';
    this.supabase = supabaseAdmin;
  }

  // Generate next order number
  async getNextOrderNumber() {
    try {
      // 1. Get max from Booking Orders
      const { data: orderData, error: orderError } = await this.supabase
        .from('booking_orders')
        .select('order_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (orderError) throw orderError;
      
      // 2. Get max from Payment Receipts to ensure synchronization
      const { data: receiptData, error: receiptError } = await this.supabase
        .from('payment_receipts')
        .select('receipt_number')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (receiptError) throw receiptError;

      let maxNum = 0;

      // Check Order Max
      if (orderData && orderData.length > 0 && orderData[0].order_number) {
          // Extract digits only
          const nums = orderData[0].order_number.replace(/\D/g, '');
          const val = parseInt(nums);
          if (!isNaN(val)) maxNum = Math.max(maxNum, val);
      }
      
      // Check Receipt Max
      if (receiptData && receiptData.length > 0 && receiptData[0].receipt_number) {
           const nums = receiptData[0].receipt_number.replace(/\D/g, '');
           const val = parseInt(nums);
           if (!isNaN(val)) maxNum = Math.max(maxNum, val);
      }
      
      // Default start if nothing exists
      if (maxNum === 0) return 'BO0522';
      
      const nextNumber = maxNum + 1;
      // Use BO prefix for everything now to maintain consistency
      return `BO${nextNumber.toString().padStart(4, '0')}`;

    } catch (error) {
      console.error('Error fetching next order number:', error);
      // Fallback
      return 'BO0522';
    }
  }

  // Create new booking order
  async create(orderData) {
    try {
      console.log('Creating booking order with data:', orderData);
      
      // Ensure required fields are present
      const requiredFields = ['order_number', 'order_date', 'company_name', 'car_model', 'color', 'rto_passing', 'customer_name', 'customer_address'];
      for (const field of requiredFields) {
        if (!orderData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([orderData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error creating booking order:', error);
      throw error;
    }
  }

  // Get all booking orders
  async getAll() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching booking orders:', error);
      throw error;
    }
  }

  // Get booking order by ID
  async getById(id) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching booking order ${id}:`, error);
      throw error;
    }
  }
  // Delete booking order
  async delete(id) {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting booking order ${id}:`, error);
      throw error;
    }
  }


  // Update booking order
  async update(id, updates) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error updating booking order ${id}:`, error);
      throw error;
    }
  }
}

module.exports = SupabaseBookingOrder;
