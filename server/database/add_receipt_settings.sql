-- Migration script to add receipt_settings table
-- Run this if the receipt_settings table doesn't exist in your database

USE moonland_pos;

-- Create receipt_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS receipt_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    logo TEXT NULL,
    company_name VARCHAR(100) NOT NULL DEFAULT 'Moon Land',
    address TEXT NULL,
    phone VARCHAR(20) NULL,
    footer TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default receipt settings if none exist
INSERT IGNORE INTO receipt_settings (company_name, address, phone, footer) VALUES 
('Moon Land', '123 Cosmic Way, Galaxy City', '+123 456 7890', 'Thank you for your business!');

-- Verify the table was created
SELECT 'Receipt settings table created successfully' as status; 