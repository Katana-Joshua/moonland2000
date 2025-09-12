const { executeQuery } = require('./config/database.js');

async function testImageEndpoint() {
  try {
    console.log('🧪 Testing image endpoint...');
    
    // Get a sample inventory item with image data
    const result = await executeQuery(`
      SELECT id, name, 
             CASE WHEN image_data IS NOT NULL THEN CONCAT(LENGTH(image_data), ' bytes') ELSE 'NO_DATA' END as image_size
      FROM inventory 
      WHERE image_data IS NOT NULL 
      LIMIT 1
    `);
    
    if (result.success && result.data.length > 0) {
      const item = result.data[0];
      console.log(`✅ Found item with image: ${item.name} (${item.image_size})`);
      console.log(`🔗 Image URL: http://localhost:5000/api/pos/images/${item.id}`);
      console.log('💡 Test this URL in your browser to see if the image loads');
    } else {
      console.log('❌ No inventory items with image data found');
      
      // Check if there are any items at all
      const allItems = await executeQuery('SELECT id, name FROM inventory LIMIT 3');
      if (allItems.success && allItems.data.length > 0) {
        console.log('\n📋 Available inventory items:');
        allItems.data.forEach(item => {
          console.log(`  - ${item.name} (ID: ${item.id})`);
        });
        console.log('\n💡 Try uploading an image for one of these items');
      } else {
        console.log('❌ No inventory items found at all');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing image endpoint:', error);
  }
  
  process.exit(0);
}

testImageEndpoint();
