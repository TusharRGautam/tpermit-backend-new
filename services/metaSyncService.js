const axios = require('axios');
const SupabaseLead = require('../models/SupabaseLead');

let syncIntervalId = null;
let isSyncing = false;

// Helper to parse Facebook field data array
function parseMetaFieldData(fieldData) {
  const mapped = {};
  const custom = {};
  
  if (Array.isArray(fieldData)) {
    fieldData.forEach(item => {
      const name = item.name.toLowerCase();
      const val = item.values && item.values[0];
      
      if (name && val) {
        if (name === 'full_name' || name === 'name' || name === 'fullname') {
          mapped.full_name = val;
        } else if (name === 'phone_number' || name === 'phone' || name === 'mobile_number' || name === 'mobile') {
          mapped.mobile_number = val;
        } else if (name === 'email' || name === 'email_address') {
          mapped.email_address = val;
        } else if (name === 'city') {
          mapped.city = val;
        } else if (name === 'state') {
          mapped.state = val;
        } else if (name === 'vehicle_interest' || name === 'vehicle' || name === 'car' || name === 'car_interest') {
          mapped.vehicle_interest = val;
        } else if (name === 'budget') {
          mapped.budget = val;
        } else {
          custom[item.name] = val;
        }
      }
    });
  }
  
  return { mapped, custom };
}

// Perform historical lead sync from Meta Graph API
async function syncNow() {
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken) {
    console.log('[Meta Ads Sync] META_PAGE_ACCESS_TOKEN is not configured in .env. Skipping background sync.');
    return { success: false, message: 'META_PAGE_ACCESS_TOKEN is not configured' };
  }

  if (isSyncing) {
    console.log('[Meta Ads Sync] Previous sync is still running. Skipping this cycle.');
    return { success: false, message: 'Sync in progress' };
  }

  isSyncing = true;
  try {
    console.log('[Meta Ads Sync] Starting background sync...');
    
    // Fetch managed accounts
    let managedPagesMap = {};
    try {
      const accountsResponse = await axios.get(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token&access_token=${pageAccessToken}`
      );
      if (accountsResponse.data && Array.isArray(accountsResponse.data.data)) {
        accountsResponse.data.data.forEach(p => {
          managedPagesMap[String(p.id)] = {
            name: p.name,
            access_token: p.access_token
          };
        });
      }
    } catch (accountsError) {
      console.error('[Meta Ads Sync] Could not retrieve managed page tokens:', accountsError.message);
    }

    let formsToSync = [];
    
    // Page IDs filter
    const pageIdsEnv = process.env.META_PAGE_IDS;
    let allowedPageIds = [];
    if (pageIdsEnv) {
      allowedPageIds = pageIdsEnv.split(',').map(id => id.trim());
    } else {
      allowedPageIds = ['114072438461966', '132874573234075']; // default Gautam Motors IDs
    }

    let pagesToSync = [];
    if (Object.keys(managedPagesMap).length > 0) {
      pagesToSync = Object.entries(managedPagesMap)
        .filter(([id, p]) => allowedPageIds.includes(String(id)) || p.name.toLowerCase().includes('gautam'))
        .map(([id, p]) => ({
          id,
          name: p.name,
          access_token: p.access_token
        }));
    } else {
      // Fallback
      try {
        const meResponse = await axios.get(
          `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${pageAccessToken}`
        );
        pagesToSync.push({
          id: meResponse.data.id,
          name: meResponse.data.name,
          access_token: pageAccessToken
        });
      } catch (meError) {
        console.error('[Meta Ads Sync] Me endpoint fallback failed:', meError.message);
        isSyncing = false;
        return { success: false, error: meError.message };
      }
    }

    // Resolve forms for all pages
    for (const page of pagesToSync) {
      try {
        const formsResponse = await axios.get(
          `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms?fields=id,name,status&access_token=${page.access_token}`
        );
        const pageForms = formsResponse.data.data || [];
        
        pageForms.forEach(f => {
          formsToSync.push({
            id: f.id,
            name: f.name,
            pageId: page.id,
            pageName: page.name,
            access_token: page.access_token
          });
        });
      } catch (pageError) {
        console.error(`[Meta Ads Sync] Could not fetch forms for page ${page.name}:`, pageError.message);
      }
    }

    let newLeadsSaved = 0;

    // Fetch leads for each form
    for (const form of formsToSync) {
      try {
        const leadsResponse = await axios.get(
          `https://graph.facebook.com/v19.0/${form.id}/leads?fields=id,created_time,campaign_name,adset_name,ad_name,form_id,field_data&access_token=${form.access_token}`
        );
        const fbLeads = leadsResponse.data.data || [];
        
        for (const fbLead of fbLeads) {
          const alreadyExists = await SupabaseLead.getByLeadId(fbLead.id);
          if (alreadyExists) continue;

          const { mapped, custom } = parseMetaFieldData(fbLead.field_data);
          
          await SupabaseLead.create({
            lead_id: fbLead.id,
            full_name: mapped.full_name || 'Facebook User',
            mobile_number: mapped.mobile_number || 'N/A',
            email_address: mapped.email_address || null,
            city: mapped.city || null,
            state: mapped.state || null,
            lead_source: 'Facebook Meta Sync',
            campaign_name: fbLead.campaign_name || 'Meta Ad Campaign',
            ad_set_name: fbLead.adset_name || 'Meta Ad Set',
            ad_name: fbLead.ad_name || 'Meta Ad',
            vehicle_interest: mapped.vehicle_interest || null,
            budget: mapped.budget || null,
            custom_fields: {
              ...custom,
              form_id: fbLead.form_id,
              form_name: form.name
            },
            created_at: fbLead.created_time || new Date().toISOString()
          });

          newLeadsSaved++;
        }
      } catch (formError) {
        console.error(`[Meta Ads Sync] Error processing form ${form.name}:`, formError.message);
      }
    }

    if (newLeadsSaved > 0) {
      console.log(`[Meta Ads Sync] Completed. Imported ${newLeadsSaved} new lead(s).`);
    } else {
      console.log('[Meta Ads Sync] Completed. No new leads found.');
    }

    isSyncing = false;
    return { success: true, newLeadsSaved };
  } catch (err) {
    console.error('[Meta Ads Sync] Background sync failed:', err.message);
    isSyncing = false;
    return { success: false, error: err.message };
  }
}

// Start Meta sync interval scheduler
function startSyncInterval() {
  // Clear any existing timer
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
  }

  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken) {
    console.log('[Meta Ads Sync] Background scheduler not started (missing token).');
    return;
  }

  console.log('[Meta Ads Sync] Background scheduler initialized (runs every 60s).');
  
  // Run initial sync cycle after short delay
  setTimeout(() => {
    syncNow().catch(err => console.error('[Meta Ads Sync] Initial background sync error:', err.message));
  }, 5000);

  // Set 60-second sync timer
  syncIntervalId = setInterval(() => {
    syncNow().catch(err => console.error('[Meta Ads Sync] Interval background sync error:', err.message));
  }, 60000);
}

// Stop Meta sync interval scheduler
function stopSyncInterval() {
  if (syncIntervalId) {
    console.log('[Meta Ads Sync] Background scheduler stopped.');
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

module.exports = {
  syncNow,
  startSyncInterval,
  stopSyncInterval
};
