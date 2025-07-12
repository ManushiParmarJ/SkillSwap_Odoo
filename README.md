# Skill Swap Platform

A full-stack MERN application that enables users to list skills they offer and want, manage swap requests, and includes admin functionalities for moderation and reporting.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT persistence
- **Skill Management**: List, edit, and manage your skills
- **User Browsing**: Discover and connect with other users
- **Swap System**: Request and manage skill swaps
- **Admin Dashboard**: Moderation tools and platform management
- **Responsive Design**: Modern UI with Tailwind CSS
- **Multi-Port Support**: Run frontend on different ports (3000-3005)

## 🛠️ Tech Stack 

- **Frontend**: React, React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB, JWT
- **Database**: MongoDB
- **Authentication**: JWT with persistent login

## 📋 Prerequisites 

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (root, backend, and frontend)
npm run install-all
```

### 2. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (Windows)
mongod

# Or if using MongoDB as a service
net start MongoDB
```

### 3. Start the Application

#### Option A: Use the Startup Script (Windows)
```bash
# Run the batch file
start.bat
```

#### Option B: Use npm Commands

**Default ports (Backend: 5000, Frontend: 3000):**
```bash
npm run dev
```

**Different frontend ports:**
```bash
# Frontend on port 3001
npm run dev:3001

# Frontend on port 3002
npm run dev:3002

# Frontend on port 3003
npm run dev:3003

# Frontend on port 3004
npm run dev:3004

# Frontend on port 3005
npm run dev:3005
```

#### Option C: Start Servers Separately

**Terminal 1 - Backend:**
```bash
npm run backend
```

**Terminal 2 - Frontend:**
```bash
npm run frontend
```

### 4. Access the Application

- **Frontend**: http://localhost:3000 (or chosen port)
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔧 Port Configuration

- **Backend**: Port 5000 (fixed)
- **Frontend**: Port 3000 (default) or 3001-3005
- **Database**: MongoDB (port 27017)

## 🔐 Authentication & Refresh Handling

The application now properly handles authentication persistence:

- **Token Storage**: JWT tokens are stored in localStorage
- **Auto-refresh**: Authentication state is maintained on page refresh
- **Loading States**: Proper loading indicators during auth checks
- **Error Handling**: Graceful error handling for invalid tokens
- **No Login Prompts**: Users stay logged in after page refresh

## 📁 Project Structure

```
skillswap-platform/
├── backend/
│   ├── config.env          # Environment variables
│   ├── server.js           # Main server file
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── uploads/            # File uploads
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main app component
│   └── package.json
├── start.bat              # Windows startup script
└── README.md
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Swaps
- `GET /api/swaps` - Get all swaps
- `POST /api/swaps` - Create swap request
- `PUT /api/swaps/:id` - Update swap status

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:id/ban` - Ban user
- `POST /api/admin/messages` - Send platform message

## 🔧 Troubleshooting

### Common Issues

1. **Proxy Error (ECONNREFUSED)**
   - Ensure backend is running on port 5000
   - Check if MongoDB is running
   - Verify environment variables

2. **Authentication Issues**
   - Clear browser localStorage: `localStorage.clear()`
   - Check JWT_SECRET in backend config
   - Verify token expiration

3. **Port Conflicts**
   - Backend: Change PORT in config.env
   - Frontend: Use different port with npm run dev:3001, etc.
   - Update proxy setting in frontend/package.json

4. **MongoDB Connection Issues**
   - Ensure MongoDB is running: `mongod`
   - Check MONGODB_URI in config.env
   - Verify network connectivity

5. **Refresh Login Issues**
   - Clear browser cache and localStorage
   - Check if token is valid in browser dev tools
   - Verify backend /api/auth/me endpoint

### Debug Commands

```bash
# Check if ports are in use
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Check MongoDB status
mongo --eval "db.runCommand('ping')"

# Test backend health
curl http://localhost:5000/api/health

# Clear browser localStorage (in browser console)
localStorage.clear()
```

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Update `MONGODB_URI` to production database
3. Set secure `JWT_SECRET`
4. Configure CORS for production domain

### Frontend Deployment
1. Run `npm run build`
2. Deploy `build` folder to hosting service
3. Update API base URL for production

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Check MongoDB connection
- Verify environment variables
