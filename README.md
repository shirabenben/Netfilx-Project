# Netflix Clone - Content Distribution Platform

Final Assignment for the Web Application Development Course. This project is a comprehensive web-based platform for distributing digital content, inspired by Netflix, built with Node.js, Express, and MongoDB following the MVC architecture pattern.

## 🎯 Key Features

### Core Functionality
- **Secure User Authentication**: Registration and login with encrypted passwords using bcrypt
- **Multiple Profile Management**: Up to 5 profiles per user account
- **Content Catalog Management**: Browse, search, and filter movies and series by genre, rating, and popularity
- **Personalized Experience**: Continue watching from where you left off (with 10-second accuracy)
- **Custom Catalogs**: Create watchlists, favorites, and custom content collections
- **Viewing Habits Tracking**: Monitor user engagement and viewing progress
- **Admin Content Management**: Admin-only interface for adding new content
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices

### Advanced Features
- **Dynamic Genre Detection**: Automatically categorizes content by genres from database
- **Popular Content Aggregation**: GroupBy queries to display trending content
- **Infinite Scroll**: Seamless browsing experience within genre pages
- **Content Filtering**: Filter by watched/unwatched status
- **Search Functionality**: Full-text search across content titles and descriptions
- **Activity Logging**: Comprehensive error and operational event logging to database

## 🛠 Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap
- **Authentication**: bcrypt for password hashing, express-session for session management
- **Template Engine**: EJS for server-side rendering
- **Additional Libraries**: mongoose-paginate-v2 for pagination, connect-mongo for session storage

## 📋 Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control

### Windows Setup (PowerShell)
1. **Clone the repository**:
   ```powershell
   git clone https://github.com/shirabenben/Netfilx-Project.git
   cd Netfilx-Project
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Environment Configuration**:
   The project includes environment variables configured for shared development:
   - `PORT=3000` - Server port
   - MongoDB connection string (pre-configured for team access)
   
   Create a `.env` file if you need custom configuration.

4. **Start the development server**:
   ```powershell
   npm run dev    # For development with auto-restart
   # OR
   npm start      # For production mode
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

### Alternative: Using MongoDB Atlas
The project is pre-configured to use MongoDB Atlas cloud database. No local MongoDB installation required.

## 📁 Project Structure

```
Netfilx-Project/
├── 📄 package.json           # Project dependencies and npm scripts
├── 📄 project_requirements.md # Detailed project specifications
├── 📄 README.md              # This documentation file
├── 📄 server.js              # Main application entry point
├── 📁 public/                # Static frontend files
│   ├── 📄 app.js             # Main client-side JavaScript
│   ├── 📄 login.html         # Login page
│   ├── 📄 login.js           # Login page functionality
│   ├── 📄 register.html      # User registration page
│   ├── 📄 register.js        # Registration page functionality
│   └── 📄 styles.css         # Global CSS styles
├── 📁 server/                # Backend application logic
│   ├── 📁 controllers/       # Request handling logic (MVC Controllers)
│   │   ├── 📄 catalogController.js    # Catalog CRUD operations
│   │   ├── 📄 contentController.js    # Content management logic
│   │   ├── 📄 userController.js       # User authentication & management
│   │   └── 📄 viewingHabitController.js # Viewing progress tracking
│   ├── 📁 middleware/        # Custom middleware functions
│   │   ├── 📄 auth.js        # Authentication middleware
│   │   └── 📄 logger.js      # Request logging middleware
│   ├── 📁 models/            # Database schemas and models (MVC Models)
│   │   ├── 📄 Catalog.js     # Personal content collections schema
│   │   ├── 📄 Content.js     # Movies/series content schema
│   │   ├── 📄 Log.js         # System logging schema
│   │   ├── 📄 Profile.js     # User profile schema
│   │   ├── 📄 User.js        # User account schema
│   │   └── 📄 ViewingHabit.js # Viewing progress & preferences schema
│   ├── 📁 routes/            # API route definitions
│   │   ├── 📄 catalogs.js    # Catalog management endpoints
│   │   ├── 📄 content.js     # Content CRUD endpoints
│   │   ├── 📄 users.js       # User management endpoints
│   │   └── 📄 viewingHabits.js # Viewing tracking endpoints
│   └── 📁 utils/             # Utility functions and helpers
├── 📁 tests/                 # Test suites (unit & integration)
│   ├── 📁 integration/       # API integration tests
│   └── 📁 unit/              # Unit tests for individual components
└── 📁 views/                 # Server-side templates (MVC Views)
    ├── 📄 error.ejs          # Error page template
    ├── 📄 homepage.ejs       # Main dashboard template
    ├── 📄 profile.ejs        # User profile management template
    └── 📁 partials/          # Reusable template components
        ├── 📄 _ContentSlider.ejs # Content carousel component
        └── 📄 _Navbar.ejs     # Navigation bar component
```

