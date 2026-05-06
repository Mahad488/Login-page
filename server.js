const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const rootDir = path.resolve(__dirname);
const signupFile = path.join(rootDir, 'signup.json');
const loginFile = path.join(rootDir, 'login.json');
const studentFile = path.join(rootDir, 'studentData.json');

function readJson(filePath, defaultValue) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || 'null') || defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function sendStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/signup') {
    try {
      const body = await getRequestBody(req);
      const { firstName, lastName, username, email, password } = body;
      if (!firstName || !lastName || !username || !email || !password) {
        return sendJson(res, { success: false, message: 'All signup fields are required.' }, 400);
      }

      const users = readJson(signupFile, []);
      if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        return sendJson(res, { success: false, message: 'Username already taken.' }, 400);
      }
      if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        return sendJson(res, { success: false, message: 'Email already registered.' }, 400);
      }

      users.push({ firstName, lastName, username, email, password });
      writeJson(signupFile, users);
      sendJson(res, { success: true, message: 'Signup successful.' });
    } catch (error) {
      sendJson(res, { success: false, message: 'Invalid signup data.' }, 400);
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/login') {
    try {
      const body = await getRequestBody(req);
      const { username, password } = body;
      if (!username || !password) {
        return sendJson(res, { success: false, message: 'Username and password are required.' }, 400);
      }

      const users = readJson(signupFile, []);
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      const loginAttempts = readJson(loginFile, []);
      const attempt = {
        username,
        time: new Date().toISOString(),
        success: false,
      };

      if (!user || user.password !== password) {
        attempt.message = 'Incorrect username or password.';
        loginAttempts.push(attempt);
        writeJson(loginFile, loginAttempts);
        return sendJson(res, { success: false, message: 'Incorrect username or password.' }, 401);
      }

      attempt.success = true;
      attempt.message = 'Login successful.';
      loginAttempts.push(attempt);
      writeJson(loginFile, loginAttempts);
      sendJson(res, { success: true, message: 'Login successful.', username: user.username });
    } catch (error) {
      sendJson(res, { success: false, message: 'Invalid login data.' }, 400);
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/student') {
    try {
      const body = await getRequestBody(req);
      const { username, studentName, studentId, course, year } = body;
      if (!username || !studentName || !studentId || !course || !year) {
        return sendJson(res, { success: false, message: 'All student fields are required.' }, 400);
      }

      const students = readJson(studentFile, {});
      students[username] = { studentName, studentId, course, year, updatedAt: new Date().toISOString() };
      writeJson(studentFile, students);
      sendJson(res, { success: true, message: 'Student data saved.' });
    } catch (error) {
      sendJson(res, { success: false, message: 'Invalid student data.' }, 400);
    }
    return;
  }

  const safePath = path.normalize(path.join(rootDir, parsedUrl.pathname));
  if (!safePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const filePath = parsedUrl.pathname === '/' ? path.join(rootDir, 'index.html') : safePath;
  sendStatic(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
