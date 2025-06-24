require('dotenv').config();
const https = require('https');
const axios = require('axios');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Direct HTTP client for Supabase
class SupabaseHttpClient {
  constructor(useServiceRole = true) {
    this.baseUrl = supabaseUrl;
    this.apiKey = useServiceRole ? supabaseKey : supabaseAnonKey;
    this.axios = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  // Generic query method for tables
  async query(table, method, params = {}) {
    const url = `/rest/v1/${table}`;
    try {
      let response;
      
      switch(method.toLowerCase()) {
        case 'select':
          response = await this.axios.get(url, {
            params: {
              ...params.select && { select: params.select },
              ...params.filter && { [params.filter.column]: params.filter.value },
              ...params.order && { order: params.order },
              ...params.limit && { limit: params.limit }
            }
          });
          break;
          
        case 'insert':
          response = await this.axios.post(url, params.data, {
            params: {
              ...params.returning && { returning: 'representation' }
            }
          });
          break;
          
        case 'update':
          response = await this.axios.patch(
            `${url}?${params.filter.column}=eq.${encodeURIComponent(params.filter.value)}`,
            params.data,
            {
              params: {
                ...params.returning && { returning: 'representation' }
              }
            }
          );
          break;
          
        case 'delete':
          response = await this.axios.delete(
            `${url}?${params.filter.column}=eq.${encodeURIComponent(params.filter.value)}`
          );
          break;
          
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error(`Error in ${method} operation:`, error.message);
      return { 
        data: null, 
        error: {
          message: error.message,
          details: error.response?.data || error.toString(),
          status: error.response?.status
        } 
      };
    }
  }
  
  // Convenience methods
  async select(table, options = {}) {
    return this.query(table, 'select', options);
  }
  
  async insert(table, data, returning = true) {
    return this.query(table, 'insert', { data, returning });
  }
  
  async update(table, column, value, data, returning = true) {
    return this.query(table, 'update', {
      filter: { column, value },
      data,
      returning
    });
  }
  
  async delete(table, column, value) {
    return this.query(table, 'delete', {
      filter: { column, value }
    });
  }
  
  // Execute raw SQL
  async executeSql(sqlQuery) {
    try {
      const response = await this.axios.post('/rest/v1/rpc/exec_sql', {
        query: sqlQuery
      });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error executing SQL:', error.message);
      return { 
        data: null, 
        error: {
          message: error.message,
          details: error.response?.data || error.toString(),
          status: error.response?.status
        } 
      };
    }
  }
}

module.exports = {
  SupabaseHttpClient,
  supabaseAdmin: new SupabaseHttpClient(true),
  supabaseClient: new SupabaseHttpClient(false)
}; 