## 🗂 Detailed File Documentation

### 📁 Models (Database Schemas)

#### 📄 `User.js` - User Account Management
**Purpose**: Handles user authentication, account information, and profile associations.

**Key Features**:
- **Secure Authentication**: bcrypt password hashing with salt rounds
- **Validation**: Email format validation, username uniqueness, password strength
- **Profile Management**: References to up to 5 user profiles
- **Admin System**: Boolean flag for administrative privileges
- **Security Methods**: 
  - `comparePassword()`: Secure password verification
  - `toJSON()`: Removes password from API responses
  - Pre-save middleware for automatic password hashing

**Schema Fields**:
- `username`: Unique identifier (3-50 characters)
- `email`: Validated email address with uniqueness constraint
- `password`: Hashed password (minimum 6 characters)
- `firstName/lastName`: User's full name information
- `isAdmin`: Administrative access flag
- `profiles`: Array of profile references (1-5 profiles max)

#### 📄 `Profile.js` - User Profile System
**Purpose**: Enables multiple viewing profiles per user account (Netflix-style).

**Key Features**:
- **Multi-Profile Support**: Each user can have multiple viewing profiles
- **Unique Naming**: Profile names must be unique within user account
- **Virtual Population**: Automatic loading of viewing habits and catalogs
- **Relationship Management**: Links profiles to users, viewing habits, and catalogs

**Schema Fields**:
- `name`: Profile display name (unique per user)
- `user`: Reference to parent user account
- **Virtual Fields**: `viewingHabits`, `catalogs` (populated on demand)

#### 📄 `Content.js` - Media Content Management
**Purpose**: Stores all movies, series, and episode information with comprehensive metadata.

**Key Features**:
- **Content Types**: Support for movies and series
- **Rich Metadata**: Detailed information including cast, director, ratings
- **Search Optimization**: Text indexes on title and description
- **Performance Indexes**: Optimized queries by genre, type, and year
- **Pagination Support**: Built-in pagination for large content libraries
- **Content Validation**: Year validation, genre requirements, rating standards

**Schema Fields**:
- `title`: Content title with character limits
- `description`: Detailed synopsis (max 1000 characters)
- `genre`: Array of genre classifications
- `year`: Release year with realistic bounds
- `duration`: Runtime in minutes
- `rating`: Content rating (G, PG, PG-13, R, NC-17, TV ratings)
- `type`: Movie or series classification
- `director`: Director information
- `cast`: Array of cast member names
- `videoUrl`: Video file location
- `imageUrl`: Thumbnail/poster image location
- `isActive`: Content availability status

#### 📄 `Catalog.js` - Personal Content Collections
**Purpose**: Manages user-created content lists (watchlists, favorites, custom collections).

**Key Features**:
- **Collection Types**: Watchlist, favorites, and custom categories
- **Profile-Specific**: Each catalog belongs to a specific profile
- **Public/Private**: Catalogs can be shared publicly or kept private
- **Duplicate Prevention**: Automatic removal of duplicate content
- **Unique Naming**: Catalog names must be unique per profile

