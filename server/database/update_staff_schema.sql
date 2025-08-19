-- Migration: Update staff table to use username/email instead of PIN
-- This migration removes the PIN field and adds username/email fields for modern authentication

-- Add new columns
ALTER TABLE staff ADD COLUMN username VARCHAR(100) UNIQUE;
ALTER TABLE staff ADD COLUMN email VARCHAR(255);
ALTER TABLE staff ADD COLUMN user_id INT;

-- Create index on username for faster lookups
CREATE INDEX idx_staff_username ON staff(username);

-- Add foreign key constraint to users table
ALTER TABLE staff ADD CONSTRAINT fk_staff_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Note: The PIN column will be removed in a future migration after data migration
-- For now, we keep it to avoid breaking existing data
-- You can manually remove it later with: ALTER TABLE staff DROP COLUMN pin;
