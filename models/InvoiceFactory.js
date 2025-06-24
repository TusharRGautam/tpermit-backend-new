// Invoice Factory - Provides the best available implementation of the Invoice model

// Import all implementations
const SupabaseInvoice = require('./Invoice');
const PgInvoice = require('./PgInvoice');
const SqliteInvoice = require('./SqliteInvoice');

// Default to the Supabase implementation
let currentImplementation = 'supabase';
let invoiceModel = SupabaseInvoice;

/**
 * Switch between implementations based on what's working
 * @param {string} implementation - 'supabase', 'postgres', or 'sqlite'
 */
function useImplementation(implementation) {
  if (implementation === 'postgres') {
    currentImplementation = 'postgres';
    invoiceModel = PgInvoice;
    console.log('Using PostgreSQL direct implementation for invoices');
    return true;
  } else if (implementation === 'sqlite') {
    currentImplementation = 'sqlite';
    invoiceModel = SqliteInvoice;
    console.log('Using SQLite local implementation for invoices');
    return true;
  } else {
    currentImplementation = 'supabase';
    invoiceModel = SupabaseInvoice;
    console.log('Using Supabase REST API implementation for invoices');
    return true;
  }
}

/**
 * Auto-detect which implementation to use
 * @returns {Promise<string>} - The implementation that was selected
 */
async function autoDetectImplementation() {
  try {
    // Check if a specific implementation is requested in the environment
    const forcedImplementation = process.env.DB_IMPLEMENTATION || 'auto';
    if (forcedImplementation !== 'auto') {
      console.log(`Using specified database implementation: ${forcedImplementation}`);
      useImplementation(forcedImplementation);
      return forcedImplementation;
    }
    
    // Check if direct PostgreSQL connection should be skipped
    const skipPgDirect = process.env.SKIP_PG_DIRECT === 'true' || false;
    
    // Try PostgreSQL direct connection if not skipped
    if (!skipPgDirect) {
      try {
        console.log('Testing PostgreSQL direct connection...');
        const pgClient = require('../utils/pgClient');
        const pgResult = await pgClient.testDirectConnection();
        
        if (pgResult.success) {
          useImplementation('postgres');
          return 'postgres';
        }
      } catch (error) {
        if (error.code === 'ENOTFOUND') {
          console.log('PostgreSQL direct connection: Could not resolve hostname (DNS lookup failed)');
        } else {
          console.log('PostgreSQL direct connection failed:', error.message);
        }
      }
    } else {
      console.log('Skipping PostgreSQL direct connection test (SKIP_PG_DIRECT=true)');
    }
    
    // Try Supabase
    console.log('Testing Supabase connection...');
    try {
      const { supabaseAdmin } = require('../utils/httpClient');
      const supabaseResult = await supabaseAdmin.select('invoices', { limit: 1 });
      
      if (!supabaseResult.error) {
        useImplementation('supabase');
        return 'supabase';
      } else {
        console.log('Supabase connection error:', supabaseResult.error.message);
      }
    } catch (error) {
      console.log('Supabase connection error:', error.message);
    }
    
    // If both failed, fall back to SQLite
    console.log('Remote connections unavailable, using SQLite as fallback');
    useImplementation('sqlite');
    
    // Initialize SQLite database
    await SqliteInvoice.ensureInvoiceTable();
    
    return 'sqlite';
  } catch (error) {
    console.log('Error auto-detecting implementation:', error.message);
    console.log('Defaulting to SQLite implementation for offline use');
    useImplementation('sqlite');
    
    // Initialize SQLite database
    await SqliteInvoice.ensureInvoiceTable();
    
    return 'sqlite';
  }
}

// Export a proxy that forwards all calls to the current implementation
module.exports = {
  // Invoice table management
  ensureInvoiceTable: async (...args) => {
    if (currentImplementation === 'supabase') {
      return await invoiceModel.ensureInvoiceTable(...args);
    } else if (currentImplementation === 'postgres') {
      // For PostgreSQL, we use the pgClient directly
      const pgClient = require('../utils/pgClient');
      return await pgClient.createInvoiceTable(...args);
    } else {
      // For SQLite
      return await invoiceModel.ensureInvoiceTable(...args);
    }
  },
  
  // CRUD operations - these have consistent API across implementations
  getAllInvoices: async (...args) => await invoiceModel.getAllInvoices(...args),
  getInvoiceById: async (...args) => await invoiceModel.getInvoiceById(...args),
  createInvoice: async (...args) => await invoiceModel.createInvoice(...args),
  updateInvoice: async (...args) => await invoiceModel.updateInvoice(...args),
  deleteInvoice: async (...args) => await invoiceModel.deleteInvoice(...args),
  
  // Implementation management
  getCurrentImplementation: () => currentImplementation,
  useImplementation,
  autoDetectImplementation
}; 