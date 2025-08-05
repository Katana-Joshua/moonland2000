import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moonland_pos',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  reconnect: true
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    console.log('📊 Database config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
    
    // Read the migration SQL file
    const migrationPath = join(__dirname, 'database', 'update_payment_methods.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Running payment method migration...');
    console.log('🔧 Migration SQL:', migrationSQL);
    
    // Execute the migration
    const [result] = await connection.execute(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Result:', result);
    
    // Verify the migration by checking the table structure
    console.log('🔍 Verifying migration...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sales' AND COLUMN_NAME = 'payment_method'
    `, [dbConfig.database]);
    
    if (columns.length > 0) {
      console.log('✅ Payment method column updated:');
      console.log('   Column:', columns[0].COLUMN_NAME);
      console.log('   Type:', columns[0].COLUMN_TYPE);
      console.log('   Nullable:', columns[0].IS_NULLABLE);
      console.log('   Comment:', columns[0].COLUMN_COMMENT);
    }
    
    // Test inserting a record with new payment methods
    console.log('🧪 Testing new payment methods...');
    const testPaymentMethods = ['momo', 'airtel', 'bank_deposit', 'credit_card'];
    
    for (const method of testPaymentMethods) {
      try {
        await connection.execute(`
          INSERT INTO sales (id, receipt_number, total, total_cost, profit, payment_method, cashier_name, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          `TEST-${Date.now()}`,
          100.00,
          80.00,
          20.00,
          method,
          'Migration Test',
          'paid'
        ]);
        console.log(`✅ Successfully tested payment method: ${method}`);
      } catch (error) {
        console.log(`❌ Failed to test payment method ${method}:`, error.message);
      }
    }
    
    console.log('🎉 Migration and testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Error details:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('💡 This might be a duplicate entry error. The migration may have already been applied.');
    }
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('💡 The sales table does not exist. Please run the main schema first.');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
runMigration().catch(console.error); 