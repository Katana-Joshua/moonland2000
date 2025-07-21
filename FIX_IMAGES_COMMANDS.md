# Commands to Fix Image System

## Step 1: Remove URL Columns from Database

Run these SQL commands in phpMyAdmin or your MySQL client:

```sql
-- Remove image_url column from inventory table
ALTER TABLE inventory DROP COLUMN image_url;

-- Remove image_url column from categories table  
ALTER TABLE categories DROP COLUMN image_url;

-- Verify the changes
DESCRIBE inventory;
DESCRIBE categories;
```

## Step 2: Check Current BLOB Data

```sql
-- Check inventory items with BLOB data
SELECT id, name, 
       CASE WHEN image_data IS NULL THEN 'NULL' ELSE CONCAT(LENGTH(image_data), ' bytes') END as image_size
FROM inventory 
WHERE image_data IS NOT NULL;

-- Check categories with BLOB data
SELECT id, name, 
       CASE WHEN image_data IS NULL THEN 'NULL' ELSE CONCAT(LENGTH(image_data), ' bytes') END as image_size
FROM categories 
WHERE image_data IS NOT NULL;
```

## Step 3: Test Image Serving

After running the SQL commands, test the image endpoints:

1. **Test inventory image:**
   ```
   http://localhost:5000/api/pos/images/item-1753034670577-119
   ```

2. **Test category image (if any):**
   ```
   http://localhost:5000/api/pos/category-images/1
   ```

## Step 4: Restart Server

```bash
cd server
npm start
```

## Step 5: Test Frontend

1. **Open your frontend:** `http://localhost:5173`
2. **Check browser console** for any errors
3. **Images should now load** from the correct endpoints

## What Changed:

1. **Removed URL columns** - No more `image_url` columns in database
2. **Fixed backend routes** - Now generate URLs dynamically based on BLOB data
3. **Updated frontend** - Uses centralized `buildImageUrl()` function
4. **Correct endpoints** - `/api/images/{id}` for inventory, `/api/category-images/{id}` for categories

## Expected Results:

- Images should load from: `http://localhost:5000/api/pos/images/item-1753034670577-119`
- No more CORS errors
- BLOB data is served directly from database
- URLs are generated dynamically based on item/category ID 