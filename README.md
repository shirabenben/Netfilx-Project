# Netfilx-Project
Final Assignment for the Web Application Development Course

A project related to Netflix functionality and features.

## Setup Instructions

### Prerequisites
- Install Node.js (if not already installed):
  ```
  brew install node
  ```

### Initialize Project
1. Initialize Node.js project:
   ```
   npm init -y
   ```

2. Install dependencies:
   ```
   npm install express mongoose
   ```

3. Install MongoDB:
   ```
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```

4. Create project structure:
   ```
   mkdir -p server/models server/controllers server/routes config public
   ```

5. Start the server:
   ```
   npm start
   ```

## Project Structure

```
Netflix Project/
├── README.md
├── package.json
├── server.js
├── server/
│   ├── models/
│   │   └── Movie.js
│   ├── controllers/
│   │   └── movieController.js
│   └── routes/
│       └── movies.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── .git/
