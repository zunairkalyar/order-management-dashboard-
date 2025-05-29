# Order Management Dashboard Backend

This is the backend server for the Order Management Dashboard application. It provides REST APIs for managing orders, customers, and WhatsApp integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/order_management"
JWT_SECRET="your-super-secret-key-change-this-in-production"
PORT=3001
WHATSAPP_API_URL="your-whatsapp-api-url"
WHATSAPP_API_TOKEN="your-whatsapp-api-token"
```

3. Initialize the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database (optional)
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reload
- `npm run build`: Build the TypeScript code
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run database migrations
- `npm run seed`: Seed the database with sample data
- `npm test`: Run tests

## API Endpoints

### Orders
- `GET /api/orders`: Get all orders
- `GET /api/orders/:id`: Get a specific order
- `POST /api/orders`: Create a new order
- `PUT /api/orders/:id`: Update an order
- `DELETE /api/orders/:id`: Delete an order

### Customers
- `GET /api/customers`: Get all customers
- `GET /api/customers/:id`: Get a specific customer
- `POST /api/customers`: Create a new customer
- `PUT /api/customers/:id`: Update a customer
- `DELETE /api/customers/:id`: Delete a customer

### Audit Trail
- `GET /api/audit/order/:orderId`: Get audit trail for an order
- `POST /api/audit`: Create an audit log entry
