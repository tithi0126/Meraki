# Meraki Frontend

Frontend web application for Meraki Coffee House.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5006
API_URL=http://localhost:5005/api
```

3. Start server:
```bash
npm start
# or
npm run dev
```

The application will be available at `http://localhost:5006`

## Structure

- `views/` - EJS templates
- `public/` - Static assets (CSS, JS, images)
  - `js/api.js` - API client for making requests to backend
  - `js/main.js` - Main frontend JavaScript

## API Client

The frontend uses the `api.js` client to communicate with the backend API. The API URL is configured via environment variable and passed to the client through a data attribute in the script tag.

## Pages

- `/` - Home page
- `/menu` - Menu page
- `/cart` - Shopping cart
- `/login` - Login page
- `/register` - Registration page
- `/place-order` - Order placement
- `/my-orders` - User orders
- `/review` - Reviews page
- `/contact` - Contact page
- `/about` - About page
- `/admin/*` - Admin pages

## Development

The frontend server renders EJS templates and serves static files. Some pages fetch data from the backend API on the server side, while others load data client-side using the API client.
