const express = require('express');
const router = express.Router();
const axios = require('axios');
const SupabaseLead = require('../models/SupabaseLead');

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
            const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
            if (!pageAccessToken) {
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
              // Real Facebook Meta API fetch
              console.log(`Fetching lead details from Graph API for ${leadGenId}...`);
              const fbResponse = await axios.get(
                `https://graph.facebook.com/v19.0/${leadGenId}?access_token=${pageAccessToken}`
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

module.exports = router;
