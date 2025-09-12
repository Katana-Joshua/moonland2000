#!/usr/bin/env node

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config();

console.log('🔍 Database Connection Diagnostic Tool');
console.log('=====================================');

// Display current environment variables
console.log('\n📋 Current Environment Variables:');
console.log('   DB_HOST:', process.env.DB_HOST || 'NOT SET (default: localhost)');
console.log('   DB_USER:', process.env.DB_USER || 'NOT SET (default: root)');
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET (default: empty)');
console.log('   DB_NAME:', process.env.DB_NAME || 'NOT SET (default: moonland_pos)');
console.log('   DB_PORT:', process.env.DB_PORT || 'NOT SET (default: 3306)');

// Test different connection configurations
const testConfigs = [
  {
    name: 'Environment Variables',
    config: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'moonland_pos',
      port: process.env.DB_PORT || 3306,
      connectTimeout: 10000,
      acquireTimeout: 10000
    }
  },
  {
    name: 'Localhost (Default)',
    config: {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'moonland_pos',
      port: 3306,
      connectTimeout: 10000,
      acquireTimeout: 10000
    }
  }
];

async function testConnection(config, configName) {
  console.log(`\n🧪 Testing ${configName}...`);
  console.log('   Host:', config.host);
  console.log('   Port:', config.port);
  console.log('   Database:', config.database);
  console.log('   User:', config.user);
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('   ✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('   ✅ Query test successful:', rows[0]);
    
    await connection.end();
    return true;
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
    console.log('   🔍 Error code:', error.code);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('   💡 TIMEOUT: Server is not responding');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   💡 CONNECTION REFUSED: Server is not running or port is blocked');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   💡 ACCESS DENIED: Check username and password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('   💡 DATABASE NOT FOUND: Database does not exist');
    }
    
    return false;
  }
}

async function runDiagnostics() {
  console.log('\n🚀 Starting connection tests...\n');
  
  let anySuccess = false;
  
  for (const testConfig of testConfigs) {
    const success = await testConnection(testConfig.config, testConfig.name);
    if (success) {
      anySuccess = true;
    }
  }
  
  console.log('\n📊 Diagnostic Summary:');
  console.log('=====================');
  
  if (anySuccess) {
    console.log('✅ At least one connection configuration works!');
    console.log('💡 Use the working configuration in your .env file');
  } else {
    console.log('❌ All connection tests failed');
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check if the database "moonland_pos" exists');
    console.log('3. Verify user permissions');
    console.log('4. Check firewall settings');
    console.log('5. For remote connections, ensure the host allows external connections');
    console.log('6. Create a .env file with correct database credentials');
  }
  
  console.log('\n📝 To create a .env file, copy env.example and update the values:');
  console.log('   cp env.example .env');
  console.log('   # Then edit .env with your actual database credentials');
}

// Run the diagnostics
runDiagnostics().catch(console.error);
