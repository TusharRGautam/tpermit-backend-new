const { supabaseAdmin } = require('../supabaseClient');
const Quotation = require('./Quotation');

class SupabaseQuotation {
  constructor() {
    this.tableName = 'quotations';
    this.supabase = supabaseAdmin;
  }

  // Create a new quotation
  async create(quotationData) {
    try {
      const quotation = new Quotation(quotationData);
      
      if (!quotation.isValid()) {
        throw new Error('Invalid quotation data');
      }
      
      // Convert quotation data to database format
      const dbData = quotation.toDatabase();
      
      // Log the vendor_id type and value for debugging
      console.log('Vendor ID type:', typeof dbData.vendor_id);
      console.log('Vendor ID value:', dbData.vendor_id);
      
      // Ensure vendor_id is treated as a string and explicitly cast in SQL
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([{ 
          ...dbData, 
          vendor_id: String(dbData.vendor_id)
        }])
        .select();
        
      if (error) {
        console.error('Database error details:', error);
        throw error;
      }
      
      return data[0] ? Quotation.fromDatabase(data[0]) : null;
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  }

  // Find a quotation by vendor_id
  async findById(vendorId) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('vendor_id', String(vendorId))
        .single();
        
      if (error) {
        throw error;
      }
      
      return data ? Quotation.fromDatabase(data) : null;
    } catch (error) {
      console.error(`Error finding quotation by ID ${vendorId}:`, error);
      throw error;
    }
  }

  // Update a quotation
  async update(vendorId, quotationData) {
    try {
      // Ensure updated_at is set to current time
      quotationData.updated_at = new Date().toISOString();
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(quotationData)
        .eq('vendor_id', String(vendorId))
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0] ? Quotation.fromDatabase(data[0]) : null;
    } catch (error) {
      console.error(`Error updating quotation ${vendorId}:`, error);
      throw error;
    }
  }

  // Delete a quotation
  async delete(vendorId) {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('vendor_id', String(vendorId));
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting quotation ${vendorId}:`, error);
      throw error;
    }
  }

  // Get all quotations
  async getAll() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map(item => Quotation.fromDatabase(item));
    } catch (error) {
      console.error('Error getting all quotations:', error);
      throw error;
    }
  }

  // Get quotations by car model
  async getByCarModel(carModel) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .ilike('car_model', `%${carModel}%`)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map(item => Quotation.fromDatabase(item));
    } catch (error) {
      console.error(`Error getting quotations by car model ${carModel}:`, error);
      throw error;
    }
  }
}

module.exports = SupabaseQuotation;