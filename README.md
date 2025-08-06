# Hotel Booking System

A modern hotel booking application built with React frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hotel-Booking
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   **Server (.env in server directory):**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/hotel-booking
   JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
   CLIENT_URL=http://localhost:5173
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   ```

   **Client (.env in client directory):**
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
Hotel-Booking/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── assets/       # Images and icons
│   │   └── App.jsx       # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── models/           # MongoDB models
│   ├── middleware/       # Custom middleware
│   ├── config/          # Configuration files
│   └── package.json
└── package.json          # Root package.json
```

## 🔧 Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:server` - Start only the backend server
- `npm run dev:client` - Start only the frontend client
- `npm run install-all` - Install dependencies for all packages
- `npm run build` - Build the frontend for production

## 🛠️ Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Make sure MongoDB is running: `mongod`
   - Check if the connection string is correct in server/.env
   - Try using `mongodb://127.0.0.1:27017/hotel-booking` instead of `localhost`

2. **Clerk Authentication Issues**
   - Ensure you have a valid Clerk publishable key in client/.env
   - Check that the key starts with `pk_test_` or `pk_live_`

3. **Port Already in Use**
   - Change the port in server/.env: `PORT=5001`
   - Update client/.env: `VITE_API_URL=http://localhost:5001/api`

4. **Module Not Found Errors**
   - Run `npm run install-all` to install all dependencies
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Development Tips

- Use the browser's developer tools to check for console errors
- Check the terminal output for server-side errors
- Use the health check endpoint to verify the server is running
- The application will work without MongoDB for frontend testing

## 🎯 Features

- **User Authentication** - Powered by Clerk
- **Hotel Management** - CRUD operations for hotels
- **Room Booking** - Search and book hotel rooms
- **Responsive Design** - Works on all devices
- **Modern UI** - Built with Tailwind CSS
- **Real-time Search** - Filter hotels by location and amenities

## 🛡️ Security

- JWT-based authentication
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- Helmet.js for security headers

## 📝 License

This project is licensed under the ISC License. 