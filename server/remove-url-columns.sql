-- Remove URL columns since we're using BLOB data directly
-- This will clean up the database structure

-- Remove image_url column from inventory table
ALTER TABLE inventory DROP COLUMN image_url;

-- Remove image_url column from categories table  
ALTER TABLE categories DROP COLUMN image_url;

-- Verify the changes
DESCRIBE inventory;
DESCRIBE categories;

-- Show current data structure
SELECT id, name, 
       CASE WHEN image_data IS NULL THEN 'NULL' ELSE CONCAT(LENGTH(image_data), ' bytes') END as image_size
FROM inventory 
WHERE image_data IS NOT NULL;

SELECT id, name, 
       CASE WHEN image_data IS NULL THEN 'NULL' ELSE CONCAT(LENGTH(image_data), ' bytes') END as image_size
FROM categories 
WHERE image_data IS NOT NULL; 