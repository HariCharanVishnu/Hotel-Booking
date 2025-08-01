<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# Hotel Booking System

A complete hotel booking system built with React, Node.js, and MongoDB. Features include user authentication, hotel management, room booking, and a modern responsive UI.

## Features

- 🏨 **Hotel Management** - Add, edit, and manage hotels
- 🛏️ **Room Booking** - Book rooms with date selection and guest count
- 👤 **User Authentication** - Secure authentication with Clerk
- 💳 **Payment Integration** - Stripe payment processing
- 📱 **Responsive Design** - Mobile-first responsive UI
- 🔍 **Search & Filters** - Advanced search with multiple filters
- 📊 **Dashboard** - Hotel owner dashboard with analytics
- ⭐ **Reviews & Ratings** - Hotel and room rating system

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Clerk** - Authentication service

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens
- **Stripe** - Payment processing
- **Multer** - File upload handling

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hotel-Booking
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Environment Setup**

   Create the following environment files:

   **Server (.env file in server directory):**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hotel-booking
   JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
   CLIENT_URL=http://localhost:5173
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   ```

   **Client (.env file in client directory):**
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   ```

4. **Database Setup**
   - Make sure MongoDB is running locally or update the `MONGODB_URI` in the server `.env` file
   - The database will be created automatically when you first run the application

5. **Run the application**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the server (port 5000) and client (port 5173) simultaneously.

## Project Structure

```
Hotel-Booking/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── assets/        # Images and icons
│   │   └── ...
│   ├── public/            # Static files
│   └── ...
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── middleware/       # Custom middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── ...
└── ...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get single hotel
- `POST /api/hotels` - Create hotel (Owner only)
- `PUT /api/hotels/:id` - Update hotel (Owner only)
- `DELETE /api/hotels/:id` - Delete hotel (Owner only)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get single room
- `POST /api/rooms` - Create room (Owner only)
- `PUT /api/rooms/:id` - Update room (Owner only)
- `DELETE /api/rooms/:id` - Delete room (Owner only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## Available Scripts

### Root Directory
- `npm run dev` - Start both client and server in development mode
- `npm run server` - Start only the server
- `npm run client` - Start only the client
- `npm run build` - Build the client for production
- `npm run install-all` - Install dependencies for all packages
- `npm run setup` - Run the setup script

### Client Directory
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server Directory
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Environment Variables

### Server (.env)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `CLERK_SECRET_KEY` - Clerk secret key for authentication

### Client (.env)
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:

1. Check the [Issues](../../issues) page for existing solutions
2. Create a new issue with detailed information about your problem
3. Contact the development team

## Acknowledgments

- [Clerk](https://clerk.com/) for authentication
- [Stripe](https://stripe.com/) for payment processing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Unsplash](https://unsplash.com/) for sample images 
>>>>>>> 13eeb00 (Initial commit: Hotel Booking System with fixes and improvements)
