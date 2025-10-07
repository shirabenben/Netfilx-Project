# Netflix Project

Final Assignment for the Web Application Development Course. This project is a web-based platform for distributing digital content, inspired by Netflix, built with Node.js, Express, and MongoDB.

## Features

-   **User Authentication:** Secure user registration and login.
-   **Content Catalog:** Browse, search, and filter movies and series.
-   **Personalized Catalogs:** Create and manage personal content catalogs.
-   **Viewing Habits:** Track and analyze user viewing habits.
-   **Admin Panel:** Add new content to the platform (admin only).
-   **Responsive Design:** Fully responsive for desktop, tablet, and mobile devices.

## Technologies Used

-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB
-   **Frontend:** HTML, CSS, JavaScript, Bootstrap

## Setup Instructions

### Prerequisites
- Install Node.js (if not already installed):
  ```
  brew install node
  ```

### Initialize Project
1. Clone the repository and navigate to the project directory:
   ```
   git clone <repository-url>
   cd Netfilx-Project
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Environment Configuration:
   The project includes a `.env` file that is tracked in Git for shared configuration. The file contains:
   - `PORT=3000` - Server port
   - `mongodb+srv://netflix_team:Aa12345678@cluster0.e3eeaic.mongodb.net/Netflix?retryWrites=true&w=majority&appName=Cluster0` - MongoDB connection string
   
   You can modify these values if needed for your local setup.

4. Install and start MongoDB:
   ```
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```

5. Start the server:
   ```
   npm start
   ```

The server will be available at `http://localhost:3000`

## Project Structure

```
Netfilx-Project/
├── .env
├── .gitignore
├── package.json
├── project_requirements.md
├── README.md
├── server.js
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
└── server/
    ├── controllers/
    │   ├── catalogController.js
    │   ├── contentController.js
    │   ├── userController.js
    │   └── viewingHabitController.js
    ├── models/
    │   ├── Catalog.js
    │   ├── Content.js
    │   ├── Log.js
    │   ├── User.js
    │   └── ViewingHabit.js
    ├── routes/
    │   ├── catalogs.js
    │   ├── content.js
    │   ├── users.js
    │   └── viewingHabits.js
    └── utils/
        └── logger.js
```

## API Endpoints

### User API (`/api/users`)

-   `GET /`: Get all users.
-   `GET /:id`: Get user by ID.
-   `POST /`: Create a new user.
-   `PUT /:id`: Update a user.
-   `DELETE /:id`: Delete a user.
-   `POST /authenticate`: Authenticate a user.

### Content API (`/api/content`)

-   `GET /`: Get all content.
-   `GET /trending`: Get trending content.
-   `GET /genre/:genre`: Get content by genre.
-   `GET /:id`: Get content by ID.
-   `POST /`: Create new content.
-   `PUT /:id`: Update content.
-   `DELETE /:id`: Delete content.

### Catalog API (`/api/catalogs`)

-   `GET /public`: Get all public catalogs.
-   `GET /user/:userId`: Get all catalogs for a user.
-   `GET /:id`: Get catalog by ID.
-   `POST /`: Create a new catalog.
-   `PUT /:id`: Update a catalog.
-   `DELETE /:id`: Delete a catalog.
-   `POST /:id/content`: Add content to a catalog.
-   `DELETE /:id/content/:contentId`: Remove content from a catalog.

### Viewing Habits API (`/api/viewing-habits`)

-   `GET /`: Get all viewing habits.
-   `POST /`: Create or update a viewing habit.
-   `GET /:contentId`: Get a viewing habit.
-   `DELETE /:contentId`: Delete a viewing habit.