**Schema Fields**:
- `name`: Catalog display name
- `description`: Optional catalog description
- `profile`: Reference to owning profile
- `content`: Array of content references
- `isPublic`: Public visibility flag
- `type`: Category (watchlist, favorites, custom)

#### 📄 `ViewingHabit.js` - Viewing Progress Tracking
**Purpose**: Tracks user viewing progress, preferences, and engagement metrics.

**Key Features**:
- **Progress Tracking**: Precise viewing position in seconds
- **Like System**: User preference tracking
- **Resume Functionality**: Continue watching from last position
- **Unique Viewing Records**: One record per profile-content combination
- **Analytics Support**: Data structure supports viewing analytics

**Schema Fields**:
- `profile`: Reference to viewing profile
- `content`: Reference to watched content
- `watchProgress`: Current position in seconds
- `liked`: User preference boolean
- `lastWatched`: Timestamp of last viewing session

#### 📄 `Log.js` - System Activity Logging
**Purpose**: Comprehensive logging system for debugging, monitoring, and analytics.

**Key Features**:
- **Multiple Log Levels**: Info, error, and warning classifications
- **Structured Logging**: Consistent message format with metadata
- **Performance Optimization**: Indexed by timestamp and level
- **Flexible Metadata**: Additional context storage in meta field

**Schema Fields**:
- `level`: Log severity (info, error, warn)
- `message`: Human-readable log message
- `timestamp`: Automatic timestamp generation
- `meta`: Additional context data (objects, stack traces, etc.)

### 📁 Controllers (Business Logic)

#### 📄 `userController.js` - User Management Logic
**Functionality**:
- User registration with validation and password hashing
- Secure authentication with session management
- Profile creation and management (max 5 per user)
- Password verification and user data retrieval
- Admin privilege checking and user listing

#### 📄 `contentController.js` - Content Management
**Functionality**:
- Content CRUD operations with validation
- Genre-based content filtering and search
- Trending content calculation using aggregation
- Pagination for large content libraries
- Content status management (active/inactive)

#### 📄 `catalogController.js` - Catalog Operations
**Functionality**:
- Personal catalog creation and management
- Content addition/removal from catalogs
- Public catalog sharing and discovery
- Profile-specific catalog filtering
- Duplicate content prevention

#### 📄 `viewingHabitController.js` - Viewing Analytics
**Functionality**:
- Viewing progress tracking and updates
- Continue watching functionality
- Like/unlike content management
- Viewing history and analytics
- Resume point calculation with 10-second accuracy

### 📁 Routes (API Endpoints)

#### 📄 `users.js` - User API Routes
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user information
- `POST /api/users/profiles` - Create new profile
- `DELETE /api/users/profiles/:id` - Delete profile

#### 📄 `content.js` - Content API Routes
- `GET /api/content` - List all content with pagination
- `GET /api/content/search` - Search content by title/description
- `GET /api/content/genre/:genre` - Filter content by genre
- `GET /api/content/trending` - Get popular content
- `POST /api/content` - Add new content (admin only)
- `PUT /api/content/:id` - Update content (admin only)
- `DELETE /api/content/:id` - Remove content (admin only)

#### 📄 `catalogs.js` - Catalog API Routes
- `GET /api/catalogs/profile/:profileId` - Get profile catalogs
- `POST /api/catalogs` - Create new catalog
- `PUT /api/catalogs/:id` - Update catalog
- `DELETE /api/catalogs/:id` - Delete catalog
- `POST /api/catalogs/:id/content` - Add content to catalog
- `DELETE /api/catalogs/:id/content/:contentId` - Remove content

#### 📄 `viewingHabits.js` - Viewing Tracking Routes
- `GET /api/viewing-habits/profile/:profileId` - Get viewing history
- `POST /api/viewing-habits` - Update viewing progress
- `PUT /api/viewing-habits/:contentId/like` - Like/unlike content
- `GET /api/viewing-habits/continue-watching` - Get continue watching list

### 📁 Middleware & Utils

#### 📄 `auth.js` - Authentication Middleware
**Functionality**:
- Session validation and user authentication
- Protected route access control
- Admin privilege verification
- Profile ownership validation

