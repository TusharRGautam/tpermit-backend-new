const { supabaseAdmin } = require('../utils/httpClient');

// Create or access the invoices table
async function ensureInvoiceTable() {
  try {
    console.log('Checking invoices table...');
    
    // Try to access the invoices table
    const { data, error } = await supabaseAdmin.select('invoices', { limit: 1 });
    
    if (error) {
      console.log('Error accessing invoices table, it might not exist yet');
      console.log('Please create the invoices table in the Supabase dashboard');
      console.log('You can find the SQL script in migrations/invoice_table.sql');
      return false;
    }
    
    console.log('Successfully connected to invoices table');
    return true;
  } catch (error) {
    console.error('Error checking invoices table:', error);
    return false;
  }
}

// Create a new invoice
async function createInvoice(invoiceData) {
  try {
    // Calculate on-road price
    const onRoadPrice = calculateOnRoadPrice(invoiceData);
    
    // Map frontend data to database schema
    const dbInvoice = {
      id: invoiceData.id,
      date: invoiceData.date,
      car_model: invoiceData.carModel,
      variant: invoiceData.variant,
      showroom_cost: parseFloat(invoiceData.showroomCost),
      registration: parseFloat(invoiceData.registration),
      insurance: parseFloat(invoiceData.insurance),
      no_plate: parseFloat(invoiceData.noPlate) || null,
      cts: parseFloat(invoiceData.cts) || null,
      gps: parseFloat(invoiceData.gps) || null,
      fastag: parseFloat(invoiceData.fastag) || null,
      speed_governor: parseFloat(invoiceData.speedGovernor) || null,
      accessories: parseFloat(invoiceData.accessories) || null,
      on_road_price: onRoadPrice,
      loan_amount: parseFloat(invoiceData.loanAmount) || null,
      margin: parseFloat(invoiceData.margin) || null,
      process_fee: parseFloat(invoiceData.processFee) || null,
      stamp_duty: parseFloat(invoiceData.stampDuty) || null,
      handling_charge: parseFloat(invoiceData.handlingCharge) || null,
      loan_insurance: parseFloat(invoiceData.loanInsurance) || null,
      customer_name: invoiceData.customerName,
      customer_phone: invoiceData.customerPhone,
      customer_address: invoiceData.customerAddress || null
    };
    
    const { data, error } = await supabaseAdmin.insert('invoices', dbInvoice);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

// Get all invoices
async function getAllInvoices() {
  try {
    const { data, error } = await supabaseAdmin.select('invoices', {
      order: 'date.desc'
    });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

// Get invoice by ID
async function getInvoiceById(id) {
  try {
    const { data, error } = await supabaseAdmin.select('invoices', {
      filter: { column: 'id', value: `eq.${id}` },
      limit: 1
    });
      
    if (error) throw error;
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    throw error;
  }
}

// Update invoice
async function updateInvoice(id, updatedData) {
  try {
    // Format the data to snake_case for the database
    const formattedData = processUpdateFields(updatedData);
    
    // Calculate on-road price if relevant fields are updated
    if (needsOnRoadPriceRecalculation(formattedData)) {
      // First get current invoice data
      const currentInvoice = await getInvoiceById(id);
      if (!currentInvoice) {
        throw new Error(`Invoice with ID ${id} not found`);
      }
      
      // Merge current data with updates to calculate new on-road price
      const mergedData = { ...currentInvoice, ...formattedData };
      formattedData.on_road_price = calculateOnRoadPrice(mergedData);
    }
    
    // Add updated timestamp
    formattedData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabaseAdmin.update(
      'invoices',
      'id',
      `eq.${id}`,
      formattedData
    );
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error(`Error updating invoice with ID ${id}:`, error);
    throw error;
  }
}

// Delete invoice
async function deleteInvoice(id) {
  try {
    const { error } = await supabaseAdmin.delete('invoices', 'id', `eq.${id}`);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting invoice with ID ${id}:`, error);
    throw error;
  }
}

// Helper function to calculate on-road price
function calculateOnRoadPrice(invoiceData) {
  const numericValues = {
    showroomCost: parseFloat(invoiceData.showroomCost || invoiceData.showroom_cost) || 0,
    registration: parseFloat(invoiceData.registration) || 0,
    insurance: parseFloat(invoiceData.insurance) || 0,
    noPlate: parseFloat(invoiceData.noPlate || invoiceData.no_plate) || 0,
    cts: parseFloat(invoiceData.cts) || 0,
    gps: parseFloat(invoiceData.gps) || 0,
    fastag: parseFloat(invoiceData.fastag) || 0,
    speedGovernor: parseFloat(invoiceData.speedGovernor || invoiceData.speed_governor) || 0,
    accessories: parseFloat(invoiceData.accessories) || 0
  };
  
  return numericValues.showroomCost + 
    numericValues.registration + 
    numericValues.insurance + 
    numericValues.noPlate + 
    numericValues.cts + 
    numericValues.gps + 
    numericValues.fastag + 
    numericValues.speedGovernor + 
    numericValues.accessories;
}

// Helper function to determine if on-road price needs recalculation
function needsOnRoadPriceRecalculation(updateData) {
  const fieldsAffectingOnRoadPrice = [
    'showroom_cost', 'showroomCost', 
    'registration', 
    'insurance', 
    'no_plate', 'noPlate', 
    'cts', 
    'gps', 
    'fastag', 
    'speed_governor', 'speedGovernor', 
    'accessories'
  ];
  
  return fieldsAffectingOnRoadPrice.some(field => updateData[field] !== undefined);
}

// Helper function to process update fields
function processUpdateFields(updateData) {
  const processedData = {};
  
  // Map camelCase to snake_case for database fields
  const fieldMappings = {
    carModel: 'car_model',
    showroomCost: 'showroom_cost', 
    noPlate: 'no_plate',
    speedGovernor: 'speed_governor',
    loanAmount: 'loan_amount',
    processFee: 'process_fee',
    stampDuty: 'stamp_duty',
    handlingCharge: 'handling_charge',
    loanInsurance: 'loan_insurance',
    customerName: 'customer_name',
    customerPhone: 'customer_phone',
    customerAddress: 'customer_address'
  };
  
  // Process each field in the update data
  Object.keys(updateData).forEach(key => {
    // Use the mapping if it exists, otherwise use the original key
    const dbField = fieldMappings[key] || key;
    
    // Convert numeric string values to numbers
    const numericFields = [
      'showroom_cost', 'registration', 'insurance', 'no_plate', 
      'cts', 'gps', 'fastag', 'speed_governor', 'accessories', 
      'on_road_price', 'loan_amount', 'margin', 'process_fee', 
      'stamp_duty', 'handling_charge', 'loan_insurance'
    ];
    
    if (numericFields.includes(dbField) && updateData[key] !== null && updateData[key] !== undefined) {
      processedData[dbField] = parseFloat(updateData[key]);
    } else {
      processedData[dbField] = updateData[key];
    }
  });
  
  return processedData;
}

module.exports = {
  ensureInvoiceTable,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
}; 