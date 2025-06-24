const express = require('express');
const router = express.Router();
const { supabaseClient, supabaseAdmin } = require('../supabaseClient');

// Get all users (using admin access)
router.get('/', async (req, res) => {
  try {
    // This uses service role key to access protected resources
    const { data, error } = await supabaseAdmin
      .from('registration_and_other_details')
      .select('*');
      
    if (error) throw error;
    
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseClient
      .from('registration_and_other_details')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Format profile picture URL from Google Drive if needed
    if (data.profile_picture) {
      // If the profile picture is a Google Drive link, ensure it's properly formatted
      if (data.profile_picture.includes('drive.google.com')) {
        // Format Google Drive URL for direct image access if needed
      }
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    const { data, error } = await supabaseAdmin
      .from('registration_and_other_details')
      .insert([userData])
      .select();
      
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('registration_and_other_details')
      .update(updateData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabaseAdmin
      .from('registration_and_other_details')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

module.exports = router; 