const express = require('express');
const router = express.Router();
const SupabaseShowroom = require('../models/SupabaseShowroom');

const showroomModel = new SupabaseShowroom();

// Get all showrooms
router.get('/', async (req, res) => {
  try {
    const showrooms = await showroomModel.getAll();
    res.json({
      success: true,
      data: showrooms
    });
  } catch (error) {
    console.error('Error fetching showrooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showrooms',
      error: error.message
    });
  }
});

// Get all showrooms with contacts
router.get('/with-contacts', async (req, res) => {
  try {
    const showrooms = await showroomModel.getAllWithContacts();
    res.json({
      success: true,
      data: showrooms
    });
  } catch (error) {
    console.error('Error fetching showrooms with contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showrooms with contacts',
      error: error.message
    });
  }
});

// Get showroom by ID
router.get('/:id', async (req, res) => {
  try {
    const showroom = await showroomModel.findById(req.params.id);
    if (!showroom) {
      return res.status(404).json({
        success: false,
        message: 'Showroom not found'
      });
    }
    res.json({
      success: true,
      data: showroom
    });
  } catch (error) {
    console.error('Error fetching showroom:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showroom',
      error: error.message
    });
  }
});

// Get showroom by ID with contacts
router.get('/:id/with-contacts', async (req, res) => {
  try {
    const showroom = await showroomModel.findByIdWithContacts(req.params.id);
    if (!showroom) {
      return res.status(404).json({
        success: false,
        message: 'Showroom not found'
      });
    }
    res.json({
      success: true,
      data: showroom
    });
  } catch (error) {
    console.error('Error fetching showroom with contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showroom with contacts',
      error: error.message
    });
  }
});

// Get showrooms by brand
router.get('/brand/:brand', async (req, res) => {
  try {
    const showrooms = await showroomModel.getByBrand(req.params.brand);
    res.json({
      success: true,
      data: showrooms
    });
  } catch (error) {
    console.error('Error fetching showrooms by brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showrooms by brand',
      error: error.message
    });
  }
});

// Create new showroom
router.post('/', async (req, res) => {
  try {
    const showroom = await showroomModel.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Showroom created successfully',
      data: showroom
    });
  } catch (error) {
    console.error('Error creating showroom:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create showroom',
      error: error.message
    });
  }
});

// Update showroom
router.put('/:id', async (req, res) => {
  try {
    const showroom = await showroomModel.update(req.params.id, req.body);
    if (!showroom) {
      return res.status(404).json({
        success: false,
        message: 'Showroom not found'
      });
    }
    res.json({
      success: true,
      message: 'Showroom updated successfully',
      data: showroom
    });
  } catch (error) {
    console.error('Error updating showroom:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update showroom',
      error: error.message
    });
  }
});

// Delete showroom
router.delete('/:id', async (req, res) => {
  try {
    await showroomModel.delete(req.params.id);
    res.json({
      success: true,
      message: 'Showroom deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting showroom:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete showroom',
      error: error.message
    });
  }
});

// Get contacts for a showroom
router.get('/:id/contacts', async (req, res) => {
  try {
    const contacts = await showroomModel.getContactsByShowroom(req.params.id);
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching showroom contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showroom contacts',
      error: error.message
    });
  }
});

// Add contact to showroom
router.post('/:id/contacts', async (req, res) => {
  try {
    const contact = await showroomModel.addContact(req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error adding showroom contact:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add contact',
      error: error.message
    });
  }
});

// Update contact
router.put('/contacts/:contactId', async (req, res) => {
  try {
    const contact = await showroomModel.updateContact(req.params.contactId, req.body);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update contact',
      error: error.message
    });
  }
});

// Delete contact
router.delete('/contacts/:contactId', async (req, res) => {
  try {
    await showroomModel.deleteContact(req.params.contactId);
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact',
      error: error.message
    });
  }
});

module.exports = router;