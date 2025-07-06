const { supabaseAdmin } = require('../supabaseClient');

// Sample quotation data for all ASW car variants
const carQuotationData = {
  'Maruti Suzuki Ertiga': {
    'VXI CNG': {
      exShowroom: 1097500,
      registration: 85000,
      insurance: 35000,
      noPlate: 2500,
      gps: 6000,
      fastag: 500,
      speedGovernor: 1000,
      accessories: 15000,
      processFee: 5000,
      stampDuty: 3000,
      handlingCharge: 7500,
      loanInsurance: 20000,
      offers: 25000,
      colors: ['White', 'Silver', 'Grey', 'Red', 'Blue']
    },
    'Tour M': {
      exShowroom: 1157500,
      registration: 88000,
      insurance: 37000,
      noPlate: 2500,
      gps: 6000,
      fastag: 500,
      speedGovernor: 1000,
      accessories: 12000,
      processFee: 5000,
      stampDuty: 3000,
      handlingCharge: 7500,
      loanInsurance: 22000,
      offers: 20000,
      colors: ['White']
    }
  },
  'Maruti Suzuki Dzire': {
    'Tour S CNG': {
      exShowroom: 897500,
      registration: 72000,
      insurance: 28000,
      noPlate: 2500,
      gps: 6000,
      fastag: 500,
      speedGovernor: 1000,
      accessories: 10000,
      processFee: 4000,
      stampDuty: 2500,
      handlingCharge: 6000,
      loanInsurance: 18000,
      offers: 15000,
      colors: ['White']
    }
  },
  'Maruti Suzuki Wagon-R': {
    'Wagoner-R H3 CNG': {
      exShowroom: 597500,
      registration: 52000,
      insurance: 22000,
      noPlate: 2500,
      gps: 5000,
      fastag: 500,
      speedGovernor: 1000,
      accessories: 8000,
      processFee: 3500,
      stampDuty: 2000,
      handlingCharge: 5000,
      loanInsurance: 15000,
      offers: 10000,
      colors: ['White']
    },
    'Wagoner-R LXI CNG': {
      exShowroom: 657500,
      registration: 55000,
      insurance: 24000,
      noPlate: 2500,
      gps: 5000,
      fastag: 500,
      speedGovernor: 1000,
      accessories: 8000,
      processFee: 3500,
      stampDuty: 2000,
      handlingCharge: 5000,
      loanInsurance: 16000,
      offers: 12000,
      colors: ['White', 'Silver', 'Grey', 'Red', 'Blue']
    },
    'Wagoner-R VXI CNG': {
      exShowroom: 717500,
      registration: 58000,
      insurance: 26000,
      noPlate: 2500,
      gps: 5000,
      fastag: 500,
      speedGovernor: 1000,
      accessories: 10000,
      processFee: 4000,
      stampDuty: 2500,
      handlingCharge: 5500,
      loanInsurance: 17000,
      offers: 15000,
      colors: ['White', 'Silver', 'Grey', 'Red', 'Blue']
    }
  },
  'Maruti Suzuki Rumion': {
    'S CNG': {
      exShowroom: 1097500,
      registration: 82000,
      insurance: 34000,
      noPlate: 2500,
      gps: 6000,
      fastag: 500,
      speedGovernor: 1000,
      accessories: 12000,
      processFee: 5000,
      stampDuty: 3000,
      handlingCharge: 7000,
      loanInsurance: 20000,
      offers: 20000,
      colors: ['White', 'Silver', 'Grey']
    }
  },
  'Hyundai Aura': {
    'Aura E CNG': {
      exShowroom: 797500,
      registration: 65000,
      insurance: 26000,
      noPlate: 2500,
      gps: 5500,
      fastag: 500,
      speedGovernor: 1000,
      accessories: 9000,
      processFee: 4000,
      stampDuty: 2500,
      handlingCharge: 5500,
      loanInsurance: 17000,
      offers: 12000,
      colors: ['White', 'Silver', 'Grey', 'Cherry Night']
    },
    'Aura S CNG': {
      exShowroom: 857500,
      registration: 68000,
      insurance: 28000,
      noPlate: 2500,
      gps: 5500,
      fastag: 500,
      speedGovernor: 1000,
      accessories: 10000,
      processFee: 4000,
      stampDuty: 2500,
      handlingCharge: 6000,
      loanInsurance: 18000,
      offers: 15000,
      colors: ['White', 'Silver', 'Grey', 'Cherry Night']
    },
    'Aura SX CNG': {
      exShowroom: 917500,
      registration: 72000,
      insurance: 30000,
      noPlate: 2500,
      gps: 6000,
      fastag: 500,
      speedGovernor: 1000,
      accessories: 12000,
      processFee: 4500,
      stampDuty: 3000,
      handlingCharge: 6500,
      loanInsurance: 19000,
      offers: 18000,
      colors: ['White', 'Silver', 'Grey', 'Cherry Night']
    }
  },
  'Toyota Innova Crysta': {
    'Crysta GX': {
      exShowroom: 1797500,
      registration: 125000,
      insurance: 55000,
      noPlate: 3000,
      gps: 8000,
      fastag: 500,
      speedGovernor: 1500,
      accessories: 25000,
      processFee: 8000,
      stampDuty: 5000,
      handlingCharge: 12000,
      loanInsurance: 35000,
      offers: 40000,
      colors: ['White', 'Silver', 'Pearl White']
    },
    'Crysta GX+': {
      exShowroom: 1997500,
      registration: 135000,
      insurance: 60000,
      noPlate: 3000,
      gps: 8000,
      fastag: 500,
      speedGovernor: 1500,
      accessories: 28000,
      processFee: 9000,
      stampDuty: 5500,
      handlingCharge: 13000,
      loanInsurance: 38000,
      offers: 45000,
      colors: ['White', 'Silver', 'Pearl White']
    },
    'Crysta VX': {
      exShowroom: 2097500,
      registration: 140000,
      insurance: 62000,
      noPlate: 3000,
      gps: 8000,
      fastag: 500,
      speedGovernor: 1500,
      accessories: 30000,
      processFee: 9500,
      stampDuty: 6000,
      handlingCharge: 14000,
      loanInsurance: 40000,
      offers: 50000,
      colors: ['White', 'Silver', 'Pearl White']
    },
    'Crysta ZX': {
      exShowroom: 2297500,
      registration: 150000,
      insurance: 68000,
      noPlate: 3000,
      gps: 8000,
      fastag: 500,
      speedGovernor: 1500,
      accessories: 35000,
      processFee: 10000,
      stampDuty: 6500,
      handlingCharge: 15000,
      loanInsurance: 42000,
      offers: 55000,
      colors: ['White', 'Silver', 'Pearl White']
    }
  }
};

