# Wanderlust Booking Server

This is the backend server for the Wanderlust travel booking application, built with Node.js, Express.js, and MongoDB, and optimized as a serverless function for Vercel deployment.

## 🚀 Live URL
- **Server Endpoint:** [https://wanderlust-booking-server.vercel.app](https://wanderlust-booking-server.vercel.app)

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with serverless connection caching)
- **Authentication & Security:** `jose` (JWT verification via Remote JWKS)
- **Middleware:** CORS, Dotenv
- **Deployment:** Vercel

## ⚙️ Environment Variables
Create a `.env` file in your root directory and configure the following variables:

```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
CLIENT_URL=your_frontend_client_url