    -- =====================================================
    -- MISSING FEATURES DATABASE SCHEMA (FIXED VERSION)
    -- Run this SQL to add all missing tables for new features
    -- =====================================================

    -- Currency Settings Table
    CREATE TABLE IF NOT EXISTS currency_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        currency_code VARCHAR(3) NOT NULL DEFAULT 'UGX',
        currency_symbol VARCHAR(10) NOT NULL DEFAULT 'UGX',
        currency_name VARCHAR(100) NOT NULL DEFAULT 'Ugandan Shilling',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Insert default currency
    INSERT IGNORE INTO currency_settings (currency_code, currency_symbol, currency_name) 
    VALUES ('UGX', 'UGX', 'Ugandan Shilling');

    -- Suppliers Table
    CREATE TABLE IF NOT EXISTS suppliers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Uganda',
        payment_terms VARCHAR(255),
        credit_limit DECIMAL(15,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Purchase Orders Table
    CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        po_number VARCHAR(50) UNIQUE NOT NULL,
        supplier_id INT NOT NULL,
        order_date DATE NOT NULL,
        expected_delivery_date DATE,
        status ENUM('pending', 'ordered', 'received', 'cancelled') DEFAULT 'pending',
        total_amount DECIMAL(15,2) DEFAULT 0,
        notes TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Purchase Order Items Table
    CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        po_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        description TEXT,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(15,2) NOT NULL,
        received_quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Stock Movements Table
    CREATE TABLE IF NOT EXISTS stock_movements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        item_id INT NOT NULL,
        movement_type ENUM('sale', 'purchase', 'return', 'adjustment', 'transfer') NOT NULL,
        quantity_change INT NOT NULL,
        previous_stock INT NOT NULL,
        new_stock INT NOT NULL,
        reference_type ENUM('sale', 'purchase_order', 'manual_adjustment', 'return') NOT NULL,
        reference_id INT,
        notes TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Sales Returns Table
    CREATE TABLE IF NOT EXISTS sales_returns (
        id INT PRIMARY KEY AUTO_INCREMENT,
        original_sale_id INT NOT NULL,
        return_receipt_number VARCHAR(50) UNIQUE NOT NULL,
        return_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        return_reason TEXT,
        total_refund DECIMAL(15,2) NOT NULL,
        processed_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Sales Return Items Table
    CREATE TABLE IF NOT EXISTS sales_return_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        return_id INT NOT NULL,
        item_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(15,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Receipt Templates Table
    CREATE TABLE IF NOT EXISTS receipt_templates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        template_name VARCHAR(100) NOT NULL,
        header_text TEXT,
        footer_text TEXT,
        show_logo BOOLEAN DEFAULT TRUE,
        show_business_info BOOLEAN DEFAULT TRUE,
        show_tax_info BOOLEAN DEFAULT TRUE,
        show_cashier_info BOOLEAN DEFAULT TRUE,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Insert default receipt template
    INSERT IGNORE INTO receipt_templates (template_name, header_text, footer_text, is_default) 
    VALUES ('Default Template', 'Thank you for your business!', 'Please come again!', TRUE);

    -- Staff Activity Logs Table
    CREATE TABLE IF NOT EXISTS staff_activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        staff_id INT NOT NULL,
        activity_type ENUM('login', 'logout', 'sale', 'return', 'inventory_update', 'expense', 'settings_change') NOT NULL,
        activity_description TEXT NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Customer Reviews Table
    CREATE TABLE IF NOT EXISTS customer_reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_name VARCHAR(255),
        customer_contact VARCHAR(100),
        sale_id INT,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Manual Entries Table (for Admin Terminal)
    CREATE TABLE IF NOT EXISTS manual_entries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        entry_type ENUM('sale', 'expense') NOT NULL,
        entry_date DATE NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        description TEXT NOT NULL,
        reference_data JSON,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Add indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id ON stock_movements(item_id);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
    CREATE INDEX IF NOT EXISTS idx_sales_returns_original_sale_id ON sales_returns(original_sale_id);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
    CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_staff_id ON staff_activity_logs(staff_id);
    CREATE INDEX IF NOT EXISTS idx_staff_activity_logs_created_at ON staff_activity_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_customer_reviews_sale_id ON customer_reviews(sale_id);

    -- Update existing tables to support new features
    ALTER TABLE sales ADD COLUMN IF NOT EXISTS return_status ENUM('none', 'partial', 'full') DEFAULT 'none';
    ALTER TABLE sales ADD COLUMN IF NOT EXISTS original_sale_id INT NULL;
    ALTER TABLE sales ADD COLUMN IF NOT EXISTS is_return BOOLEAN DEFAULT FALSE;

    -- Update inventory table to support barcode
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS barcode VARCHAR(100) UNIQUE;
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS supplier_id INT NULL;
    ALTER TABLE inventory ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0;

    -- Update sales table to support customer reviews
    ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_rating INT CHECK (customer_rating >= 1 AND customer_rating <= 5);
    ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_review TEXT;

    -- Update staff table to support permissions (if not already exists)
    ALTER TABLE staff ADD COLUMN IF NOT EXISTS permissions JSON;

    -- Insert sample data for testing
    INSERT IGNORE INTO suppliers (name, contact_person, email, phone, address, city) VALUES
    ('ABC Suppliers Ltd', 'John Doe', 'john@abcsuppliers.com', '+256700123456', 'Plot 123, Industrial Area', 'Kampala'),
    ('XYZ Trading Co', 'Jane Smith', 'jane@xyztrading.com', '+256700654321', 'Plot 456, Nakawa', 'Kampala');

    -- Insert sample receipt templates
    INSERT IGNORE INTO receipt_templates (template_name, header_text, footer_text) VALUES
    ('Restaurant Template', 'Welcome to our restaurant!', 'Thank you for dining with us!'),
    ('Retail Template', 'Thank you for shopping with us!', 'Visit us again soon!');

    COMMIT;
