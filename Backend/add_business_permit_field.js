import db from './database.js';

async function addBusinessPermitField() {
  try {
    // Check current seller_tb structure
    const [columns] = await db.query('DESCRIBE seller_tb');
    console.log('\nCurrent seller_tb structure:');
    console.table(columns);
    
    // Check if business_permit_file column exists
    const hasBusinessPermitFile = columns.some(col => col.Field === 'business_permit_file');
    
    if (!hasBusinessPermitFile) {
      console.log('\n❌ business_permit_file column does not exist. Adding it...');
      
      // Add business_permit_file column
      await db.query(`
        ALTER TABLE seller_tb 
        ADD COLUMN business_permit_file VARCHAR(255) 
        AFTER business_number
      `);
      
      console.log('✅ business_permit_file column added successfully!');
      
      // Update existing records to copy data from business_number field if it exists
      console.log('Updating existing records...');
      await db.query(`
        UPDATE seller_tb 
        SET business_permit_file = business_number 
        WHERE business_number IS NOT NULL
      `);
      
      console.log('✅ Existing records updated');
    } else {
      console.log('✅ business_permit_file column already exists');
    }
    
    // Show updated structure
    const [newColumns] = await db.query('DESCRIBE seller_tb');
    console.log('\nUpdated seller_tb structure:');
    console.table(newColumns);
    
  } catch (err) {
    console.error('❌ Database error:', err);
  }
  process.exit();
}

addBusinessPermitField();