-- Database schema for Branding and Business Settings
-- This ensures branding and business type are persistent across all users

-- Business Settings Table
CREATE TABLE IF NOT EXISTS business_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_type VARCHAR(50) NOT NULL DEFAULT 'general',
    business_name VARCHAR(255) NOT NULL DEFAULT 'Moon Land POS',
    slogan VARCHAR(500) DEFAULT 'Your Launchpad for Effortless Sales',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'UGX',
    timezone VARCHAR(100) DEFAULT 'Africa/Kampala',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Branding Assets Table
CREATE TABLE IF NOT EXISTS branding_assets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_type ENUM('logo', 'favicon', 'receipt_header', 'receipt_footer') NOT NULL,
    file_name VARCHAR(255),
    file_data LONGBLOB,
    mime_type VARCHAR(100),
    file_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default business settings
INSERT INTO business_settings (business_type, business_name, slogan) 
VALUES ('general', 'Moon Land POS', 'Your Launchpad for Effortless Sales')
ON DUPLICATE KEY UPDATE business_name = VALUES(business_name);

-- Create indexes for better performance
CREATE INDEX idx_business_settings_type ON business_settings(business_type);
CREATE INDEX idx_branding_assets_type ON branding_assets(asset_type);
