# Netflix Clone - Content Distribution Platform

A full-stack web application for streaming movies and TV series, built with Node.js, Express, MongoDB, and vanilla JavaScript. This project implements a Netflix-like platform with user authentication, profile management, content playback, and personalized recommendations.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Key Features Explained](#key-features-explained)

---

## ✨ Features

### User Management
- **User Registration & Login** with password encryption (bcrypt)
- **Session Management** using express-session and MongoDB store
- **Multiple Profiles** per user account (up to 5 profiles)
- **Profile Switching** to maintain separate viewing histories and preferences

### Content Browsing
- **Homepage Feed** with personalized content recommendations
- **Continue Watching** section to resume playback from where you left off
- **Genre Navigation** with dynamic genre detection from database
- **Content Search** by title
- **Popular Content** display using aggregation queries
- **Newest Content** for each genre (top 10)
- **Similar Content** recommendations based on genre matching

### Content Playback
- **Video Player** with standard controls (play/pause, timeline, fullscreen)
- **Advanced Controls** (skip forward/backward 10 seconds)
- **Resume Playback** across devices with position tracking
- **Episode List** for series with progress indicators
- **Next Episode** button for seamless binge-watching

### Content Details
- Full content information (synopsis, rating, year, genre)
- Like/Unlike functionality per profile
- Similar content suggestions
- Episode list with watch progress for TV series
- Actor information with Wikipedia integration

### Admin Features
- **Add Content** page (admin-only access)
- Upload videos (MP4) and thumbnail images
- External API integration for content ratings (OMDb API)
- Content management (create, edit, delete)

### Statistics & Analytics
- **Viewing Statistics** with dynamic charts
- Daily views per profile (bar chart)
- Content popularity by genre (pie chart)
- Watch history tracking

### Genre Pages
- Infinite scroll for content browsing
- Sort by rating, popularity, year
- Filter by watched/unwatched status
- Responsive grid layout

---

## 🛠 Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with responsive design
- **Bootstrap 5** - UI components and grid system
- **JavaScript (ES6+)** - Client-side logic and interactivity

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **EJS** - Server-side templating engine

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Modeling) library

### Security & Authentication
- **bcrypt** - Password hashing
- **express-session** - Session management
- **connect-mongo** - MongoDB session store

### Additional Libraries
- **dotenv** - Environment variable management
- **axios** - HTTP client for API requests
- **nodemon** - Development server with auto-restart

---

## 📁 Project Structure

```
Netfilx-Project/
├── server.js                    # Main application entry point
├── package.json                 # Project dependencies and scripts
├── .env                         # Environment variables (not in repo)
├── README.md                    # This file
│
├── public/                      # Static client-side files
│   ├── styles.css              # Global styles
│   ├── shared.js               # Shared client utilities
│   ├── login.html              # Login page
│   ├── login.js                # Login page logic
│   ├── register.html           # Registration page
│   ├── register.js             # Registration logic
│   ├── homepage.js             # Homepage client logic
│   ├── content.js              # Content details page logic
│   ├── player.js               # Video player controls
│   ├── movies.js               # Movies page logic
│   ├── series.js               # Series page logic
│   ├── search.js               # Search functionality
│   ├── settings.js             # Settings page logic
│   ├── statistics.js           # Statistics charts
│   └── add-content.html        # Admin content upload form
│
├── server/                      # Server-side code
│   ├── models/                 # Database models (Mongoose schemas)
│   │   ├── User.js             # User model with profiles
│   │   ├── Profile.js          # Profile model with viewing data
│   │   ├── Content.js          # Content model (movies/series/episodes)
│   │   ├── ViewingHabit.js     # Viewing habits tracking
│   │   ├── ViewingHistory.js   # Watch history schema
│   │   ├── Catalog.js          # User content catalogs
│   │   └── Log.js              # System logging model
│   │
│   ├── controllers/            # Business logic
│   │   ├── userController.js        # User CRUD operations
│   │   ├── profileController.js     # Profile management
│   │   ├── contentController.js     # Content CRUD & queries
│   │   ├── playerController.js      # Player page rendering
│   │   ├── catalogController.js     # User catalog management
│   │   └── viewingHabitController.js # Viewing habits tracking
│   │
│   ├── routes/                 # API route definitions
│   │   ├── users.js            # User authentication & management
│   │   ├── profile.js          # Profile operations
│   │   ├── content.js          # Content CRUD endpoints
│   │   ├── player.js           # Player page routes
│   │   ├── catalogs.js         # Catalog endpoints
│   │   ├── viewingHabits.js    # Viewing habits endpoints
│   │   ├── watchProgress.js    # Watch position tracking
│   │   └── ratingLookup.js     # External API for ratings
│   │
│   ├── middleware/             # Custom middleware
│   │   ├── auth.js             # Authentication & authorization
│   │   └── logger.js           # Request/error logging
│   │
│   ├── services/               # External services
│   │   └── omdbService.js      # OMDb API integration
│   │
│   └── utils/                  # Utility functions
│
└── views/                      # EJS templates (server-side rendered)
    ├── homepage.ejs            # Main feed page
    ├── profile.ejs             # Profile selection page
    ├── content.ejs             # Content details page
    ├── player.ejs              # Video player page
    ├── movies.ejs              # Movies genre page
    ├── series.ejs              # Series genre page
    ├── search.ejs              # Search results page
    ├── settings.ejs            # User settings page
    ├── statistics.ejs          # Statistics dashboard
    ├── error.ejs               # Error page
    └── partials/               # Reusable template components
        ├── _Navbar.ejs         # Navigation bar
        ├── _ReverseNavbar.ejs  # Reverse color navbar
        └── _ContentSlider.ejs  # Content carousel component
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** (comes with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/shirabenben/Netfilx-Project.git
cd Netfilx-Project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/netflix-clone

# Session Secret (use a strong random string)
SESSION_SECRET=your-super-secret-session-key-change-this

# Server Port
PORT=3000

# OMDb API Key (get free key from http://www.omdbapi.com/apikey.aspx)
OMDB_API_KEY=your-omdb-api-key

# Content Fetch Limit
CONTENT_FETCH_LIMIT=1000
```

