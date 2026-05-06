let currentUsername = null;

function showMessage(elementId, message, type = 'error') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = `message ${type}`;
}

function clearMessages() {
    showMessage('loginMessage', '');
    showMessage('signupMessage', '');
    showMessage('studentMessage', '');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const eyeIcon = input.parentElement.querySelector('.eye-icon');

    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.textContent = '🙈'; // Closed eye when password is visible
    } else {
        input.type = 'password';
        eyeIcon.textContent = '👁️'; // Open eye when password is hidden
    }
}

function showSignup() {
    clearMessages();
    document.querySelector('.loginForm').style.display = 'none';
    document.querySelector('.studentData').style.display = 'none';
    document.querySelector('.signupForm').style.display = 'block';
}

function showLogin() {
    currentUsername = null;
    clearMessages();
    document.querySelector('.signupForm').style.display = 'none';
    document.querySelector('.studentData').style.display = 'none';
    document.querySelector('.loginForm').style.display = 'block';
}

function logout() {
    showLogin();
}

function showStudentData(username) {
    currentUsername = username;
    clearMessages();
    document.querySelector('.loginForm').style.display = 'none';
    document.querySelector('.signupForm').style.display = 'none';
    document.querySelector('.studentData').style.display = 'block';
    document.getElementById('welcomeTitle').textContent = `Welcome, ${username}`;
}

async function postJson(path, payload) {
    const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return response.json();
}

async function handleSignup() {
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!firstName || !lastName || !username || !email || !password) {
        showMessage('signupMessage', 'Please fill in all signup fields.', 'error');
        return;
    }

    try {
        const result = await postJson('/signup', { firstName, lastName, username, email, password });
        if (!result.success) {
            showMessage('signupMessage', result.message || 'Signup failed.', 'error');
            return;
        }
        showMessage('signupMessage', 'Account created successfully. Please login now.', 'success');
        document.getElementById('signupForm').reset();
    } catch (error) {
        showMessage('signupMessage', 'Could not reach server. Start the local server first.', 'error');
    }
}

async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showMessage('loginMessage', 'Please enter username and password.', 'error');
        return;
    }

    try {
        const result = await postJson('/login', { username, password });
        if (!result.success) {
            showMessage('loginMessage', result.message || 'Login failed.', 'error');
            return;
        }
        showMessage('loginMessage', 'Login successful!', 'success');
        document.getElementById('loginForm').reset();
        setTimeout(() => showStudentData(result.username || username), 500);
    } catch (error) {
        showMessage('loginMessage', 'Could not reach server. Start the local server first.', 'error');
    }
}

async function handleStudentSubmit() {
    const studentName = document.getElementById('studentName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const course = document.getElementById('studentCourse').value.trim();
    const year = document.getElementById('studentYear').value.trim();

    if (!studentName || !studentId || !course || !year) {
        showMessage('studentMessage', 'Please fill in all student fields.', 'error');
        return;
    }
    if (!currentUsername) {
        showMessage('studentMessage', 'Please login first.', 'error');
        return;
    }

    try {
        const result = await postJson('/student', { username: currentUsername, studentName, studentId, course, year });
        if (!result.success) {
            showMessage('studentMessage', result.message || 'Save failed.', 'error');
            return;
        }
        showMessage('studentMessage', 'Student data saved successfully.', 'success');
        document.getElementById('studentForm').reset();
    } catch (error) {
        showMessage('studentMessage', 'Could not reach server. Start the local server first.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('create').addEventListener('click', handleSignup);
    document.getElementById('login').addEventListener('click', handleLogin);
    document.getElementById('submitData').addEventListener('click', handleStudentSubmit);
});
