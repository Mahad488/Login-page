# Login Page Project

A simple web application featuring user authentication (signup and login) and a student data submission form. The application stores all data locally in JSON files and can be run using either a Python server or a Node.js server.

## Features

- **User Signup**: Register new users with first name, last name, username, email, and password.
- **User Login**: Authenticate users and track login attempts.
- **Student Data Form**: After login, users can submit student information (name, ID, course, year).
- **Local Data Storage**: All data is stored in JSON files within the project directory.
- **Responsive Design**: Basic styling for a clean user interface.

## Project Structure

- `index.html` - Main HTML file containing the login, signup, and student data forms.
- `style.css` - CSS styles for the application.
- `script.js` - JavaScript for form handling and interactions.
- `server.py` - Python HTTP server to handle requests and serve static files.
- `server.js` - Node.js HTTP server (alternative to Python server).
- `signup.json` - Stores registered user data.
- `login.json` - Logs all login attempts with timestamps.
- `studentData.json` - Stores student data submissions per username.

## Prerequisites

### For Python Server
- Python 3.x installed on your system.

### For Node.js Server
- Node.js installed on your system.

## Running the Application

### Option 1: Using Python Server (Recommended)

1. Open a terminal in the project directory:
   ```bash
   cd "d:\Login page"
   ```

2. Run the Python server:
   ```bash
   python server.py
   ```

3. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option 2: Using Node.js Server

1. Ensure Node.js is installed.

2. Open a terminal in the project directory:
   ```bash
   cd "d:\Login page"
   ```

3. Run the Node.js server:
   ```bash
   node server.js
   ```

4. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. **Signup**: Click "Signup" to create a new account. Fill in all required fields.
2. **Login**: Use your username and password to log in. Successful and failed attempts are logged.
3. **Student Data**: After logging in, fill out the student information form and submit.
4. **Logout**: Click "Logout" to return to the login page.

## API Endpoints

- `POST /signup` - Register a new user.
- `POST /login` - Authenticate a user.
- `POST /student` - Submit student data (requires username).

## Notes

- The application must be served through a local server (not opened directly as a file) due to CORS and static file serving requirements.
- All data is stored locally in JSON files and persists between server restarts.
- Passwords are stored in plain text (not recommended for production use).
- The application includes basic form validation and error handling.

## Development

To modify the application:
- Edit `index.html` for structure changes.
- Update `style.css` for styling.
- Modify `script.js` for client-side logic.
- Adjust `server.py` or `server.js` for backend changes.

## License

This project is for educational purposes only.