// Bank rates configuration
const bankRates = {
  sbi: {
    name: 'SBI Bank',
    rates: {
      'Maruti Suzuki Ertiga': { roi: 8.75, loanPercent: 85 },
      'Maruti Suzuki Dzire': { roi: 8.45, loanPercent: 85 },
      'Maruti Suzuki Wagon-R': { roi: 7.95, loanPercent: 80 },
      'Maruti Suzuki Rumion': { roi: 9.15, loanPercent: 85 },
      'Hyundai Aura': { roi: 8.25, loanPercent: 80 },
      'Toyota Innova Crysta': { roi: 10.45, loanPercent: 90 }
    }
  },
  union: {
    name: 'Union Bank',
    rates: {
      'Maruti Suzuki Ertiga': { roi: 9.25, loanPercent: 90 },
      'Maruti Suzuki Dzire': { roi: 8.75, loanPercent: 85 },
      'Maruti Suzuki Wagon-R': { roi: 8.25, loanPercent: 85 },
      'Maruti Suzuki Rumion': { roi: 9.45, loanPercent: 90 },
      'Hyundai Aura': { roi: 8.55, loanPercent: 85 },
      'Toyota Innova Crysta': { roi: 10.75, loanPercent: 90 }
    }
  },
  indusind: {
    name: 'IndusInd Bank',
    rates: {
      'Maruti Suzuki Ertiga': { roi: 9.50, loanPercent: 80 },
      'Maruti Suzuki Dzire': { roi: 9.00, loanPercent: 80 },
      'Maruti Suzuki Wagon-R': { roi: 8.50, loanPercent: 75 },
      'Maruti Suzuki Rumion': { roi: 9.70, loanPercent: 80 },
      'Hyundai Aura': { roi: 8.80, loanPercent: 75 },
      'Toyota Innova Crysta': { roi: 11.00, loanPercent: 85 }
    }
  },
  au: {
    name: 'AU Bank',
    rates: {
      'Maruti Suzuki Ertiga': { roi: 9.75, loanPercent: 80 },
      'Maruti Suzuki Dzire': { roi: 9.25, loanPercent: 80 },
      'Maruti Suzuki Wagon-R': { roi: 8.75, loanPercent: 75 },
      'Maruti Suzuki Rumion': { roi: 9.95, loanPercent: 80 },
      'Hyundai Aura': { roi: 9.05, loanPercent: 75 },
      'Toyota Innova Crysta': { roi: 11.25, loanPercent: 85 }
    }
  }
};

