# Netflix Clone - Content Distribution Platform

A full-stack web application for streaming movies and TV series, built with Node.js, Express, MongoDB, and vanilla JavaScript following the MVC pattern.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm

### Installation

1. **Clone and Install**
```bash
git clone https://github.com/shirabenben/Netfilx-Project.git
cd Netfilx-Project
npm install
```

2. **Configure Environment Variables**
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/netflix-clone
SESSION_SECRET=your-secret-key-here
PORT=3000
OMDB_API_KEY=your-omdb-api-key
CONTENT_FETCH_LIMIT=1000
```

3. **Start MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

4. **Run the Application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Access the application at: **http://localhost:3000**

---

## 📁 Project Structure

```
Netfilx-Project/
├── server.js                    # Application entry point
├── package.json                 # Dependencies and scripts
│
├── public/                      # Client-side files
│   ├── *.html                  # Login, register, add-content pages
│   ├── *.js                    # Client-side logic (homepage, player, etc.)
│   └── styles.css              # Global styles
│
├── server/
│   ├── models/                 # Database schemas (Mongoose)
│   │   ├── User.js             # User authentication & profiles
│   │   ├── Profile.js          # User profiles & viewing data
│   │   ├── Content.js          # Movies, series, episodes
│   │   ├── ViewingHabit.js     # Watch tracking
│   │   ├── Catalog.js          # User content lists
│   │   └── Log.js              # System logging
│   │
│   ├── controllers/            # Business logic
│   │   ├── userController.js
│   │   ├── contentController.js
│   │   ├── playerController.js
│   │   └── viewingHabitController.js
│   │
│   ├── routes/                 # API endpoints
│   │   ├── users.js
│   │   ├── content.js
│   │   ├── player.js
│   │   └── watchProgress.js
│   │
│   ├── middleware/
│   │   ├── auth.js             # Authentication & authorization
│   │   └── logger.js           # Request logging
│   │
│   └── services/
│       └── omdbService.js      # External API integration
│
└── views/                      # EJS templates
    ├── homepage.ejs
    ├── content.ejs
    ├── player.ejs
    ├── settings.ejs
    ├── statistics.ejs
    └── partials/               # Reusable components
```

---

## ✨ Key Features

### 1. User Management & Authentication
- Secure registration/login with bcrypt password encryption
- Session-based authentication using express-session
- Multiple profiles per user (up to 5)
- Profile-specific viewing history and preferences
- Role-based access control (Admin/Regular users)

### 2. Content Browsing
- **Homepage Feed:** Personalized recommendations based on viewing habits
- **Continue Watching:** Resume playback from last position (tracks every 5 seconds)
- **Genre Navigation:** Dynamic genre detection from database
- **Search Functionality:** Real-time content search by title
- **Popular Content:** Aggregated popularity rankings
- **Newest Content:** Top 10 newest items per genre
- **Similar Content:** Genre-based recommendations

### 3. Video Player
- HTML5 video player with custom controls
- Play/Pause, timeline scrubbing, fullscreen
- Skip forward/backward 10 seconds
- Keyboard shortcuts support
- Auto-save watch position per profile
- Episode navigation for TV series
- Next episode button for seamless binge-watching

### 4. Content Details
- Full content information (synopsis, rating, year, genre)
- Like/Unlike functionality per profile
- Actor list with Wikipedia links
- Episode list with watch progress indicators
- Similar content suggestions

### 5. Admin Features (Admin Only)
- Add content page with form for movies/series
- Upload video files (MP4) and thumbnails
- External API integration (OMDb) for ratings
- Content management (CRUD operations)

### 6. Statistics Dashboard
- Interactive charts using Chart.js
- **Bar Chart:** Daily views per profile
- **Pie Chart:** Genre popularity distribution
- View count tracking per profile

### 7. Settings & Profile Management
- Create, edit, delete profiles
- Profile switching without re-authentication
- Manage personal information

### 8. Genre Pages
- Infinite scroll for content browsing
- Sort by rating, popularity, or year
- Filter by watched/unwatched status
- Responsive grid layout

---

## 🛠 Technology Stack

**Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript (ES6+)  
**Backend:** Node.js, Express.js, EJS  
**Database:** MongoDB, Mongoose  
**Security:** bcrypt, express-session, connect-mongo  
**External APIs:** OMDb API for content ratings

---

## 🗄 Database Models

### User Model
- Authentication credentials (encrypted password)
- Personal information
- Profile references (max 5)
- Admin role flag

### Profile Model
- Name and user reference
- Watch progress tracking (Map)
- Liked content array
- Watched content history

### Content Model
- Title, description, type (movie/series/episode)
- Genre array, year, duration, rating
- Media URLs (video, image)
- Series/episode relationships

### ViewingHabit Model
- User, profile, and content references
- Watch count and last watched timestamp
- Like status and progress tracking

---

## 🔐 Security Features

- Password hashing with bcrypt (10 rounds)
- Session-based authentication
- Protected routes with authentication middleware
- Role-based access control (admin vs regular user)
- Input validation on client and server
- MongoDB session store for persistence

---

## 📄 License

ISC License - Developed as a final project for Web Application Development Course.

---

## 📧 Support

For issues or questions, open an issue on the [GitHub repository](https://github.com/shirabenben/Netfilx-Project/issues).
