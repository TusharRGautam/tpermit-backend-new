const express = require('express');
const router = express.Router();
const { supabaseClient } = require('../supabaseClient');

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt received:', req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check credentials against hardcoded values
    if (email === 't-permit@gmail.com' && password === 't-permit@789') {
      // Generate a simple session token (in production, use JWT or similar)
      const sessionToken = 't-permit_session_' + Date.now();
      
      return res.json({
        success: true,
        message: 'Login successful',
        sessionToken,
        user: {
          email: email,
          name: 'T-Permit Admin'
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Verify session route
router.post('/verify', async (req, res) => {
  try {
    const { sessionToken } = req.body;

    // Simple session validation (in production, use proper JWT verification)
    if (sessionToken && sessionToken.startsWith('t-permit_session_')) {
      return res.json({
        success: true,
        valid: true,
        user: {
          email: 'asw@gmail.com',
          name: 'ASW Admin'
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Invalid session token'
      });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    // In a real application, you would invalidate the session token here
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 