const { supabaseAdmin } = require('../supabaseClient');

class SupabaseReceipt {
  constructor() {
    this.tableName = 'payment_receipts';
    this.supabase = supabaseAdmin;
  }

  // Create a new receipt
  async create(receiptData) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([receiptData])
        .select();

      if (error) {
        console.error('Database error details:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  }

  // Get all receipts
  async getAll() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting receipts:', error);
      throw error;
    }
  }

  // Find a receipt by ID
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

      return data;
    } catch (error) {
      console.error(`Error finding receipt by ID ${id}:`, error);
      throw error;
    }
  }

  // Find receipt by receipt number
  async findByReceiptNumber(receiptNumber) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('receipt_number', receiptNumber)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error finding receipt by number ${receiptNumber}:`, error);
      throw error;
    }
  }

  // Update a receipt
  async update(id, receiptData) {
    try {
      // Ensure updated_at is set to current time
      receiptData.updated_at = new Date().toISOString();

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(receiptData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error(`Error updating receipt ${id}:`, error);
      throw error;
    }
  }

  // Delete a receipt
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
      console.error(`Error deleting receipt ${id}:`, error);
      throw error;
    }
  }

  // Search receipts
  async search(searchTerm) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`customer_name.ilike.%${searchTerm}%,mobile_number.ilike.%${searchTerm}%,car_model.ilike.%${searchTerm}%,receipt_number.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching receipts:', error);
      throw error;
    }
  }

  // Get next receipt number
  async getNextReceiptNumber() {
    try {
      // Try using RPC function first
      const { data: rpcData, error: rpcError } = await this.supabase
        .rpc('get_next_receipt_number');

      if (!rpcError && rpcData) {
        return rpcData;
      }

      // Fallback: get it manually
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('receipt_number')
        .order('receipt_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].receipt_number.replace('GM', ''));
        const nextNumber = lastNumber + 1;
        return `GM${String(nextNumber).padStart(3, '0')}`;
      }

      return 'GM500'; // Default starting number
    } catch (error) {
      console.error('Error getting next receipt number:', error);
      return 'GM500'; // Fallback
    }
  }
}

module.exports = SupabaseReceipt;
