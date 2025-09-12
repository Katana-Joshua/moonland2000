#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log('🔧 Moon Land POS - Environment Setup');
  console.log('=====================================\n');
  
  console.log('This tool will help you create a .env file with the correct database configuration.\n');
  
  // Check if .env already exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('❌ Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  console.log('\n📋 Database Configuration:');
  console.log('==========================');
  
  const dbHost = await question('Database Host (default: localhost): ') || 'localhost';
  const dbUser = await question('Database Username (default: root): ') || 'root';
  const dbPassword = await question('Database Password (default: empty): ') || '';
  const dbName = await question('Database Name (default: moonland_pos): ') || 'moonland_pos';
  const dbPort = await question('Database Port (default: 3306): ') || '3306';
  
  console.log('\n🔐 JWT Configuration:');
  console.log('=====================');
  
  const jwtSecret = await question('JWT Secret (default: auto-generated): ') || generateJWTSecret();
  
  console.log('\n🌐 CORS Configuration:');
  console.log('======================');
  
  const corsOrigin = await question('CORS Origin (default: *): ') || '*';
  const corsCredentials = await question('CORS Credentials (default: false): ') || 'false';
  
  // Create .env content
  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=${dbHost}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}
DB_PORT=${dbPort}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=${corsOrigin}
CORS_CREDENTIALS=${corsCredentials}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
    console.log(`📁 Location: ${envPath}`);
    
    console.log('\n🧪 Testing database connection...');
    
    // Test the connection
    const { testConnection } = await import('./config/database.js');
    const connected = await testConnection();
    
    if (connected) {
      console.log('✅ Database connection test successful!');
      console.log('\n🚀 You can now start your server with: npm start');
    } else {
      console.log('❌ Database connection test failed.');
      console.log('💡 Please check your database configuration and try running:');
      console.log('   node test-connection.js');
    }
    
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
  
  rl.close();
}

function generateJWTSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Run the setup
setupEnvironment().catch(console.error);
