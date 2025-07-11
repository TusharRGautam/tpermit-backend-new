const { pgPool } = require('../utils/pgClient');

// Get all invoices
async function getAllInvoices() {
  const client = await pgPool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM invoices ORDER BY date DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get invoice by ID
async function getInvoiceById(id) {
  const client = await pgPool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM invoices WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Create a new invoice
async function createInvoice(invoiceData) {
  const client = await pgPool.connect();
  try {
    // Calculate on-road price
    const onRoadPrice = calculateOnRoadPrice(invoiceData);
    
    // Map frontend data to database schema
    const result = await client.query(`
      INSERT INTO invoices (
        id, date, car_model, variant, 
        showroom_cost, registration, insurance, 
        no_plate, cts, gps, fastag, 
        speed_governor, accessories, on_road_price,
        loan_amount, margin, process_fee,
        stamp_duty, handling_charge, loan_insurance,
        customer_name, customer_phone, customer_address
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20,
        $21, $22, $23
      ) RETURNING *
    `, [
      invoiceData.id,
      invoiceData.date,
      invoiceData.carModel,
      invoiceData.variant,
      parseFloat(invoiceData.showroomCost),
      parseFloat(invoiceData.registration),
      parseFloat(invoiceData.insurance),
      parseFloat(invoiceData.noPlate) || null,
      parseFloat(invoiceData.cts) || null,
      parseFloat(invoiceData.gps) || null,
      parseFloat(invoiceData.fastag) || null,
      parseFloat(invoiceData.speedGovernor) || null,
      parseFloat(invoiceData.accessories) || null,
      onRoadPrice,
      parseFloat(invoiceData.loanAmount) || null,
      parseFloat(invoiceData.margin) || null,
      parseFloat(invoiceData.processFee) || null,
      parseFloat(invoiceData.stampDuty) || null,
      parseFloat(invoiceData.handlingCharge) || null,
      parseFloat(invoiceData.loanInsurance) || null,
      invoiceData.customerName,
      invoiceData.customerPhone,
      invoiceData.customerAddress || null
    ]);
    
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Update invoice
async function updateInvoice(id, updatedData) {
  const client = await pgPool.connect();
  try {
    // Get the current invoice data
    const currentInvoice = await getInvoiceById(id);
    if (!currentInvoice) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    
    // Format the data to snake_case for the database
    const formattedData = processUpdateFields(updatedData);
    
    // Calculate on-road price if relevant fields are updated
    if (needsOnRoadPriceRecalculation(formattedData)) {
      const mergedData = { ...currentInvoice, ...formattedData };
      formattedData.on_road_price = calculateOnRoadPrice(mergedData);
    }
    
    // Build the query dynamically based on what fields are provided
    const updates = [];
    const values = [id]; // First parameter is the ID
    let paramIndex = 2; // Start parameter index from 2
    
    // Add updated_at timestamp
    formattedData.updated_at = new Date().toISOString();
    
    // Build the SET clause and parameter values
    Object.keys(formattedData).forEach(key => {
      updates.push(`${key} = $${paramIndex}`);
      values.push(formattedData[key]);
      paramIndex++;
    });
    
    // Execute the query only if there are fields to update
    if (updates.length > 0) {
      const query = `
        UPDATE invoices 
        SET ${updates.join(', ')}
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await client.query(query, values);
      return { success: true, data: result.rows[0] };
    } else {
      return { success: true, data: currentInvoice, message: 'No updates provided' };
    }
  } catch (error) {
    console.error(`Error updating invoice with ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Delete invoice
async function deleteInvoice(id) {
  const client = await pgPool.connect();
  try {
    await client.query('DELETE FROM invoices WHERE id = $1', [id]);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting invoice with ID ${id}:`, error);
    throw error;
  } finally {
    client.release();
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
  
  // Apply TCS rules: Only include if Ex-Showroom > ₹10,00,000
  const tcsAmount = numericValues.showroomCost > 1000000 ? numericValues.cts : 0;
  
  // Calculate On-Road Price excluding Number Plate/CRTm/AutoCard charges
  return numericValues.showroomCost + 
    numericValues.registration + 
    numericValues.insurance + 
    // Note: noPlate (number_plate_crtm_autocard) is excluded from On-Road Price
    tcsAmount + 
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
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
}; 