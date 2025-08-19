const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'moonland_pos',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔌 Connected to database successfully');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'database', 'update_staff_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`🔄 Executing statement ${i + 1}: ${statement.substring(0, 50)}...`);
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_DUP_FIELDNAME') {
            console.log(`⚠️ Statement ${i + 1} skipped (already exists): ${error.message}`);
          } else {
            console.error(`❌ Statement ${i + 1} failed: ${error.message}`);
            throw error;
          }
        }
      }
    }

    console.log('🎉 Staff table migration completed successfully!');
    console.log('📋 The staff table now supports username/email authentication');
    console.log('💡 You can now create staff members with proper user accounts');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
runMigration();
