-- Update payment_method ENUM to include new payment methods
-- This script should be run on existing databases to add support for new payment methods

-- For MySQL/MariaDB - Update the ENUM to include new payment methods
ALTER TABLE sales MODIFY COLUMN payment_method ENUM('cash', 'credit', 'mobile_money', 'momo', 'airtel', 'bank_deposit', 'credit_card') NOT NULL;

-- Alternative approach if ENUM modification fails - Convert to VARCHAR
-- ALTER TABLE sales MODIFY COLUMN payment_method VARCHAR(20) NOT NULL;

-- Add a comment to document the change
ALTER TABLE sales MODIFY COLUMN payment_method ENUM('cash', 'credit', 'mobile_money', 'momo', 'airtel', 'bank_deposit', 'credit_card') NOT NULL COMMENT 'Payment methods: cash, credit, mobile_money (legacy), momo, airtel, bank_deposit, credit_card'; 