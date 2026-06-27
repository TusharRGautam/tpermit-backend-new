const express = require('express');
const router = express.Router();
const axios = require('axios');
const SupabaseLead = require('../models/SupabaseLead');
const sheetSyncService = require('../services/sheetSyncService');

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

// Helper to resolve the correct Page Access Token if a User Access Token is used
async function getAccessTokenForPage(pageId) {
  const defaultToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!defaultToken) return null;
  
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,access_token&access_token=${defaultToken}`
    );
    if (response.data && Array.isArray(response.data.data)) {
      const page = response.data.data.find(p => String(p.id) === String(pageId));
      if (page && page.access_token) {
        console.log(`Resolved Page Access Token for Page ID: ${pageId}`);
        return page.access_token;
      }
    }
  } catch (error) {
    console.warn(`Could not resolve Page Access Token for Page ID ${pageId}:`, error.message);
  }
  
  return defaultToken; // fallback to user token
}

// GET /api/leads - Fetch all leads
router.get('/', async (req, res) => {
  try {
    const leads = await SupabaseLead.getAll();
    res.json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leads', error: error.message });
  }
});

// POST /api/leads/sync - Sync/fetch historical leads from Meta Leadgen Forms
router.post('/sync', async (req, res) => {
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken) {
    return res.status(400).json({ success: false, message: 'META_PAGE_ACCESS_TOKEN is not configured in .env' });
  }

  try {
    console.log('🔄 Initiating historical lead sync from Meta...');
    
    // We will still fetch managed pages first to get their Page Access Tokens
    let managedPagesMap = {};
    try {
      console.log('Attempting to fetch managed pages to resolve tokens...');
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
        console.log(`Cached ${Object.keys(managedPagesMap).length} managed page token(s) for resolution.`);
      }
    } catch (accountsError) {
      if (accountsError.response && accountsError.response.data) {
        console.error('Could not retrieve managed pages accounts. Error response:', JSON.stringify(accountsError.response.data, null, 2));
      } else {
        console.error('Could not retrieve managed pages accounts. Error:', accountsError.message);
      }
    }

    let formsToSync = [];
    
    // Resolve which Page IDs are allowed to sync (defaulting to Gautam Motors)
    const pageIdsEnv = process.env.META_PAGE_IDS;
    let allowedPageIds = [];
    
    if (pageIdsEnv) {
      allowedPageIds = pageIdsEnv.split(',').map(id => id.trim());
      console.log(`Filtering sync to configured Page IDs: ${JSON.stringify(allowedPageIds)}`);
    } else {
      allowedPageIds = ['114072438461966', '132874573234075'];
      console.log(`No META_PAGE_IDS configured in .env. Defaulting to Gautam Motors Page IDs: ${JSON.stringify(allowedPageIds)}`);
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
      console.log(`Filtered pages for sync (matching Page IDs or containing "Gautam"): ${JSON.stringify(pagesToSync.map(p => p.name))}`);
    } else {
      // Fallback if accounts fetch failed or returned nothing
      const meResponse = await axios.get(
        `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${pageAccessToken}`
      );
      pagesToSync.push({
        id: meResponse.data.id,
        name: meResponse.data.name,
        access_token: pageAccessToken
      });
      console.log(`Using token directly for: ${meResponse.data.name} (ID: ${meResponse.data.id})`);
    }

    for (const page of pagesToSync) {
      try {
        console.log(`Fetching forms for page: ${page.name} (ID: ${page.id})...`);
        const formsResponse = await axios.get(
          `https://graph.facebook.com/v19.0/${page.id}/leadgen_forms?fields=id,name,status&access_token=${page.access_token}`
        );
        const pageForms = formsResponse.data.data || [];
        console.log(`Found ${pageForms.length} forms for page ${page.name}.`);
        
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
        console.error(`Could not fetch forms for page ${page.name} (ID: ${page.id}):`, pageError.message);
        if (pageError.response && pageError.response.data) {
          console.error(`Meta API error response for page ${page.name}:`, JSON.stringify(pageError.response.data, null, 2));
        }
      }
    }

    console.log(`Forms to sync leads from: ${JSON.stringify(formsToSync.map(f => ({ id: f.id, name: f.name, page: f.pageName })))}`);

    let totalProcessed = 0;
    let newLeadsSaved = 0;
    const syncedPagesMap = {};

    // Process each resolved form and fetch leads
    for (const form of formsToSync) {
      const pageKey = form.pageId || 'unknown_page';
      if (!syncedPagesMap[pageKey]) {
        syncedPagesMap[pageKey] = {
          id: form.pageId,
          name: form.pageName,
          forms_checked: 0,
          leads_found: 0,
          new_leads_saved: 0
        };
      }
      
      syncedPagesMap[pageKey].forms_checked++;

      try {
        const leadsResponse = await axios.get(
          `https://graph.facebook.com/v19.0/${form.id}/leads?fields=id,created_time,campaign_name,adset_name,ad_name,form_id,field_data&access_token=${form.access_token}`
        );
        const fbLeads = leadsResponse.data.data || [];
        console.log(`Form "${form.name}" (ID: ${form.id}) has ${fbLeads.length} leads.`);
        
        for (const fbLead of fbLeads) {
          totalProcessed++;
          syncedPagesMap[pageKey].leads_found++;
          
          // Check if lead already exists in DB
          const alreadyExists = await SupabaseLead.getByLeadId(fbLead.id);
          if (alreadyExists) {
            continue;
          }
          
          // Parse lead fields
          const { mapped, custom } = parseMetaFieldData(fbLead.field_data);
          
          // Save to DB
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
          syncedPagesMap[pageKey].new_leads_saved++;
        }
      } catch (formError) {
        console.error(`Error fetching leads for form ${form.name} (ID: ${form.id}):`, formError.message);
        let errorDetail = formError.message;
        if (formError.response && formError.response.data && formError.response.data.error) {
          errorDetail = formError.response.data.error.message;
        }
        syncedPagesMap[pageKey].error = errorDetail;
      }
    }

    const syncedPages = Object.values(syncedPagesMap);

    res.json({
      success: true,
      message: 'Leads synced successfully from Facebook Meta',
      synced_pages: syncedPages,
      total_leads_found: totalProcessed,
      new_leads_saved: newLeadsSaved
    });
  } catch (error) {
    console.error('Error during Meta leads sync:', error.message);
    if (error.response) {
      console.error('Meta API response error:', error.response.data);
      return res.status(500).json({ 
        success: false, 
        message: 'Meta API call failed', 
        error: error.response.data.error ? error.response.data.error.message : error.message 
      });
    }
    res.status(500).json({ success: false, message: 'Failed to sync leads', error: error.message });
  }
});

