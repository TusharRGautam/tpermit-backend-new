const { supabaseAdmin } = require('../supabaseClient');
const Showroom = require('./Showroom');
const ShowroomContact = require('./ShowroomContact');

class SupabaseShowroom {
  constructor() {
    this.tableName = 'showrooms';
    this.contactsTableName = 'showroom_contacts';
    this.supabase = supabaseAdmin;
  }

  async create(showroomData) {
    try {
      const showroom = new Showroom(showroomData);
      
      if (!showroom.isValid()) {
        throw new Error('Invalid showroom data');
      }
      
      const dbData = showroom.toDatabase();
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([dbData])
        .select();
        
      if (error) {
        console.error('Database error details:', error);
        throw error;
      }
      
      return data[0] ? Showroom.fromDatabase(data[0]) : null;
    } catch (error) {
      console.error('Error creating showroom:', error);
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
      
      return data ? Showroom.fromDatabase(data) : null;
    } catch (error) {
      console.error(`Error finding showroom by ID ${id}:`, error);
      throw error;
    }
  }

  async findByIdWithContacts(id) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          showroom_contacts (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!data) return null;
      
      const showroom = Showroom.fromDatabase(data);
      const contacts = data.showroom_contacts?.map(contact => ShowroomContact.fromDatabase(contact)) || [];
      
      return {
        ...showroom.toJSON(),
        contacts
      };
    } catch (error) {
      console.error(`Error finding showroom with contacts by ID ${id}:`, error);
      throw error;
    }
  }

  async update(id, showroomData) {
    try {
      showroomData.updated_at = new Date().toISOString();
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(showroomData)
        .eq('id', id)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0] ? Showroom.fromDatabase(data[0]) : null;
    } catch (error) {
      console.error(`Error updating showroom ${id}:`, error);
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
      console.error(`Error deleting showroom ${id}:`, error);
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
      
      return data.map(item => Showroom.fromDatabase(item));
    } catch (error) {
      console.error('Error getting all showrooms:', error);
      throw error;
    }
  }

  async getAllWithContacts() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          showroom_contacts (*)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map(item => {
        const showroom = Showroom.fromDatabase(item);
        const contacts = item.showroom_contacts?.map(contact => ShowroomContact.fromDatabase(contact)) || [];
        return {
          ...showroom.toJSON(),
          contacts
        };
      });
    } catch (error) {
      console.error('Error getting all showrooms with contacts:', error);
      throw error;
    }
  }

  async getByBrand(brand) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .ilike('brand', `%${brand}%`)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map(item => Showroom.fromDatabase(item));
    } catch (error) {
      console.error(`Error getting showrooms by brand ${brand}:`, error);
      throw error;
    }
  }

  async addContact(showroomId, contactData) {
    try {
      const contact = new ShowroomContact({
        ...contactData,
        showroom_id: showroomId
      });
      
      if (!contact.isValid()) {
        throw new Error('Invalid contact data');
      }
      
      const dbData = contact.toDatabase();
      
      const { data, error } = await this.supabase
        .from(this.contactsTableName)
        .insert([dbData])
        .select();
        
      if (error) {
        console.error('Database error details:', error);
        throw error;
      }
      
      return data[0] ? ShowroomContact.fromDatabase(data[0]) : null;
    } catch (error) {
      console.error('Error adding showroom contact:', error);
      throw error;
    }
  }

  async updateContact(contactId, contactData) {
    try {
      contactData.updated_at = new Date().toISOString();
      
      const { data, error } = await this.supabase
        .from(this.contactsTableName)
        .update(contactData)
        .eq('id', contactId)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0] ? ShowroomContact.fromDatabase(data[0]) : null;
    } catch (error) {
      console.error(`Error updating contact ${contactId}:`, error);
      throw error;
    }
  }

  async deleteContact(contactId) {
    try {
      const { error } = await this.supabase
        .from(this.contactsTableName)
        .delete()
        .eq('id', contactId);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting contact ${contactId}:`, error);
      throw error;
    }
  }

  async getContactsByShowroom(showroomId) {
    try {
      const { data, error } = await this.supabase
        .from(this.contactsTableName)
        .select('*')
        .eq('showroom_id', showroomId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data.map(item => ShowroomContact.fromDatabase(item));
    } catch (error) {
      console.error(`Error getting contacts for showroom ${showroomId}:`, error);
      throw error;
    }
  }
}

module.exports = SupabaseShowroom;