### 4. Set Up MongoDB
Make sure MongoDB is running on your system:

**Windows:**
```powershell
# Start MongoDB service
net start MongoDB
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 5. Seed the Database (Optional)
You can manually add content through the admin interface or import sample data using MongoDB tools.

**Create Admin User:**
```javascript
// In MongoDB shell or Compass
use netflix-clone

// Create admin user
db.users.insertOne({
  username: "admin",
  email: "admin@netflix.com",
  password: "$2b$10$...", // Use bcrypt to hash "admin123"
  firstName: "Admin",
  lastName: "User",
  isAdmin: true,
  profiles: [],
  createdAt: new Date(),
  updatedAt: new Date()
})

// Create admin profile
db.profiles.insertOne({
  name: "Admin",
  user: ObjectId("..."), // Use the admin user's _id
  watchProgress: {},
  likedContent: [],
  completedSeries: [],
  watchedContent: [],
  createdAt: new Date(),
  updatedAt: new Date()
})

// Update admin user with profile
db.users.updateOne(
  { username: "admin" },
  { $push: { profiles: ObjectId("...") } } // Use the profile's _id
)
```

---

## 🎬 Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at: **http://localhost:3000**

### Default Login Credentials
After seeding the database:
- **Username:** admin
- **Password:** admin123 (or whatever you set)

---

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `SESSION_SECRET` | Secret key for session encryption | Yes | - |
| `PORT` | Server port number | No | 3000 |
| `OMDB_API_KEY` | OMDb API key for content ratings | Yes | - |
| `CONTENT_FETCH_LIMIT` | Max content items per query | No | 1000 |

---

## 🗄 Database Models

### User Model
- **Fields:** username, email, password (encrypted), firstName, lastName, isAdmin, profiles[]
- **Relationships:** One-to-Many with Profiles
- **Validations:** Unique username/email, password min length, max 5 profiles

### Profile Model
- **Fields:** name, user, watchProgress (Map), likedContent[], completedSeries[], watchedContent[]
- **Relationships:** Many-to-One with User, Many-to-Many with Content
- **Features:** Track watch position, liked content, viewing history

### Content Model
- **Fields:** title, description, type (movie/series/episode), genre[], year, duration, rating, imageUrl, videoUrl, popularity, starRating, seriesId, episodeNumber
- **Types:** movie, series, episode
- **Validations:** Required fields, valid content type

### ViewingHabit Model
- **Fields:** user, profile, content, watchCount, lastWatched, liked, watchProgress
- **Purpose:** Track user engagement and preferences

### Catalog Model
- **Fields:** profile, name, contentList[]
- **Purpose:** User-created content collections

### Log Model
- **Fields:** timestamp, level, message, metadata, errorStack
- **Purpose:** System monitoring and debugging

---

## 🔌 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/logout` - Logout user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Profiles
- `GET /profiles` - Get user profiles (page)
- `GET /api/users/profiles` - Get profiles (JSON)
- `POST /api/users/profiles` - Create new profile
- `PUT /api/users/profiles/:id` - Update profile
- `DELETE /api/users/profiles/:id` - Delete profile

