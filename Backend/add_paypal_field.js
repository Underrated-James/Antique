import db from './database.js';

async function addPaypalField() {
  try {
    // Check current seller_tb structure
    const [columns] = await db.query('DESCRIBE seller_tb');
    console.log('\nCurrent seller_tb structure:');
    console.table(columns);
    
    // Check if paypal_number column exists
    const hasPaypalNumber = columns.some(col => col.Field === 'paypal_number');
    
    if (!hasPaypalNumber) {
      console.log('\n❌ paypal_number column does not exist. Adding it...');
      
      // Add paypal_number column
      await db.query(`
        ALTER TABLE seller_tb 
        ADD COLUMN paypal_number VARCHAR(255) 
        AFTER phone_num
      `);
      
      console.log('✅ paypal_number column added successfully!');
    } else {
      console.log('✅ paypal_number column already exists');
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

addPaypalField();