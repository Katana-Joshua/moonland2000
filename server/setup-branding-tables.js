import { executeQuery } from './config/database.js';
import fs from 'fs';
import path from 'path';

const setupBrandingTables = async () => {
  try {
    console.log('🚀 Setting up branding and business settings tables...');
    
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'database', 'branding_and_business_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`🔧 Executing statement ${i + 1}: ${statement.substring(0, 50)}...`);
          const result = await executeQuery(statement);
          
          if (result.success) {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          } else {
            console.log(`⚠️ Statement ${i + 1} had issues:`, result.message);
          }
        } catch (error) {
          console.log(`❌ Error executing statement ${i + 1}:`, error.message);
        }
      }
    }
    
    // Test if tables exist and have data
    console.log('\n🔍 Testing table setup...');
    
    // Check business_settings table
    const businessSettingsResult = await executeQuery('SELECT * FROM business_settings LIMIT 1');
    if (businessSettingsResult.success && businessSettingsResult.data.length > 0) {
      console.log('✅ business_settings table exists and has data:', businessSettingsResult.data[0]);
    } else {
      console.log('❌ business_settings table issue:', businessSettingsResult.message);
    }
    
    // Check branding_assets table
    const brandingAssetsResult = await executeQuery('SELECT * FROM branding_assets LIMIT 1');
    if (brandingAssetsResult.success) {
      console.log('✅ branding_assets table exists');
      if (brandingAssetsResult.data.length > 0) {
        console.log('📁 Found branding assets:', brandingAssetsResult.data.length);
      } else {
        console.log('📁 No branding assets found (this is normal for new setup)');
      }
    } else {
      console.log('❌ branding_assets table issue:', brandingAssetsResult.message);
    }
    
    console.log('\n🎉 Branding tables setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    process.exit(0);
  }
};

// Run the setup
setupBrandingTables();
