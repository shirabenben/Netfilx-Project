# Final Project Requirements: Content Distribution Platform (Netflix Clone)

## Project Goal
To implement a web-based platform for distributing digital content, using only the technologies taught in the course.

---

## Technology & Architecture Requirements

### 1. Allowed Technologies
- **Client-Side:** HTML, CSS, Bootstrap, JavaScript.
- **Server-Side:** Node.js, Express.
- **Database:** MongoDB.
- **Forbidden:** Use of external libraries or frameworks not taught in the course is forbidden (e.g., React, Angular, Vue).

### 2. Architecture
- **Design Pattern:** The system must be implemented using the **MVC (Model-View-Controller)** pattern with full separation of concerns.
- **Responsiveness:** The application must be responsive and function correctly on desktop, tablet, and mobile devices.
- **Continuous Viewing:** Support for resuming playback across different devices (with a maximum deviation of 10 seconds).

### 3. Database (MongoDB)
- **Required Models (at least three):**
    1.  **Users Model**
    2.  **Content Catalog Model** (for movies, series, episodes).
    3.  **Viewing Habits Model**
- **Functionality:** Each model must support full **CRUD** (Create, Read, Update, Delete) operations.
- **Search:** The system must allow searching on at least one primary field (e.g., by title in the content catalog).

### 4. Security & Permissions
- **Authentication:** Username and password only.
- **Password Encryption:** Passwords must be stored encrypted (recommended: **bcrypt**).
- **Session Management:** Recommended to use **express-session**.
- **Access Control:**
    - **Public:** Registration/Login pages.
    - **Authenticated Users Only:** All other pages (except "Add Content").
    - **Admin Only:** The "Add Content" page is accessible only to a user with the role 'admin'.
    - **Privacy:** Users can only access their own personal data.

### 5. Error Handling & Performance
- **Validation:** Must handle edge cases and perform validation on both client-side and server-side.
- **Logging:** The system must log operational events and errors to the database.

---

## Product Specification (Features)

### 1. Main Feed Screen
- Profile switching.
- "Continue Watching" from the last stop point.
- Personalized recommendations based on viewing habits and liked content.
- Display most popular content (using a `GroupBy` query).
- Display the 10 newest content items for each genre (genres should be detected dynamically from the DB).
- Content search functionality.
- Navigation by genre.
- Logout functionality.

### 2. Genre Page
- Infinite scroll for content within the genre.
- Sort content by rating or popularity.
- Filter content by "watched / not watched".

### 3. Settings Screen
- **Profile Management:** Create, edit, and delete profiles (up to 5 profiles per user).
- **Statistics (Dynamic Charts):**
    - **Bar Chart:** Daily views per profile.
    - **Pie Chart:** Content popularity by genre.

### 4. Content Details Screen (Movie/Series)
- Display full content details (synopsis, rating, release year, etc.).
- Buttons for "Play", "Continue Watching", and "Watch from Beginning".
- "Like" / "Unlike" button (per profile).
- Display similar content from the same genre.
- **For Series:** A full episode list, indicating the user's progress in each episode.
- List of actors, where clicking an actor's name links to their Wikipedia page.

### 5. Add Content Screen (Admin Only)
- Accessible only to the 'admin' user.
- A form to add new content, including: general details, uploading an MP4 video file, and uploading a thumbnail image.
- Must use an external **Web Service** (e.g., an API) to fetch content ratings from sources like IMDb or Rotten Tomatoes.

### 6. Content Player Screen
- Basic controls (Play/Pause).
- Advanced controls (seek forward/backward 10 seconds, timeline scrubbing).
- Fullscreen button.
- "Next Episode" button.
- Access to the episode list from within the player (as an overlay or drawer).

---

## Additional Requirements
- **Originality:** All code must be original work by the students. Plagiarism checks will be performed.
- **AI Usage:** Use of AI tools is permitted, but every student must be able to explain every line of code in detail.
- **Documentation:** A **README.md** file is required. It must include setup/run instructions, project structure overview, and a description of key features.
- **Demo Data:** The database must be seeded with dummy data before the final presentation to demonstrate real-world usage.