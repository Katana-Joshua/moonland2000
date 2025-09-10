import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔌 Testing database connection...');
console.log('📋 Configuration:');
console.log('   Host:', process.env.DB_HOST);
console.log('   User:', process.env.DB_USER);
console.log('   Database:', process.env.DB_NAME);
console.log('   Port:', process.env.DB_PORT);
console.log('   Password:', process.env.DB_PASSWORD ? '***' : 'empty');

const testConnection = async () => {
  try {
    console.log('\n🔄 Attempting connection...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      connectTimeout: 30000,
      acquireTimeout: 30000,
      timeout: 30000,
      ssl: false
    });

    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    // Test if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 Available tables:', tables.map(t => Object.values(t)[0]));
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error code:', error.code);
    console.error('🔍 Error errno:', error.errno);
    console.error('🔍 Error sqlState:', error.sqlState);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 ETIMEDOUT Solutions:');
      console.log('   1. Check if MySQL server is running on Hostinger');
      console.log('   2. Verify remote connections are enabled in Hostinger');
      console.log('   3. Check firewall settings');
      console.log('   4. Try connecting from Hostinger control panel');
      console.log('   5. Check if your IP is whitelisted in Hostinger');
    }
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Access Denied Solutions:');
      console.log('   1. Check username and password');
      console.log('   2. Verify user has remote access permissions');
      console.log('   3. Check if user exists in database');
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Database Error Solutions:');
      console.log('   1. Check if database exists');
      console.log('   2. Verify database name is correct');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection Refused Solutions:');
      console.log('   1. Check if MySQL server is running');
      console.log('   2. Verify port number is correct');
      console.log('   3. Check firewall settings');
    }
  }
};

testConnection();