#### 📄 `logger.js` - Logging Middleware
**Functionality**:
- HTTP request logging
- Error tracking and database logging
- Performance monitoring
- Debug information collection

## 🔌 API Endpoints

### User Management API (`/api/users`)
- `GET /` - Retrieve all users (admin only)
- `GET /:id` - Get specific user by ID
- `POST /register` - Create new user account with validation
- `POST /login` - Authenticate user and create session
- `PUT /:id` - Update user information
- `DELETE /:id` - Delete user account
- `POST /:id/profiles` - Create new profile for user
- `GET /:id/profiles` - Get all profiles for user

### Content Management API (`/api/content`)
- `GET /` - List all content with pagination and filtering
- `GET /search?q=query` - Full-text search across content
- `GET /trending` - Get popular content using aggregation
- `GET /genre/:genre` - Filter content by specific genre
- `GET /:id` - Get detailed content information
- `POST /` - Add new content (admin only)
- `PUT /:id` - Update existing content (admin only)
- `DELETE /:id` - Remove content from platform (admin only)

### Catalog Management API (`/api/catalogs`)
- `GET /public` - Get all publicly shared catalogs
- `GET /profile/:profileId` - Get all catalogs for specific profile
- `GET /:id` - Get specific catalog with content details
- `POST /` - Create new personal catalog
- `PUT /:id` - Update catalog information
- `DELETE /:id` - Delete catalog
- `POST /:id/content` - Add content to catalog
- `DELETE /:id/content/:contentId` - Remove content from catalog

### Viewing Habits API (`/api/viewing-habits`)
- `GET /profile/:profileId` - Get viewing history for profile
- `POST /` - Create or update viewing progress
- `GET /:contentId` - Get viewing progress for specific content
- `PUT /:contentId/like` - Toggle like status for content
- `DELETE /:contentId` - Remove viewing record
- `GET /continue-watching` - Get continue watching list

## 🎨 Frontend Components

### 📄 Public Directory Files

#### `login.html` & `login.js`
- **Purpose**: User authentication interface
- **Features**: Form validation, error handling, session management
- **Security**: Client-side validation with server-side verification

#### `register.html` & `register.js`
- **Purpose**: New user account creation
- **Features**: Password strength validation, email verification, duplicate checking
- **UX**: Progressive enhancement with real-time validation feedback

#### `app.js`
- **Purpose**: Main client-side application logic
- **Features**: AJAX API calls, DOM manipulation, responsive interactions
- **Architecture**: Modular JavaScript with separation of concerns

#### `styles.css`
- **Purpose**: Global styling and responsive design
- **Features**: Mobile-first approach, CSS Grid/Flexbox layouts, custom animations
- **Compatibility**: Cross-browser support with fallbacks

### 📄 Server-Side Templates (EJS Views)

#### `homepage.ejs`
- **Purpose**: Main dashboard after login
- **Features**: Content carousels, continue watching, personalized recommendations
- **Components**: Uses partials for modular rendering

#### `profile.ejs`
- **Purpose**: Profile management and settings
- **Features**: Profile switching, viewing statistics, account settings
- **Analytics**: Dynamic charts using Chart.js (if implemented)

#### `error.ejs`
- **Purpose**: Centralized error handling display
- **Features**: User-friendly error messages, navigation options
- **Security**: No sensitive information exposure

#### `partials/_Navbar.ejs`
- **Purpose**: Reusable navigation component
- **Features**: Profile switching, search functionality, responsive menu
- **State Management**: Session-aware navigation options

#### `partials/_ContentSlider.ejs`
- **Purpose**: Content carousel component
- **Features**: Infinite scroll, lazy loading, responsive grid
- **Performance**: Optimized for large content libraries

## 🚀 Development Workflow

### Running the Application

1. **Development Mode** (auto-restart on changes):
   ```powershell
   npm run dev
   ```

2. **Production Mode**:
   ```powershell
   npm start
   ```

3. **Testing** (when implemented):
   ```powershell
   npm test
   ```

