// routes/quotationRoutes.js
const express = require('express');
const router = express.Router();
const SupabaseQuotation = require('../models/SupabaseQuotation');

const quotationModel = new SupabaseQuotation();

// Create a new quotation
router.post('/', async (req, res) => {
  try {
    // Ensure vendor_id is treated as a string
    if (req.body.vendor_id) {
      req.body.vendor_id = String(req.body.vendor_id);
      console.log('Route - vendor_id type:', typeof req.body.vendor_id);
      console.log('Route - vendor_id value:', req.body.vendor_id);
    }
    
    // Log the entire request body for debugging
    console.log('Creating quotation with data:', JSON.stringify(req.body, null, 2));
    
    const newQuotation = await quotationModel.create(req.body);
    res.status(201).json(newQuotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    // Send more detailed error information
    res.status(400).json({ 
      error: error.message,
      details: error.details || null,
      code: error.code || null,
      hint: error.hint || null
    });
  }
});

// Get all quotations
router.get('/', async (req, res) => {
  try {
    const quotations = await quotationModel.getAll();
    res.status(200).json(quotations);
  } catch (error) {
    console.error('Error getting quotations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a quotation by vendor_id
router.get('/:vendorId', async (req, res) => {
  try {
    // Ensure vendor_id is treated as a string
    const vendorId = String(req.params.vendorId);
    const quotation = await quotationModel.findById(vendorId);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    res.status(200).json(quotation);
  } catch (error) {
    console.error(`Error getting quotation ${req.params.vendorId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Update a quotation
router.put('/:vendorId', async (req, res) => {
  try {
    // Ensure vendor_id is treated as a string
    const vendorId = String(req.params.vendorId);
    
    // Also ensure vendor_id in body is a string if present
    if (req.body.vendor_id) {
      req.body.vendor_id = String(req.body.vendor_id);
    }
    
    const updatedQuotation = await quotationModel.update(vendorId, req.body);
    
    if (!updatedQuotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    res.status(200).json(updatedQuotation);
  } catch (error) {
    console.error(`Error updating quotation ${req.params.vendorId}:`, error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a quotation
router.delete('/:vendorId', async (req, res) => {
  try {
    // Ensure vendor_id is treated as a string
    const vendorId = String(req.params.vendorId);
    const success = await quotationModel.delete(vendorId);
    
    if (!success) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting quotation ${req.params.vendorId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get quotations by car model
router.get('/car/:carModel', async (req, res) => {
  try {
    const quotations = await quotationModel.getByCarModel(req.params.carModel);
    res.status(200).json(quotations);
  } catch (error) {
    console.error(`Error getting quotations by car model ${req.params.carModel}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get car summary data for frontend display
router.get('/summary/cars', async (req, res) => {
  try {
    console.log('Fetching car summaries...');
    
    // Get all quotations with best offers for each car model
    const { data: quotations, error } = await quotationModel.supabase
      .from('quotations')
      .select('*')
      .order('final_down_payment', { ascending: true });
    
    if (error) {
      console.error('Database error:', error);
      // Return fallback data on database error
      return res.status(200).json(getFallbackCarData());
    }
    
    // If no quotations found, return fallback data
    if (!quotations || quotations.length === 0) {
      console.log('No quotations found in database, returning fallback data');
      return res.status(200).json(getFallbackCarData());
    }
    
    // Group by car model and get the best quotation for each
    const carSummaries = {};
    const carColors = {};
    
    quotations.forEach(quotation => {
      const carModel = quotation.car_model;
      const variant = quotation.model_variant;
      
      if (!carSummaries[carModel]) {
        carSummaries[carModel] = {
          id: carModel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          name: carModel,
          variants: [],
          downPayment: quotation.final_down_payment,
          onRoadPrice: quotation.on_the_road,
          monthlyEmi: quotation.monthly_emi,
          bestQuotation: quotation
        };
        carColors[carModel] = {};
      }
      
      // Keep track of variants and their colors
      if (!carColors[carModel][variant]) {
        carColors[carModel][variant] = getColorsForVariant(carModel, variant);
        carSummaries[carModel].variants.push({
          name: variant,
          colors: carColors[carModel][variant]
        });
      }
      
      // Update if this quotation has a better (lower) down payment
      if (quotation.final_down_payment < carSummaries[carModel].downPayment) {
        carSummaries[carModel].downPayment = quotation.final_down_payment;
        carSummaries[carModel].onRoadPrice = quotation.on_the_road;
        carSummaries[carModel].monthlyEmi = quotation.monthly_emi;
        carSummaries[carModel].bestQuotation = quotation;
      }
    });
    
    // Convert to array and add image paths
    const carSummaryArray = Object.values(carSummaries).map(car => ({
      id: car.id,
      name: car.name,
      image: getCarImagePath(car.name),
      downPayment: `₹${car.downPayment.toLocaleString('en-IN')}`,
      monthlyEmi: `₹${car.monthlyEmi.toLocaleString('en-IN')}/month`,
      variants: car.variants,
      globalExShowroomPrice: car.bestQuotation.ex_showroom,
      globalLoanAmount: car.bestQuotation.loan_amount,
      globalInterestRate: car.bestQuotation.roi_emi_interest,
      globalTotalOnRoadPrice: car.bestQuotation.on_the_road
    }));
    
    console.log(`Found ${carSummaryArray.length} car summaries from database`);
    res.status(200).json(carSummaryArray);
    
  } catch (error) {
    console.error('Error getting car summaries:', error);
    // Return fallback data on error
    res.status(200).json(getFallbackCarData());
  }
});

// Helper function to get colors for each variant
function getColorsForVariant(carModel, variant) {
  const colorMap = {
    'Maruti Suzuki Ertiga': {
      'VXI CNG': ['White', 'Silver', 'Grey', 'Red', 'Blue'],
      'Tour M': ['White']
    },
    'Maruti Suzuki Dzire': {
      'Tour S CNG': ['White']
    },
    'Maruti Suzuki Wagon-R': {
      'Wagoner-R H3 CNG': ['White'],
      'Wagoner-R LXI CNG': ['White', 'Silver', 'Grey', 'Red', 'Blue'],
      'Wagoner-R VXI CNG': ['White', 'Silver', 'Grey', 'Red', 'Blue']
    },
    'Maruti Suzuki Rumion': {
      'S CNG': ['White', 'Silver', 'Grey']
    },
    'Hyundai Aura': {
      'Aura E CNG': ['White', 'Silver', 'Grey', 'Cherry Night'],
      'Aura S CNG': ['White', 'Silver', 'Grey', 'Cherry Night'],
      'Aura SX CNG': ['White', 'Silver', 'Grey', 'Cherry Night']
    },
    'Toyota Innova Crysta': {
      'Crysta GX': ['White', 'Silver', 'Pearl White'],
      'Crysta GX+': ['White', 'Silver', 'Pearl White'],
      'Crysta VX': ['White', 'Silver', 'Pearl White'],
      'Crysta ZX': ['White', 'Silver', 'Pearl White']
    }
  };
  
  return colorMap[carModel]?.[variant] || ['White'];
}

// Helper function to get car image path
function getCarImagePath(carName) {
  const imageMap = {
    'Maruti Suzuki Ertiga': '/Website-Images/Cars/ertiga.jpg',
    'Maruti Suzuki ERTIGA': '/Website-Images/Cars/ertiga.jpg',
    'Maruti Suzuki Dzire': '/Website-Images/Cars/Dzire.jpg',
    'Maruti Suzuki Wagon-R': '/Website-Images/Cars/wagnor.jpg',
    'Maruti Suzuki Rumion': '/Website-Images/Cars/Ruminum.jpg',
    'TOYOTA RUMION': '/Website-Images/Cars/Ruminum.jpg',
    'Hyundai Aura': '/Website-Images/Cars/Aura.jpg',
    'HYUNDAI AURA': '/Website-Images/Cars/Aura.jpg',
    'Toyota Innova Crysta': '/Website-Images/Cars/Crysta.jpg'
  };
  
  return imageMap[carName] || '/Website-Images/Cars/placeholder.svg';
}

// Helper function to get fallback car data when database is empty or unavailable
function getFallbackCarData() {
  return [
    {
      id: 'maruti-suzuki-ertiga',
      image: '/Website-Images/Cars/ertiga.jpg',
      name: 'Maruti Suzuki ERTIGA',
      downPayment: '₹99,347',
      monthlyEmi: '₹23,367/month',
      globalExShowroomPrice: 1000000,
      globalLoanAmount: 875000,
      globalInterestRate: 8.5,
      globalTotalOnRoadPrice: 1125000,
      variants: [
        { name: 'VXI CNG 1.5 MT', colors: ['White', 'Silver', 'Grey', 'Red', 'Blue'] },
        { name: 'Tour M CNG 1.5 MT', colors: ['White'] }
      ]
    },
    {
      id: 'maruti-suzuki-dzire',
      image: '/Website-Images/Cars/Dzire.jpg',
      name: 'Maruti Suzuki Dzire',
      downPayment: '₹1,35,971',
      monthlyEmi: '₹17,531/month',
      globalExShowroomPrice: 750000,
      globalLoanAmount: 665000,
      globalInterestRate: 8.5,
      globalTotalOnRoadPrice: 850000,
      variants: [
        { name: 'Tour S CNG', colors: ['White'] },
        { name: 'Tour S CNG', colors: ['White'] }
      ]
    },
    {
      id: 'maruti-suzuki-wagon-r',
      image: '/Website-Images/Cars/wagnor.jpg',
      name: 'Maruti Suzuki Wagon-R',
      downPayment: '₹92,821',
      monthlyEmi: '₹11,884/month',
      globalExShowroomPrice: 650000,
      globalLoanAmount: 585000,
      globalInterestRate: 8.5,
      globalTotalOnRoadPrice: 715000,
      variants: [
        { name: 'LXI CNG', colors: ['White', 'Silver', 'Grey', 'Red', 'Blue'] },
        { name: 'Tour H', colors: ['White'] }
      ]
    },
    {
      id: 'toyota-rumion',
      image: '/Website-Images/Cars/Ruminum.jpg',
      name: 'TOYOTA RUMION',
      downPayment: '₹1,03,647',
      monthlyEmi: '₹23,344/month',
      globalExShowroomPrice: 850000,
      globalLoanAmount: 755000,
      globalInterestRate: 8.5,
      globalTotalOnRoadPrice: 950000,
      variants: [
        { name: 'S CNG 1.5 MT', colors: ['White', 'Silver', 'Grey'] }
      ]
    },
    {
      id: 'hyundai-aura',
      image: '/Website-Images/Cars/Aura.jpg',
      name: 'HYUNDAI AURA',
      downPayment: '₹1,23,821',
      monthlyEmi: '₹15,809/month',
      globalExShowroomPrice: 700000,
      globalLoanAmount: 625000,
      globalInterestRate: 8.5,
      globalTotalOnRoadPrice: 775000,
      variants: [
        { name: 'E CNG', colors: ['White', 'Silver', 'Grey', 'Cherry Night'] },
        { name: 'S CNG', colors: ['White', 'Silver', 'Grey', 'Cherry Night'] }
      ]
    },
    {
      id: 'toyota-innova-crysta',
      image: '/Website-Images/Cars/Crysta.jpg',
      name: 'Toyota Innova Crysta',
      downPayment: '₹1,59,547',
      monthlyEmi: '₹38,557/month',
      globalExShowroomPrice: 1800000,
      globalLoanAmount: 1650000,
      globalInterestRate: 8.5,
      globalTotalOnRoadPrice: 1950000,
      variants: [
        { name: 'GX', colors: ['White', 'Silver', 'Pearl White'] },
        { name: 'GX+', colors: ['White', 'Silver', 'Pearl White'] }
      ]
    }
  ];
}

module.exports = router;