// Calculate loan details based on bank type
function calculateLoanDetails(carModel, variant, bankType, carData, bankData) {
  const tcs = (carData.exShowroom * 0.01); // 1% TCS
  
  let loanBaseAmount = 0;
  
  if (bankType === 'sbi') {
    // SBI: Ex-Showroom + TCS + Insurance + Registration
    loanBaseAmount = carData.exShowroom + tcs + carData.insurance + carData.registration;
  } else if (bankType === 'union') {
    // Union Bank: Ex-Showroom + TCS + Insurance + Registration + Accessories
    loanBaseAmount = carData.exShowroom + tcs + carData.insurance + carData.registration + carData.accessories;
  } else if (bankType === 'indusind') {
    // IndusInd Bank: Ex-Showroom + TCS + Insurance
    loanBaseAmount = carData.exShowroom + tcs + carData.insurance;
  } else if (bankType === 'au') {
    // AU Bank: Ex-Showroom + TCS + Insurance + Registration + GPS
    loanBaseAmount = carData.exShowroom + tcs + carData.insurance + carData.registration + carData.gps;
  }
  
  const loanAmount = Math.round(loanBaseAmount * (bankData.loanPercent / 100));
  const marginDownPayment = loanBaseAmount - loanAmount;
  
  // Calculate on-the-road price
  const onTheRoad = carData.exShowroom + tcs + carData.registration + carData.insurance + 
                   carData.noPlate + carData.gps + carData.fastag + carData.speedGovernor + 
                   carData.accessories;
  
  // Calculate final down payment after offers
  const finalDownPayment = marginDownPayment - carData.offers;
  
  // Calculate EMI for 5 years (60 months)
  const monthlyRate = bankData.roi / 100 / 12;
  const numPayments = 60; // 5 years
  const monthlyEmi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
  
  return {
    loanAmount,
    marginDownPayment,
    onTheRoad,
    finalDownPayment,
    monthlyEmi,
    tcs
  };
}

// Generate quotations for all combinations
async function seedQuotationData() {
  try {
    console.log('Starting quotation data seeding...');
    
    const quotations = [];
    let vendorId = 1;
    
    // Generate quotations for each car model and variant
    for (const [carModel, variants] of Object.entries(carQuotationData)) {
      for (const [variant, carData] of Object.entries(variants)) {
        
        // Generate quotations for each bank
        for (const [bankKey, bankInfo] of Object.entries(bankRates)) {
          const bankData = bankInfo.rates[carModel];
          
          if (bankData) {
            const loanDetails = calculateLoanDetails(carModel, variant, bankKey, carData, bankData);
            
            const quotation = {
              vendor_id: vendorId.toString(),
              car_model: carModel,
              model_variant: variant,
              roi_emi_interest: bankData.roi,
              sbi_bank: bankKey === 'sbi' ? bankData.loanPercent : 0,
              union_bank: bankKey === 'union' ? bankData.loanPercent : 0,
              indusind_bank: bankKey === 'indusind' ? bankData.loanPercent : 0,
              au_bank: bankKey === 'au' ? bankData.loanPercent : 0,
              ex_showroom: carData.exShowroom,
              tcs: loanDetails.tcs,
              registration: carData.registration,
              insurance: carData.insurance,
              number_plate_crtm_autocard: carData.noPlate,
              gps: carData.gps,
              fastag: carData.fastag,
              speed_governor: carData.speedGovernor,
              accessories: carData.accessories,
              on_the_road: loanDetails.onTheRoad,
              loan_amount: loanDetails.loanAmount,
              margin_down_payment: loanDetails.marginDownPayment,
              process_fee: carData.processFee,
              stamp_duty: carData.stampDuty,
              handling_document_charge: carData.handlingCharge,
              loan_suraksha_insurance: carData.loanInsurance,
              down_payment: loanDetails.marginDownPayment,
              offers: carData.offers,
              final_down_payment: loanDetails.finalDownPayment,
              emi_years: 5,
              monthly_emi: loanDetails.monthlyEmi
            };
            
            quotations.push(quotation);
            vendorId++;
          }
        }
      }
    }
    
    console.log(`Generated ${quotations.length} quotations`);
    
    // Insert quotations in batches
    const batchSize = 50;
    for (let i = 0; i < quotations.length; i += batchSize) {
      const batch = quotations.slice(i, i + batchSize);
      
      const { data, error } = await supabaseAdmin
        .from('quotations')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
        throw error;
      }
      
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(quotations.length/batchSize)}`);
    }
    
    console.log('✅ Quotation data seeding completed successfully!');
    console.log(`Total quotations inserted: ${quotations.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding quotation data:', error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedQuotationData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedQuotationData,
  carQuotationData,
  bankRates
};