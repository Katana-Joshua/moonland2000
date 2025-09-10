const fs = require('fs');
const mysql = require('mysql2/promise');

async function runScript() {
  try {
    console.log('🚀 Starting database schema setup...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('./database/missing_features_schema.sql', 'utf8');
    console.log('📖 SQL file read successfully');
    
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'moonland_pos',
      multipleStatements: true
    });
    
    console.log('🔗 Connected to database successfully');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
          }
        }
      }
    }
    
    console.log('🎉 Database schema setup completed!');
    
    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Current tables in database:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error running script:', error.message);
    process.exit(1);
  }
}

runScript();
