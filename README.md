# Meraki Coffee House

A full-stack coffee house management application with separated frontend and backend for easy hosting.

## Project Structure

```
meraki-1/
├── backend/          # Backend API server (Express.js)
├── frontend/         # Frontend application (Express.js with EJS)
└── README.md         # This file
```

## Architecture

- **Backend**: RESTful API server running on port 5005 (default)
- **Frontend**: Web application server running on port 5006 (default)
- **Database**: MongoDB (configure via environment variables)

## Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5005
MONGODB_URI=mongodb://localhost:27017/meraki
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
FRONTEND_URL=http://localhost:5006
```

4. Seed the database (optional):
```bash
npm run seed
```

5. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend API will be available at `http://localhost:5005`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
PORT=5006
API_URL=http://localhost:5005/api
```

4. Start the frontend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The frontend application will be available at `http://localhost:5006`

## Admin Access

After seeding the database, an admin user is automatically created with the following credentials:

- **Email**: `admin@meraki.com`
- **Password**: `admin123`

### Admin Panel Features

1. **Login** at `http://localhost:5006/login` with admin credentials
2. **Dashboard** (`/admin/dashboard`) - View statistics and recent orders
3. **Menu Management** (`/admin/menu`) - Add, edit, and delete menu items
4. **Order Management** (`/admin/orders`) - View and update order status
5. **Review Management** (`/admin/reviews`) - Approve pending reviews

### Creating Additional Admin Users

To create additional admin users, you can:

1. Register a normal user account
2. Manually update the user role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "user@example.com" },
     { $set: { role: "admin" } }
   );
   ```

## API Endpoints

All API endpoints are prefixed with `/api`:

- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/me`
- **Menu**: `/api/menu`, `/api/menu/featured`, `/api/menu/add-to-cart`, etc.
- **Orders**: `/api/order/submit`, `/api/order/my-orders`, etc.
- **Reviews**: `/api/review`, `/api/review/submit`, etc.
- **Admin**: `/api/admin/dashboard`, `/api/admin/menu`, etc.
- **Contact**: `/api/contact`

## Environment Variables

### Quick Setup

1. **Backend Setup:**
   ```bash
   cd backend
   npm run setup  # Creates .env from template
   # Edit .env with your actual values
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm run setup  # Creates .env from template
   # Edit .env with your actual values
   ```

### Backend (.env)
- `PORT`: Backend server port (default: 5005)
- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret key for session encryption (use strong random string in production)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5006)
- `COOKIE_SECURE`: Set to true for HTTPS in production
- `COOKIE_SAMESITE`: Set to 'strict' for production

### Frontend (.env)
- `PORT`: Frontend server port (default: 5006)
- `API_URL`: Backend API URL (default: http://localhost:5005/api)
- `NODE_ENV`: Environment (development/production)

### Production Configuration

For production, create `.env.production` files in both directories with production values:

**Backend Production (.env.production):**
```bash
PORT=5005
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meraki_prod?retryWrites=true&w=majority
SESSION_SECRET=your-super-secure-random-secret-here
FRONTEND_URL=https://your-frontend-domain.com
COOKIE_SECURE=true
COOKIE_SAMESITE=strict
```

**Frontend Production (.env.production):**
```bash
PORT=5006
NODE_ENV=production
API_URL=https://your-backend-domain.com/api
```

## Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Ensure MongoDB is accessible
3. Deploy the `backend` directory
4. Run `npm install --production`
5. Start with `npm start`

### Frontend Deployment

1. Set environment variables (especially `API_URL` to point to your backend)
2. Deploy the `frontend` directory
3. Run `npm install --production`
4. Start with `npm start`

### Recommended Hosting

- **Backend**: Heroku, Railway, Render, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, GitHub Pages (static), or same as backend
- **Database**: MongoDB Atlas (cloud) or self-hosted MongoDB

## Development

Both servers support hot-reload with nodemon:
- Backend: `npm run dev`
- Frontend: `npm run dev`

## Notes

- Sessions are used for authentication (cookies)
- CORS is configured to allow the frontend to communicate with the backend
- The frontend makes API calls using the `api.js` client
- All API responses follow a consistent JSON format with `success` and `message` fields
# Meraki
