import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'moonland_pos',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  connectTimeout: 30000,
  reconnect: false,
  ssl: false
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection with retry logic
export const testConnection = async (retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = 2000;
  
  try {
    console.log('🔌 Attempting database connection with config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
      password: dbConfig.password ? '***' : 'empty',
      attempt: retryCount + 1
    });
    
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error(`❌ Database connection failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message);
    console.error('🔧 Database config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
      errorCode: error.code
    });
    
    // Retry on connection timeout errors
    if ((error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') && retryCount < maxRetries) {
      console.log(`🔄 Retrying database connection in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return testConnection(retryCount + 1);
    }
    
    console.error('💡 Troubleshooting steps:');
    console.error('   1. Check if MySQL server is running');
    console.error('   2. Verify database "moonland_pos" exists');
    console.error('   3. Check user permissions');
    console.error('   4. Verify .env file configuration');
    console.error('   5. Check network connectivity to database host');
    console.error('   6. Verify firewall settings');
    console.error('   7. Check if database host allows remote connections');
    
    if (error.code === 'ETIMEDOUT') {
      console.error('🚨 TIMEOUT ERROR: The database server is not responding');
      console.error('   - Check if the database server is running');
      console.error('   - Verify the host IP address is correct');
      console.error('   - Check network connectivity');
    }
    
    return false;
  }
};

// Execute query with error handling and retry logic
export const executeQuery = async (query, params = [], retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  try {
    const [rows] = await pool.execute(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error(`Database query error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message);
    
    // Check if it's a connection timeout error and we haven't exceeded max retries
    if ((error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') && retryCount < maxRetries) {
      console.log(`Retrying database query in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return executeQuery(query, params, retryCount + 1);
    }
    
    // Log detailed error information for debugging
    console.error('Database connection details:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      errorCode: error.code,
      errorMessage: error.message
    });
    
    return { success: false, error: error.message, code: error.code };
  }
};

// Execute transaction
export const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [rows] = await connection.execute(query, params);
      results.push(rows);
    }
    
    await connection.commit();
    return { success: true, data: results };
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
};

export default pool; 