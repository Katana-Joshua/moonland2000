const fs = require('fs');
const path = require('path');
const { executeQuery } = require('./config/database');

async function migrateImagesToBlob() {
  console.log('🔄 Starting image migration to BLOB storage...');

  try {
    // First, add the BLOB columns if they don't exist
    console.log('📊 Adding BLOB columns to database...');
    
    await executeQuery(`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_data LONGBLOB NULL AFTER image_url
    `);
    
    await executeQuery(`
      ALTER TABLE inventory ADD COLUMN IF NOT EXISTS image_data LONGBLOB NULL AFTER image_url
    `);

    console.log('✅ BLOB columns added successfully');

    // Migrate inventory images
    console.log('🖼️ Migrating inventory images...');
    const inventoryResult = await executeQuery(`
      SELECT id, image_url FROM inventory WHERE image_url IS NOT NULL AND image_data IS NULL
    `);

    if (inventoryResult.success && inventoryResult.data.length > 0) {
      console.log(`Found ${inventoryResult.data.length} inventory items with images to migrate`);
      
      for (const item of inventoryResult.data) {
        try {
          const imagePath = path.join(__dirname, '..', item.image_url);
          
          if (fs.existsSync(imagePath)) {
            const imageData = fs.readFileSync(imagePath);
            
            await executeQuery(`
              UPDATE inventory SET image_data = ? WHERE id = ?
            `, [imageData, item.id]);
            
            console.log(`✅ Migrated inventory image: ${item.id}`);
          } else {
            console.log(`⚠️ File not found: ${imagePath}`);
          }
        } catch (error) {
          console.error(`❌ Error migrating inventory image ${item.id}:`, error.message);
        }
      }
    } else {
      console.log('ℹ️ No inventory images to migrate');
    }

    // Migrate category images
    console.log('📁 Migrating category images...');
    const categoryResult = await executeQuery(`
      SELECT id, image_url FROM categories WHERE image_url IS NOT NULL AND image_data IS NULL
    `);

    if (categoryResult.success && categoryResult.data.length > 0) {
      console.log(`Found ${categoryResult.data.length} categories with images to migrate`);
      
      for (const category of categoryResult.data) {
        try {
          const imagePath = path.join(__dirname, '..', category.image_url);
          
          if (fs.existsSync(imagePath)) {
            const imageData = fs.readFileSync(imagePath);
            
            await executeQuery(`
              UPDATE categories SET image_data = ? WHERE id = ?
            `, [imageData, category.id]);
            
            console.log(`✅ Migrated category image: ${category.id}`);
          } else {
            console.log(`⚠️ File not found: ${imagePath}`);
          }
        } catch (error) {
          console.error(`❌ Error migrating category image ${category.id}:`, error.message);
        }
      }
    } else {
      console.log('ℹ️ No category images to migrate');
    }

    console.log('🎉 Image migration completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Test the new image serving endpoints');
    console.log('2. Once confirmed working, you can delete the uploads folder');
    console.log('3. Update your frontend to use the new image URLs if needed');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateImagesToBlob();
}

module.exports = { migrateImagesToBlob }; 