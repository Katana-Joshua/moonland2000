# 🖥️ Moon Land POS - Backend Server

A robust Node.js backend server for the Moon Land Point of Sale system, built with Express.js and MySQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **POS Operations**: Inventory management, sales processing, shift management
- **Accounting System**: Vouchers, accounts, financial reports
- **Security**: CORS protection, rate limiting, input validation
- **Database**: MySQL with connection pooling and transactions
- **API**: RESTful API with comprehensive error handling

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd demomain/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Import the schema
   mysql -u your_user -p your_database < database/schema.sql
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=moonland_pos
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Setup

1. **Create MySQL database**
   ```sql
   CREATE DATABASE moonland_pos;
   USE moonland_pos;
   ```

2. **Import schema**
   ```bash
   mysql -u your_user -p moonland_pos < database/schema.sql
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/register`
Register a new user (admin only).

**Request:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "cashier"
}
```

### POS Endpoints

#### GET `/api/pos/inventory`
Get all inventory items.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-123",
      "name": "Beer",
      "price": 5000,
      "stock": 100,
      "category_name": "Beverages"
    }
  ]
}
```

#### POST `/api/pos/sales`
Process a new sale.

**Request:**
```json
{
  "items": [
    {
      "id": "item-123",
      "name": "Beer",
      "quantity": 2,
      "price": 5000,
      "costPrice": 3000
    }
  ],
  "paymentMethod": "cash",
  "total": 10000,
  "totalCost": 6000,
  "profit": 4000,
  "cashReceived": 10000,
  "changeGiven": 0
}
```

### Accounting Endpoints

#### GET `/api/accounting/reports/trial-balance`
Get trial balance report.

#### GET `/api/accounting/reports/profit-loss`
Get profit and loss report.

#### POST `/api/accounting/vouchers`
Create a new voucher.

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control

### Authorization
- Admin and cashier roles
- Route-level permissions
- Token validation

### Input Validation
- Express-validator for request validation
- SQL injection prevention
- XSS protection

### Rate Limiting
- Configurable rate limits
- IP-based limiting
- Request throttling

## 🗄️ Database Schema

### Core Tables

- **users**: User authentication and roles
- **inventory**: Product catalog and stock levels
- **sales**: Sales transactions
- **sale_items**: Individual items in sales
- **shifts**: Cashier work sessions
- **expenses**: Business expenses
- **categories**: Product categories
- **staff**: Staff members

### Accounting Tables

- **accounts**: Chart of accounts
- **vouchers**: Accounting vouchers
- **voucher_entries**: Individual voucher entries

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### API Testing
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test protected endpoint
curl http://localhost:5000/api/pos/inventory \
  -H "Authorization: Bearer <token>"
```

## 📊 Monitoring

### Health Endpoint
- `GET /health` - Server health status
- Returns server info and timestamp

### Logging
- Console logging for development
- Error tracking and debugging
- Request/response logging

## 🚀 Deployment

### Railway (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Render
1. Create web service
2. Set build and start commands
3. Configure environment variables

### Heroku
1. Install Heroku CLI
2. Create app
3. Set config variables
4. Deploy

## 🔧 Development

### Project Structure
```
server/
├── config/
│   └── database.js          # Database configuration
├── database/
│   └── schema.sql           # Database schema
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── pos.js               # POS operations routes
│   └── accounting.js        # Accounting routes
├── .env                     # Environment variables
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md                # This file
```

### Scripts
```bash
npm run dev      # Start development server
npm start        # Start production server
npm test         # Run tests (if configured)
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**
   - Check database credentials
   - Verify database exists
   - Test connection manually

2. **CORS Errors**
   - Check CORS_ORIGIN setting
   - Verify frontend URL
   - Test with Postman

3. **Authentication Issues**
   - Check JWT secret
   - Verify token format
   - Check user exists in database

4. **Port Issues**
   - Check if port is available
   - Verify PORT environment variable
   - Check firewall settings

## 📞 Support

For issues and questions:
1. Check the logs
2. Verify environment variables
3. Test database connection
4. Check API documentation
5. Review error messages

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Moon Land POS Backend** - Built with ❤️ for modern business management 