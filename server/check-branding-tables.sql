-- Check if branding tables exist and have data
-- Run this in your MySQL database to diagnose the issue

-- Check if business_settings table exists
SHOW TABLES LIKE 'business_settings';

-- Check if branding_assets table exists
SHOW TABLES LIKE 'branding_assets';

-- Check business_settings table structure
DESCRIBE business_settings;

-- Check branding_assets table structure
DESCRIBE branding_assets;

-- Check if business_settings has data
SELECT * FROM business_settings;

-- Check if branding_assets has data
SELECT asset_type, file_name, mime_type, file_size FROM branding_assets;

-- Count records in each table
SELECT 'business_settings' as table_name, COUNT(*) as record_count FROM business_settings
UNION ALL
SELECT 'branding_assets' as table_name, COUNT(*) as record_count FROM branding_assets;