// GET /api/leads/webhook - Verify Meta Webhook Endpoint
// Meta checks this when setting up the webhook in Meta Developer Console
router.get('/webhook', (req, res) => {
  console.log('Incoming Meta Webhook verification challenge...');
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'TPermitMetaVerifyToken2026';

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Meta Webhook Verified Successfully!');
      return res.status(200).send(challenge);
    } else {
      console.warn('❌ Meta Webhook Verification mismatch. Received token:', token);
      return res.sendStatus(403);
    }
  }
  
  res.status(400).send('Invalid request params');
});

// POST /api/leads/webhook - Receive Meta Webhook Leadgen Notification
router.post('/webhook', async (req, res) => {
  try {
    console.log('Incoming Meta Webhook Lead Notification:', JSON.stringify(req.body, null, 2));

    const body = req.body;

    // Acknowledge receipt immediately to Meta (must return 200 within 3 seconds)
    res.status(200).json({ success: true, message: 'Received' });

    // Handle standard Meta webhook entries asynchronously
    if (body.object === 'page' && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (!Array.isArray(entry.changes)) continue;

        for (const change of entry.changes) {
          if (change.field === 'leadgen' && change.value) {
            const leadGenId = change.value.leadgen_id;
            console.log(`Received leadgen notification for ID: ${leadGenId}`);

            // Skip if lead already processed
            const alreadyExists = await SupabaseLead.getByLeadId(leadGenId);
            if (alreadyExists) {
              console.log(`Lead ID ${leadGenId} already processed. Skipping...`);
              continue;
            }

            // Check if this is a simulated webhook containing data directly to bypass Meta API fetching
            if (change.value.is_simulated && change.value.simulated_data) {
              console.log('Simulated Webhook detected. Direct creation bypass.');
              await SupabaseLead.create({
                lead_id: leadGenId,
                ...change.value.simulated_data,
                lead_source: 'Facebook Meta Webhook'
              });
              continue;
            }

            // Fetch actual lead details from Meta Graph API
            const baseAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
            if (!baseAccessToken) {
              console.warn('⚠️ META_PAGE_ACCESS_TOKEN is not configured. Cannot fetch lead details from Graph API.');
              
              // In development or simulation mode, fallback to placeholder details so we don't drop the lead notification
              console.log('Fallback: Creating mock lead details for lead ID', leadGenId);
              await SupabaseLead.create({
                lead_id: leadGenId,
                full_name: `Meta Lead (ID: ${leadGenId.substring(0, 6)})`,
                mobile_number: '+91 99999 99999',
                email_address: `meta_lead_${leadGenId.substring(0, 6)}@facebook-leads.com`,
                city: 'Mumbai',
                state: 'Maharashtra',
                lead_source: 'Facebook Meta Webhook (Mock Fetch)',
                campaign_name: 'Meta Active Ad Campaign',
                ad_set_name: 'Main Ad Set',
                ad_name: 'Lead Form Video Ad',
                vehicle_interest: 'Hyundai Creta',
                budget: '14.5 Lakhs',
                custom_fields: {
                  note: 'This record was auto-mocked because META_PAGE_ACCESS_TOKEN is missing.'
                }
              });
              continue;
            }

            try {
              // Extract Page ID from webhook change value or entry ID to get the correct Page Access Token
              const pageId = change.value.page_id || entry.id;
              console.log(`Resolving token for Page ID: ${pageId}...`);
              const resolvedAccessToken = await getAccessTokenForPage(pageId);
              
              // Real Facebook Meta API fetch
              console.log(`Fetching lead details from Graph API for lead ID ${leadGenId} using resolved token...`);
              const fbResponse = await axios.get(
                `https://graph.facebook.com/v19.0/${leadGenId}?access_token=${resolvedAccessToken}`
              );
              
              const fbLead = fbResponse.data;
              console.log('Retrieved lead details from Meta Graph API:', fbLead);

              const { mapped, custom } = parseMetaFieldData(fbLead.field_data);
              
              await SupabaseLead.create({
                lead_id: leadGenId,
                full_name: mapped.full_name || 'Facebook User',
                mobile_number: mapped.mobile_number || 'N/A',
                email_address: mapped.email_address || null,
                city: mapped.city || null,
                state: mapped.state || null,
                lead_source: 'Facebook Meta Webhook',
                campaign_name: fbLead.campaign_name || null,
                ad_set_name: fbLead.adset_name || null,
                ad_name: fbLead.ad_name || null,
                vehicle_interest: mapped.vehicle_interest || null,
                budget: mapped.budget || null,
                custom_fields: {
                  ...custom,
                  form_id: fbLead.form_id,
                  ad_id: fbLead.ad_id,
                  adset_id: fbLead.adset_id,
                  campaign_id: fbLead.campaign_id
                }
              });
              console.log('✅ Successfully stored Meta webhook lead!');
            } catch (fbError) {
              console.error(`Failed to fetch/save Meta lead details for ID ${leadGenId}:`, fbError.message);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Unhandled error in webhook receiver:', error);
  }
});

// GET /api/leads/sheets-config - Get current Google Sheets sync configuration & status
router.get('/sheets-config', (req, res) => {
  try {
    const config = sheetSyncService.readConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching sheets config:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sheets configuration', error: error.message });
  }
});

// POST /api/leads/sheets-config - Update Google Sheets URL & trigger sync
router.post('/sheets-config', async (req, res) => {
  try {
    const { url } = req.body;
    console.log(`Received request to update Google Sheets URL to: ${url}`);
    const result = await sheetSyncService.configureUrl(url);
    const updatedConfig = sheetSyncService.readConfig();
    res.json({ 
      success: result.success, 
      message: result.message, 
      data: updatedConfig 
    });
  } catch (error) {
    console.error('Error updating sheets config:', error);
    res.status(500).json({ success: false, message: 'Failed to configure Google Sheets sync', error: error.message });
  }
});

// POST /api/leads/sheets-config/sync - Trigger immediate manual Google Sheets sync
router.post('/sheets-config/sync', async (req, res) => {
  try {
    console.log('Manual Google Sheets sync requested...');
    const result = await sheetSyncService.syncNow();
    const updatedConfig = sheetSyncService.readConfig();
    res.json({
      success: result.success,
      message: result.message,
      data: updatedConfig
    });
  } catch (error) {
    console.error('Error in manual sheets sync:', error);
    res.status(500).json({ success: false, message: 'Failed to trigger sheets sync', error: error.message });
  }
});

// GET /api/leads/:id - Fetch lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await SupabaseLead.getById(req.params.id);
    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('Error fetching lead details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lead details', error: error.message });
  }
});

// POST /api/leads - Create lead manually (e.g. from simulator or admin panel)
router.post('/', async (req, res) => {
  try {
    const lead = await SupabaseLead.create(req.body);
    res.status(201).json({ success: true, message: 'Lead created successfully', data: lead });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ success: false, message: 'Failed to create lead', error: error.message });
  }
});

// PUT /api/leads/:id - Update lead (status, is_hot)
router.put('/:id', async (req, res) => {
  try {
    const updatedLead = await SupabaseLead.update(req.params.id, req.body);
    res.json({ success: true, message: 'Lead updated successfully', data: updatedLead });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ success: false, message: 'Failed to update lead', error: error.message });
  }
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', async (req, res) => {
  try {
    await SupabaseLead.delete(req.params.id);
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ success: false, message: 'Failed to delete lead', error: error.message });
  }
});

module.exports = router;
