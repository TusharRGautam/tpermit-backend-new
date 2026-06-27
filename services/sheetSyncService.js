const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const SupabaseLead = require('../models/SupabaseLead');

const CONFIG_FILE = path.join(__dirname, '../sheet_config.json');

// In-memory status & active timer
let syncIntervalId = null;
let syncStatus = {
  url: '',
  lastSyncTime: null,
  lastSyncStatus: 'idle', // 'idle', 'syncing', 'success', 'error'
  lastSyncError: null,
  lastSyncedCount: 0
};

// Helper: Read configuration from local JSON file
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      syncStatus = { ...syncStatus, ...parsed };
    }
  } catch (err) {
    console.error('Error reading sheet_config.json:', err.message);
  }
  return syncStatus;
}

// Helper: Save configuration to local JSON file
function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(syncStatus, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing sheet_config.json:', err.message);
  }
}

// Helper: Parse Google Sheets spreadsheet ID
function extractSpreadsheetId(url) {
  if (!url) return null;
  const matches = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return matches ? matches[1] : null;
}

// Helper: Generate a unique consistent lead_id based on name and mobile number to prevent duplicates
function generateLeadId(fullName, mobileNumber) {
  const cleanPhone = String(mobileNumber || '').replace(/[^0-9]/g, '');
  const cleanName = String(fullName || '').trim().toLowerCase();
  const hash = crypto.createHash('md5')
    .update(`${cleanName}_${cleanPhone}`)
    .digest('hex');
  return `sheet_${hash.substring(0, 16)}`;
}

// Helper: Parse Google Sheets date formats (including Google's Date(y, m, d) expression)
function parseSheetDate(val) {
  if (!val) return new Date().toISOString();
  
  const parsed = Date.parse(val);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }
  
  if (typeof val === 'string' && val.startsWith('Date(')) {
    try {
      const parts = val.substring(5, val.length - 1).split(',').map(p => parseInt(p.trim(), 10));
      // month is 0-indexed in JS Date
      const date = new Date(parts[0], parts[1] || 0, parts[2] || 1, parts[3] || 0, parts[4] || 0, parts[5] || 0);
      return date.toISOString();
    } catch (e) {
      console.warn('Failed to parse Google Sheet Date expression:', val);
    }
  }
  
  return new Date().toISOString();
}

// Helper: Map parsed JSON row columns to lead schema
function mapSheetRowToLead(row) {
  const keys = Object.keys(row);
  const mapped = {
    full_name: 'Google Sheets User',
    mobile_number: 'N/A',
    lead_source: 'Google Sheets',
    status: 'New Lead',
    is_hot: false,
    created_at: new Date().toISOString()
  };
  const custom = {};

  keys.forEach(k => {
    const val = row[k];
    if (val === null || val === undefined || val === '') return;

    const key = k.toLowerCase().replace(/[\s-_]/g, '');

    // Use robust substring/includes checks to support merged Google Sheets headers
    if (key.includes('fullname') || key.includes('customername') || key.includes('leadname') || key === 'name' || key.startsWith('name')) {
      mapped.full_name = String(val).trim();
    } else if (key.includes('phonenumber') || key.includes('mobilenumber') || key.includes('phone') || key.includes('mobile') || key === 'contact' || key === 'number') {
      mapped.mobile_number = String(val).trim();
    } else if (key.includes('email')) {
      mapped.email_address = String(val).trim();
    } else if (key.includes('city')) {
      mapped.city = String(val).trim();
    } else if (key.includes('state')) {
      mapped.state = String(val).trim();
    } else if (key.includes('vehicleinterest') || key.includes('carinterest') || key === 'vehicle' || key === 'car') {
      mapped.vehicle_interest = String(val).trim();
    } else if (key.includes('budget')) {
      mapped.budget = String(val).trim();
    } else if (key.includes('campaignname') || key === 'campaign') {
      mapped.campaign_name = String(val).trim();
    } else if (key.includes('date') || key.includes('createdat') || key.includes('createdtime') || key.includes('timestamp')) {
      mapped.created_at = parseSheetDate(val);
    } else {
      custom[k] = val;
    }
  });

  mapped.lead_id = generateLeadId(mapped.full_name, mapped.mobile_number);
  mapped.custom_fields = custom;

  return mapped;
}

