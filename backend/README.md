# Meraki Backend API

RESTful API server for Meraki Coffee House application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5005
MONGODB_URI=mongodb://localhost:27017/meraki
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
FRONTEND_URL=http://localhost:5006
```

3. Seed database (optional):
```bash
npm run seed
```

4. Start server:
```bash
npm start
# or
npm run dev
```

## API Endpoints

All endpoints return JSON responses.

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Menu
- `GET /api/menu` - Get all menu items (grouped by category)
- `GET /api/menu/featured` - Get featured menu items
- `GET /api/menu/:id` - Get single menu item
- `GET /api/menu/cart/items` - Get cart items
- `POST /api/menu/add-to-cart` - Add item to cart
- `POST /api/menu/update-cart` - Update cart item quantity
- `POST /api/menu/remove-from-cart` - Remove item from cart
- `POST /api/menu/clear-cart` - Clear cart

### Orders
- `GET /api/order/cart-summary` - Get cart summary (requires auth)
- `POST /api/order/submit` - Submit order (requires auth)
- `GET /api/order/my-orders` - Get user's orders (requires auth)
- `GET /api/order/:id` - Get single order (requires auth)

### Reviews
- `GET /api/review` - Get all approved reviews
- `GET /api/review/featured` - Get featured reviews
- `POST /api/review/submit` - Submit review (requires auth)

### Contact
- `POST /api/contact` - Submit contact form

### Admin (requires admin role)
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/menu` - Get all menu items
- `POST /api/admin/menu/add` - Add menu item
- `PUT /api/admin/menu/:id` - Update menu item
- `DELETE /api/admin/menu/:id` - Delete menu item
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/reviews` - Get all reviews
- `PUT /api/admin/reviews/:id/approve` - Approve review
- `DELETE /api/admin/reviews/:id` - Delete review
- `GET /api/admin/contact-messages` - Get contact messages

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Authentication

The API uses session-based authentication. Sessions are stored in cookies and require the `credentials: 'include'` option in frontend requests.
