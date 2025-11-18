const { supabaseAdmin } = require('../supabaseClient');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    console.log('🚀 Starting showroom migrations...\n');
    
    // Read showrooms migration
    const showroomsSqlPath = path.join(__dirname, '..', 'migrations', 'create_showrooms_table.sql');
    const showroomsSql = fs.readFileSync(showroomsSqlPath, 'utf8');
    
    console.log('📝 Creating showrooms table...');
    
    // Split SQL into individual statements and execute each one
    const showroomStatements = showroomsSql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of showroomStatements) {
      if (statement.trim()) {
        const { error } = await supabaseAdmin.rpc('sql_query', { 
          query: statement.trim() 
        });
        
        if (error && !error.message.includes('already exists')) {
          console.error('❌ Error executing showroom statement:', error);
        }
      }
    }
    
    console.log('✅ Showrooms table migration completed\n');
    
    // Read contacts migration
    const contactsSqlPath = path.join(__dirname, '..', 'migrations', 'create_showroom_contacts_table.sql');
    const contactsSql = fs.readFileSync(contactsSqlPath, 'utf8');
    
    console.log('📝 Creating showroom_contacts table...');
    
    // Split SQL into individual statements and execute each one
    const contactStatements = contactsSql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of contactStatements) {
      if (statement.trim()) {
        const { error } = await supabaseAdmin.rpc('sql_query', { 
          query: statement.trim() 
        });
        
        if (error && !error.message.includes('already exists')) {
          console.error('❌ Error executing contact statement:', error);
        }
      }
    }
    
    console.log('✅ Showroom_contacts table migration completed\n');
    
    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    
    const { data: showroomsData, error: showroomsError } = await supabaseAdmin
      .from('showrooms')
      .select('count', { count: 'exact', head: true });
      
    if (!showroomsError) {
      console.log('✅ Showrooms table verified - ready to use');
    } else {
      console.error('❌ Error verifying showrooms table:', showroomsError);
    }
    
    const { data: contactsData, error: contactsError } = await supabaseAdmin
      .from('showroom_contacts')
      .select('count', { count: 'exact', head: true });
      
    if (!contactsError) {
      console.log('✅ Showroom_contacts table verified - ready to use');
    } else {
      console.error('❌ Error verifying showroom_contacts table:', contactsError);
    }
    
    console.log('\n🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  
  process.exit(0);
}

runMigrations();