// Perform active sync of Google Sheet
async function syncNow() {
  if (!syncStatus.url) {
    console.log('No Google Sheets URL configured. Skipping synchronization.');
    return { success: false, message: 'No Google Sheets URL configured.' };
  }

  const spreadsheetId = extractSpreadsheetId(syncStatus.url);
  if (!spreadsheetId) {
    const errorMsg = 'Invalid Google Sheets URL. Unable to extract Spreadsheet ID.';
    syncStatus.lastSyncStatus = 'error';
    syncStatus.lastSyncError = errorMsg;
    syncStatus.lastSyncTime = new Date().toISOString();
    saveConfig();
    return { success: false, message: errorMsg };
  }

  try {
    syncStatus.lastSyncStatus = 'syncing';
    saveConfig();

    // Append timestamp cache-buster to force Google to return live data
    const vizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&t=${Date.now()}`;
    console.log(`[Google Sheets Sync] Fetching: ${vizUrl}`);
    
    const response = await axios.get(vizUrl, { timeout: 10000 });
    const responseText = response.data;
    
    const startIdx = responseText.indexOf('{');
    const endIdx = responseText.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) {
      throw new Error('Google Sheet response is not formatted correctly. Please make sure the sheet is shared as "Anyone with the link can view".');
    }
    
    const jsonStr = responseText.substring(startIdx, endIdx + 1);
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.table || !parsed.table.cols || !parsed.table.rows) {
      throw new Error('Google Sheet response lacks columns/rows table structure.');
    }

    let cols = parsed.table.cols.map((col, idx) => ({
      label: (col.label || '').trim().toLowerCase(),
      index: idx
    }));

    // If all labels are empty, try to extract headers from the first data row
    let headerRowIndex = -1;
    const hasEmptyLabels = cols.every(c => !c.label);
    const firstRow = parsed.table.rows[0];

    if (hasEmptyLabels && firstRow && firstRow.c) {
      cols = cols.map(col => {
        const cell = firstRow.c[col.index];
        const val = cell && cell.v !== null && cell.v !== undefined ? String(cell.v) : '';
        return {
          label: val.trim().toLowerCase(),
          index: col.index
        };
      });
      headerRowIndex = 0;
      console.log(`[Google Sheets Sync] Extracted header labels from first row: ${JSON.stringify(cols.map(c => c.label))}`);
    }

    const rows = [];
    parsed.table.rows.forEach((row, rIdx) => {
      if (rIdx === headerRowIndex) return; // skip header row
      const obj = {};
      cols.forEach(col => {
        if (!col.label) return; // skip columns with no headers
        const cell = row.c ? row.c[col.index] : null;
        obj[col.label] = cell ? cell.v : null;
      });
      rows.push(obj);
    });

    console.log(`[Google Sheets Sync] Processed ${rows.length} rows from sheet.`);
    let newLeadsSaved = 0;

    for (const row of rows) {
      const leadData = mapSheetRowToLead(row);

      // Skip invalid placeholders
      if (
        !leadData.full_name || 
        leadData.full_name === 'Google Sheets User' || 
        !leadData.mobile_number || 
        leadData.mobile_number === 'N/A'
      ) {
        continue;
      }

      // Check if lead already exists in DB
      const existing = await SupabaseLead.getByLeadId(leadData.lead_id);
      if (!existing) {
        await SupabaseLead.create(leadData);
        newLeadsSaved++;
      }
    }

    console.log(`[Google Sheets Sync] Successfully synced. Saved ${newLeadsSaved} new lead(s).`);

    syncStatus.lastSyncStatus = 'success';
    syncStatus.lastSyncError = null;
    syncStatus.lastSyncTime = new Date().toISOString();
    syncStatus.lastSyncedCount = newLeadsSaved;
    saveConfig();

    return { 
      success: true, 
      message: `Sync complete. Imported ${newLeadsSaved} new leads.`,
      newLeadsSaved 
    };

  } catch (err) {
    console.error('[Google Sheets Sync] Synchronization failed:', err.message);
    syncStatus.lastSyncStatus = 'error';
    syncStatus.lastSyncError = err.message;
    syncStatus.lastSyncTime = new Date().toISOString();
    saveConfig();
    return { success: false, message: err.message };
  }
}

// Start interval background syncing
function startSyncInterval() {
  readConfig();
  
  // Stop existing timer if any
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
  }

  if (syncStatus.url) {
    console.log(`[Google Sheets Sync] Initializing background scheduler for: ${syncStatus.url}`);
    
    // Immediately run one sync cycle at startup
    syncNow().catch(err => console.error('Startup sync failed:', err.message));
    
    // Set 30-second interval
    syncIntervalId = setInterval(() => {
      console.log('[Google Sheets Sync] Periodic sync interval triggered...');
      syncNow().catch(err => console.error('Interval sync failed:', err.message));
    }, 30000);
  }
}

// Stop interval background syncing
function stopSyncInterval() {
  if (syncIntervalId) {
    console.log('[Google Sheets Sync] Background scheduler stopped.');
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

// Set URL and trigger sync immediately
async function configureUrl(url) {
  syncStatus.url = url ? url.trim() : '';
  syncStatus.lastSyncTime = null;
  syncStatus.lastSyncStatus = 'idle';
  syncStatus.lastSyncError = null;
  syncStatus.lastSyncedCount = 0;
  saveConfig();

  if (syncStatus.url) {
    startSyncInterval();
    return await syncNow();
  } else {
    stopSyncInterval();
    return { success: true, message: 'Google Sheets sync disabled.' };
  }
}

module.exports = {
  readConfig,
  syncNow,
  startSyncInterval,
  stopSyncInterval,
  configureUrl
};
