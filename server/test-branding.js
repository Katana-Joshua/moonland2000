import { executeQuery } from './config/database.js';

const testBranding = async () => {
  try {
    console.log('🧪 Testing branding database setup...\n');
    
    // Test 1: Check if business_settings table exists
    console.log('1️⃣ Checking business_settings table...');
    const businessSettingsResult = await executeQuery('SHOW TABLES LIKE "business_settings"');
    if (businessSettingsResult.success && businessSettingsResult.data.length > 0) {
      console.log('✅ business_settings table exists');
    } else {
      console.log('❌ business_settings table does not exist');
      return;
    }
    
    // Test 2: Check business_settings structure
    console.log('\n2️⃣ Checking business_settings structure...');
    const structureResult = await executeQuery('DESCRIBE business_settings');
    if (structureResult.success) {
      console.log('📋 business_settings columns:');
      structureResult.data.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }
    
    // Test 3: Check if business_settings has data
    console.log('\n3️⃣ Checking business_settings data...');
    const dataResult = await executeQuery('SELECT * FROM business_settings');
    if (dataResult.success) {
      if (dataResult.data.length > 0) {
        console.log('📊 Found business_settings data:');
        console.log(JSON.stringify(dataResult.data[0], null, 2));
      } else {
        console.log('📭 No business_settings data found');
      }
    }
    
    // Test 4: Check if branding_assets table exists
    console.log('\n4️⃣ Checking branding_assets table...');
    const brandingAssetsResult = await executeQuery('SHOW TABLES LIKE "branding_assets"');
    if (brandingAssetsResult.success && brandingAssetsResult.data.length > 0) {
      console.log('✅ branding_assets table exists');
    } else {
      console.log('❌ branding_assets table does not exist');
      return;
    }
    
    // Test 5: Check branding_assets structure
    console.log('\n5️⃣ Checking branding_assets structure...');
    const assetsStructureResult = await executeQuery('DESCRIBE branding_assets');
    if (assetsStructureResult.success) {
      console.log('📋 branding_assets columns:');
      assetsStructureResult.data.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }
    
    // Test 6: Check if branding_assets has data
    console.log('\n6️⃣ Checking branding_assets data...');
    const assetsDataResult = await executeQuery('SELECT asset_type, file_name, mime_type, file_size FROM branding_assets');
    if (assetsDataResult.success) {
      if (assetsDataResult.data.length > 0) {
        console.log('📁 Found branding assets:');
        assetsDataResult.data.forEach(asset => {
          console.log(`   - ${asset.asset_type}: ${asset.file_name} (${asset.mime_type}, ${asset.file_size} bytes)`);
        });
      } else {
        console.log('📭 No branding assets found');
      }
    }
    
    console.log('\n🎉 Branding database test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
};

// Run the test
testBranding();
