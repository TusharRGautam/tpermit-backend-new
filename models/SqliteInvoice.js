// SQLite implementation of Invoice model
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create a SQLite database connection
const dbPath = path.join(dataDir, 'invoice.db');
const db = new sqlite3.Database(dbPath);

// Promisify SQLite queries
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// Create invoice table if it doesn't exist
async function ensureInvoiceTable() {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        car_model TEXT NOT NULL,
        variant TEXT NOT NULL,
        showroom_cost REAL NOT NULL,
        registration REAL NOT NULL,
        insurance REAL NOT NULL,
        no_plate REAL,
        cts REAL,
        gps REAL,
        fastag REAL,
        speed_governor REAL,
        accessories REAL,
        on_road_price REAL NOT NULL,
        loan_amount REAL,
        margin REAL,
        process_fee REAL,
        stamp_duty REAL,
        handling_charge REAL,
        loan_insurance REAL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes if they don't exist
    await run('CREATE INDEX IF NOT EXISTS idx_invoices_customer_phone ON invoices(customer_phone)');
    await run('CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date)');

    console.log('SQLite invoice table setup complete');
    return { success: true };
  } catch (error) {
    console.error('Error setting up SQLite invoice table:', error);
    return { success: false, error };
  }
}

// CRUD Operations
async function getAllInvoices() {
  try {
    const invoices = await all('SELECT * FROM invoices ORDER BY date DESC');
    return { data: invoices, error: null };
  } catch (error) {
    console.error('Error getting all invoices:', error);
    return { data: null, error };
  }
}

async function getInvoiceById(id) {
  try {
    const invoice = await get('SELECT * FROM invoices WHERE id = ?', [id]);
    return { data: invoice, error: null };
  } catch (error) {
    console.error('Error getting invoice by id:', error);
    return { data: null, error };
  }
}

async function createInvoice(invoiceData) {
  try {
    // Generate fields and placeholders for SQL query
    const fields = Object.keys(invoiceData).join(', ');
    const placeholders = Object.keys(invoiceData).map(() => '?').join(', ');
    const values = Object.values(invoiceData);

    const result = await run(
      `INSERT INTO invoices (${fields}) VALUES (${placeholders})`,
      values
    );

    return { data: { id: invoiceData.id }, error: null };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { data: null, error };
  }
}

async function updateInvoice(id, invoiceData) {
  try {
    // Generate SET clause for SQL update query
    const setClause = Object.keys(invoiceData)
      .map(field => `${field} = ?`)
      .join(', ');
    const values = [...Object.values(invoiceData), id];

    await run(
      `UPDATE invoices SET ${setClause} WHERE id = ?`,
      values
    );

    return { data: { id }, error: null };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { data: null, error };
  }
}

async function deleteInvoice(id) {
  try {
    await run('DELETE FROM invoices WHERE id = ?', [id]);
    return { error: null };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { error };
  }
}

module.exports = {
  ensureInvoiceTable,
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
}; 