### Content
- `GET /api/content` - Get all content (with filters & pagination)
- `GET /api/content/:id` - Get content by ID
- `POST /api/content` - Create content (admin only)
- `PUT /api/content/:id` - Update content (admin only)
- `DELETE /api/content/:id` - Delete content (admin only)
- `GET /api/content/trending` - Get trending content
- `GET /api/content/popular` - Get most popular content
- `GET /api/content/newest/movies` - Get newest movies
- `GET /api/content/newest/series` - Get newest series
- `GET /api/content/continue-watching` - Get continue watching list
- `POST /api/content/mark-watched` - Mark content as watched

### Player
- `GET /player/:contentId/:profileId` - Get player page
- `POST /player/reset/:contentId/:profileId` - Reset watch progress

### Watch Progress
- `GET /watch-progress/:profileId/:contentId` - Get watch position
- `POST /watch-progress` - Save watch position

### Viewing Habits
- `GET /api/viewing-habits/:profileId` - Get viewing habits
- `POST /api/viewing-habits` - Track viewing habit

### Statistics
- `GET /api/users/statistics` - Get user statistics

### Search
- `GET /search?q=query` - Search content by title

---

## 👥 User Roles

### Regular User
- Register and login
- Create up to 5 profiles
- Browse and search content
- Watch movies and series
- Track watch progress
- Like/unlike content
- View personal statistics
- Manage profiles and settings

### Admin User
- All regular user capabilities
- Access "Add Content" page
- Upload new movies/series
- Fetch content ratings from OMDb API
- Manage all content (CRUD operations)

---

## 🎯 Key Features Explained

### Continue Watching
- Automatically tracks playback position every 5 seconds
- Stores position per profile in `watchProgress` Map
- Filters out completed content and episodes
- Displays up to 10 most recent items

### Profile System
- Each user can have multiple profiles (family members)
- Separate viewing history, preferences, and progress per profile
- Profile switching without re-authentication

### Video Player
- HTML5 video element with custom controls
- Keyboard shortcuts (Space, Arrow keys, F for fullscreen)
- Timeline scrubbing with visual progress bar
- Auto-save watch position
- Episode navigation for series

### Content Recommendations
- Similar content based on genre matching
- Popular content using MongoDB aggregation
- Newest content dynamically grouped by genre
- Personalized based on viewing history

### Statistics Dashboard
- Interactive charts using Chart.js
- Daily views per profile (bar chart)
- Genre popularity distribution (pie chart)
- Viewing time tracking
- Profile comparison

### Search Functionality
- Real-time search by content title
- Case-insensitive matching
- Excludes episodes from results
- Results displayed in carousel format

### External API Integration
- OMDb API for fetching content ratings
- Automatic rating lookup when adding content
- IMDb ratings and Rotten Tomatoes scores

### Security Features
- Password hashing with bcrypt (10 rounds)
- Session-based authentication
- Protected routes with middleware
- Role-based access control (admin vs user)
- CSRF protection via session

### Responsive Design
- Bootstrap 5 grid system
- Mobile-first approach
- Works on desktop, tablet, and mobile
- Touch-friendly controls

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl status mongod
```

### Port Already in Use
```bash
# Change PORT in .env file or kill process
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Session Issues
- Clear browser cookies and cache
- Check `SESSION_SECRET` is set in .env
- Verify MongoDB session store connection

---

## 📝 Development Notes

### MVC Architecture
The project follows the Model-View-Controller pattern:
- **Models** (`server/models/`) - Database schemas and data logic
- **Views** (`views/`) - EJS templates for rendering
- **Controllers** (`server/controllers/`) - Business logic and request handling

### Code Standards
- Use ES6+ syntax
- Async/await for asynchronous operations
- Error handling with try-catch blocks
- Input validation on both client and server
- Consistent naming conventions

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/feature-name
```

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Authors

Developed as a final project for Web Application Development Course.

---

## 🙏 Acknowledgments

- Course instructors and teaching assistants
- OMDb API for content ratings
- Bootstrap for UI components
- MongoDB and Mongoose documentation

---

## 📧 Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/shirabenben/Netfilx-Project/issues).
