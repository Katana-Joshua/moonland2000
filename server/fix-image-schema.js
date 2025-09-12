const { executeQuery } = require('./config/database.js');

async function fixImageSchema() {
  try {
    console.log('🔧 Checking and fixing image schema...');
    
    // Check if image_data column exists in inventory table
    const inventoryStructure = await executeQuery('DESCRIBE inventory');
    const hasImageData = inventoryStructure.data.some(col => col.Field === 'image_data');
    
    if (!hasImageData) {
      console.log('📊 Adding image_data column to inventory table...');
      await executeQuery('ALTER TABLE inventory ADD COLUMN image_data LONGBLOB NULL AFTER image_url');
      console.log('✅ image_data column added to inventory table');
    } else {
      console.log('✅ image_data column already exists in inventory table');
    }
    
    // Check if image_data column exists in categories table
    const categoriesStructure = await executeQuery('DESCRIBE categories');
    const hasCategoryImageData = categoriesStructure.data.some(col => col.Field === 'image_data');
    
    if (!hasCategoryImageData) {
      console.log('📊 Adding image_data column to categories table...');
      await executeQuery('ALTER TABLE categories ADD COLUMN image_data LONGBLOB NULL AFTER image_url');
      console.log('✅ image_data column added to categories table');
    } else {
      console.log('✅ image_data column already exists in categories table');
    }
    
    // Check current data
    const inventoryData = await executeQuery(`
      SELECT id, name, 
             CASE WHEN image_url IS NOT NULL THEN 'HAS_URL' ELSE 'NO_URL' END as has_url,
             CASE WHEN image_data IS NOT NULL THEN CONCAT(LENGTH(image_data), ' bytes') ELSE 'NO_DATA' END as has_data
      FROM inventory 
      LIMIT 5
    `);
    
    console.log('\n📋 Current inventory data:');
    inventoryData.data.forEach(item => {
      console.log(`  - ${item.name}: URL=${item.has_url}, Data=${item.has_data}`);
    });
    
    console.log('\n🎉 Schema check complete!');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
  }
  
  process.exit(0);
}

fixImageSchema();