### Database Seeding
The application requires demo data for presentation. Create seed scripts to populate:
- Sample users (including admin)
- Diverse content library (movies/series)
- Example catalogs and viewing habits

### Environment Variables
```env
PORT=3000
MONGODB_URI=mongodb+srv://netflix_team:Aa12345678@cluster0.e3eeaic.mongodb.net/Netflix?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=your-session-secret-here
NODE_ENV=development
```

## 🔒 Security Implementation

### Authentication & Authorization
- **Password Security**: bcrypt with 10 salt rounds
- **Session Management**: express-session with MongoDB store
- **Access Control**: Middleware-based route protection
- **Admin Protection**: Role-based access for content management

### Data Validation
- **Client-Side**: JavaScript form validation with real-time feedback
- **Server-Side**: Mongoose schema validation with custom validators
- **Input Sanitization**: Protection against injection attacks
- **Error Handling**: Graceful error responses without information leakage

### Privacy Protection
- **Profile Isolation**: Users can only access their own profiles and data
- **Session Security**: Secure session configuration with appropriate timeouts
- **Data Filtering**: Sensitive information removed from API responses

## 📊 Performance Optimizations

### Database Optimization
- **Indexing**: Strategic indexes on frequently queried fields
- **Pagination**: Efficient content browsing with mongoose-paginate-v2
- **Aggregation**: Complex queries for trending content and analytics
- **Connection Pooling**: Optimized MongoDB connection management

### Frontend Performance
- **Lazy Loading**: Content images loaded on demand
- **Caching**: Browser caching for static assets
- **Minification**: Compressed CSS and JavaScript files
- **Responsive Images**: Optimized images for different screen sizes

## 🧪 Testing Strategy

### Unit Tests (`tests/unit/`)
- Model validation testing
- Controller logic verification
- Utility function testing
- Authentication middleware testing

### Integration Tests (`tests/integration/`)
- API endpoint testing
- Database integration testing
- Authentication flow testing
- Complete user journey testing

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Environment variables configured
- [ ] Database seeded with demo data
- [ ] Security headers implemented
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented

### Scaling Recommendations
- **Database**: Consider MongoDB Atlas for production
- **Session Storage**: Redis for high-traffic scenarios
- **File Storage**: Cloud storage for video/image files
- **CDN**: Content delivery network for media files

## 🔍 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Check connection string and network access
2. **Session Issues**: Verify session configuration and MongoDB store
3. **Authentication Problems**: Check bcrypt implementation and password hashing
4. **CORS Issues**: Ensure proper middleware configuration for API access

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` and checking console output for detailed error information.

## 👥 Team Collaboration

### Code Standards
- **ES6+ JavaScript**: Modern JavaScript features and syntax
- **Consistent Naming**: camelCase for variables, PascalCase for models
- **Comment Standards**: JSDoc-style comments for functions and complex logic
- **Error Handling**: Consistent error response format across all endpoints

### Git Workflow
- **Feature Branches**: Separate branches for each feature implementation
- **Commit Messages**: Descriptive commits with clear purpose
- **Code Reviews**: Peer review process for all changes
- **Documentation**: README updates with each significant change

## 📈 Future Enhancements

### Planned Features
- **Video Streaming**: Integration with video streaming services
- **Real-time Notifications**: User activity notifications
- **Advanced Analytics**: Detailed viewing behavior analysis
- **Social Features**: User ratings and reviews
- **Mobile App**: React Native or Flutter mobile application

### Technical Improvements
- **Microservices**: Service decomposition for better scalability
- **GraphQL API**: More efficient data fetching
- **WebSocket Integration**: Real-time features implementation
- **Containerization**: Docker deployment configuration

---

## 📞 Support & Contact

For technical issues or questions about this project:
1. Check the troubleshooting section above
2. Review the project requirements document
3. Contact the development team through the repository issues

**Repository**: [https://github.com/shirabenben/Netfilx-Project](https://github.com/shirabenben/Netfilx-Project)

---

*This documentation is maintained by the development team and updated with each major release.*