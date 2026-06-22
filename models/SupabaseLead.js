const { supabaseAdmin } = require('../supabaseClient');

class SupabaseLead {
  constructor() {
    this.tableName = 'facebook_leads';
    this.supabase = supabaseAdmin;
  }

  // Create a new lead
  async create(leadData) {
    try {
      console.log('Creating Facebook Meta lead in database:', leadData);
      
      // Ensure required fields are present
      if (!leadData.full_name || !leadData.mobile_number) {
        throw new Error('Missing required fields: full_name or mobile_number');
      }

      // If lead_id is provided, check for existing lead to prevent duplicate insertion
      if (leadData.lead_id) {
        const existingLead = await this.getByLeadId(leadData.lead_id);
        if (existingLead) {
          console.log(`Lead with Facebook lead_id ${leadData.lead_id} already exists. Skipping creation.`);
          return existingLead;
        }
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([{
          ...leadData,
          custom_fields: leadData.custom_fields || {}
        }])
        .select();

      if (error) {
        console.error('Supabase create lead error:', error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  // Get all leads (sorted by newest submission date)
  async getAll() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getAll leads error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  // Find lead by system ID
  async getById(id) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Supabase getById lead error for ID ${id}:`, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(`Error fetching lead by ID ${id}:`, error);
      throw error;
    }
  }

  // Find lead by Facebook lead_id
  async getByLeadId(leadId) {
    try {
      if (!leadId) return null;
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('lead_id', leadId)
        .maybeSingle();

      if (error) {
        console.error(`Supabase getByLeadId lead error for Facebook ID ${leadId}:`, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(`Error fetching lead by Facebook lead_id ${leadId}:`, error);
      throw error;
    }
  }

  // Update lead (status, is_hot, details)
  async update(id, updates) {
    try {
      console.log(`Updating lead ${id} with:`, updates);
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Supabase update lead error for ID ${id}:`, error);
        throw error;
      }
      return data[0];
    } catch (error) {
      console.error(`Error updating lead ${id}:`, error);
      throw error;
    }
  }

  // Delete lead
  async delete(id) {
    try {
      console.log(`Deleting lead ${id}`);
      
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Supabase delete lead error for ID ${id}:`, error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error(`Error deleting lead ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new SupabaseLead();
