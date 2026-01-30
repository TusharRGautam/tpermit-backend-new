const { supabaseAdmin } = require('../supabaseClient');

class SupabaseProformaInvoice {
  constructor() {
    this.tableName = 'proforma_invoices';
    this.supabase = supabaseAdmin;
  }

  // Create a new proforma invoice
  async create(invoiceData) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([invoiceData])
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error creating proforma invoice:', error);
      throw error;
    }
  }

  // Get all proforma invoices
  async getAll() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, booking_orders(company_name)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting proforma invoices:', error);
      throw error;
    }
  }

  // Find by ID
  async findById(id) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error finding proforma ${id}:`, error);
      throw error;
    }
  }

  // Delete
  async delete(id) {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting proforma ${id}:`, error);
      throw error;
    }
  }

  // Get next serial number (starts from 13000)
  async getNextSerialNumber() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('serial_number')
        .order('created_at', { ascending: false }) // Order by creation to get latest
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return 'PI13000'; // Default start
      }

      const lastSerial = data[0].serial_number;
      // Extract number part: PI13000 -> 13000
      const numberPart = parseInt(lastSerial.replace(/\D/g, ''));
      
      if (isNaN(numberPart)) {
         return 'PI13000';
      }

      return `PI${numberPart + 1}`;
    } catch (error) {
      console.error('Error fetching next serial number:', error);
      return 'PI13000';

    }
  }

  // Update proforma invoice
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
      console.error(`Error updating proforma ${id}:`, error);
      throw error;
    }
  }
}

module.exports = SupabaseProformaInvoice;
