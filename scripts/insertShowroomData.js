const SupabaseShowroom = require('../models/SupabaseShowroom');

const showroomData = [
  {
    showroom_name: 'Maruti Suzuki ARENA (Velox Motors, Thane, Wagle Estate)',
    showroom_address: 'Unit No.6 & 7, Opal Square, Plot No.C1, Road No.1, MIDC, opp. Old Passport Office, Thane, Maharashtra 400604',
    state: 'Maharashtra',
    address_city: 'Thane',
    showroom_city: 'Thane',
    brand: 'Maruti Suzuki'
  },
  {
    showroom_name: 'Maruti Suzuki ARENA (Excell Autovista, Navi Mumbai, Kharghar)',
    showroom_address: '1-8, Aditya Planet, Mumbai - Pune Hwy, Kopra, Sector 10, Kharghar, Navi Mumbai, Maharashtra 410210',
    state: 'Maharashtra',
    address_city: 'Navi Mumbai',
    showroom_city: 'Kharghar',
    brand: 'Maruti Suzuki'
  },
  {
    showroom_name: 'Maruti Suzuki ARENA (Excell Autovista, Mumbai, Malad West)',
    showroom_address: 'Siddhanchal Arcade, Near Inorbit Mall, New Link Rd, Sunder Nagar, Malad West, Mumbai, Maharashtra 400064',
    state: 'Maharashtra',
    address_city: 'Mumbai',
    showroom_city: 'Malad West',
    brand: 'Maruti Suzuki'
  },
  {
    showroom_name: 'Maruti Suzuki ARENA (Excell Autovista, Mumbai, Bandra West)',
    showroom_address: '257, Swami Vivekananda Rd, Bandra West, Mumbai, Maharashtra 400050',
    state: 'Maharashtra',
    address_city: 'Mumbai',
    showroom_city: 'Bandra West',
    brand: 'Maruti Suzuki'
  },
  {
    showroom_name: 'Shreenath Hyundai Chembur West',
    showroom_address: 'Ground Floor, Krushal Shopping Complex, Shop No. 12/13, Ghatkopar - Mahul Rd, next to Shopper Stop, Brindavan Colony, Chembur West, Tilak Nagar, Chembur, Mumbai, Maharashtra 400089',
    state: 'Maharashtra',
    address_city: 'Mumbai',
    showroom_city: 'Chembur West',
    brand: 'Hyundai'
  },
  {
    showroom_name: 'Shreenath Hyundai Showroom - Kandivali',
    showroom_address: 'Unit No.4 & 5, Kesar Ashish CHSL, New Link Rd, near Mahavir Nagar Signal, beside Nirman Diagnostic, Kandivali, Padma Nagar, Kandivali West, Mumbai, Maharashtra 400067',
    state: 'Maharashtra',
    address_city: 'Mumbai',
    showroom_city: 'Kandivali West',
    brand: 'Hyundai'
  },
  {
    showroom_name: 'Maruti Suzuki Arena (Velox Motors, Thane, Shilphata)',
    showroom_address: 'Kalyan Shilphata Road, Near Datta Mandir Opp Bhoomi Lawns Post, Daighar, Shilphata, Thane, Maharashtra 421204',
    state: 'Maharashtra',
    address_city: 'Thane',
    showroom_city: 'Shilphata',
    brand: 'Maruti Suzuki'
  },
  {
    showroom_name: 'Maruti Suzuki ARENA (Navnit Motors, Thane, Gokul Nagar)',
    showroom_address: 'Navnit House, Old Mumbai-Agra Rd, Gokul Nagar, Thane West, Maharashtra 400601',
    state: 'Maharashtra',
    address_city: 'Thane',
    showroom_city: 'Thane West',
    brand: 'Maruti Suzuki'
  },
  {
    showroom_name: 'Maruti Suzuki ARENA (Sai Service, Mumbai, Borivali West)',
    showroom_address: 'SHOP NO 4, CHS LTD. DIAGONALLY, Shiv Shrushti, New Link Rd, opp. NIRMAN DIAGNOSTIC CENTER, Kandivali, Mahavir Nagar, Kandivali West, Mumbai, Maharashtra 400092',
    state: 'Maharashtra',
    address_city: 'Mumbai',
    showroom_city: 'Borivali West',
    brand: 'Maruti Suzuki'
  },
  {
    showroom_name: 'Arsh Hyundai Service Kalyan',
    showroom_address: 'Shilphata Rd, Shilgaon, Thane, Maharashtra 421204',
    state: 'Maharashtra',
    address_city: 'Thane',
    showroom_city: 'Kalyan',
    brand: 'Hyundai'
  },
  {
    showroom_name: 'Maruti Suzuki ARENA (Kiran Motors, Mumbai, Ghatkopar West)',
    showroom_address: 'Arena Ghatkopar West Gandhi Parekh compound, Lal Bahadur Shastri Marg, opp. Damodar park, Ghatkopar West, Mumbai, Maharashtra 400086',
    state: 'Maharashtra',
    address_city: 'Mumbai',
    showroom_city: 'Ghatkopar West',
    brand: 'Maruti Suzuki'
  }
];

async function insertShowroomData() {
  console.log('Starting to insert showroom data...');
  
  try {
    const showroomModel = new SupabaseShowroom();
    
    for (let i = 0; i < showroomData.length; i++) {
      const showroom = showroomData[i];
      console.log(`Inserting showroom ${i + 1}/${showroomData.length}: ${showroom.showroom_name}`);
      
      try {
        const result = await showroomModel.create(showroom);
        console.log(`✓ Successfully inserted: ${showroom.showroom_name}`);
      } catch (error) {
        console.error(`✗ Failed to insert ${showroom.showroom_name}:`, error.message);
      }
    }
    
    console.log('\n✓ Showroom data insertion completed!');
    
    const allShowrooms = await showroomModel.getAll();
    console.log(`\nTotal showrooms in database: ${allShowrooms.length}`);
    
  } catch (error) {
    console.error('Error during showroom data insertion:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  insertShowroomData()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { insertShowroomData, showroomData };