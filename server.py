import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 3000
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SIGNUP_FILE = os.path.join(ROOT_DIR, 'signup.json')
LOGIN_FILE = os.path.join(ROOT_DIR, 'login.json')
STUDENT_FILE = os.path.join(ROOT_DIR, 'studentData.json')


def read_json(file_path, default):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default


def write_json(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


class RequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8')
        try:
            data = json.loads(body or '{}')
        except json.JSONDecodeError:
            return self.send_json({'success': False, 'message': 'Invalid JSON body.'}, 400)

        if self.path == '/signup':
            return self.handle_signup(data)
        if self.path == '/login':
            return self.handle_login(data)
        if self.path == '/student':
            return self.handle_student(data)

        self.send_error(404, 'Not found')

    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_signup(self, data):
        first_name = data.get('firstName', '').strip()
        last_name = data.get('lastName', '').strip()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        if not all([first_name, last_name, username, email, password]):
            return self.send_json({'success': False, 'message': 'All signup fields are required.'}, 400)

        users = read_json(SIGNUP_FILE, [])
        if any(user.get('username', '').lower() == username.lower() for user in users):
            return self.send_json({'success': False, 'message': 'Username already taken.'}, 400)
        if any(user.get('email', '').lower() == email.lower() for user in users):
            return self.send_json({'success': False, 'message': 'Email already registered.'}, 400)

        users.append({
            'firstName': first_name,
            'lastName': last_name,
            'username': username,
            'email': email,
            'password': password,
        })
        write_json(SIGNUP_FILE, users)
        return self.send_json({'success': True, 'message': 'Signup successful.'})

    def handle_login(self, data):
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return self.send_json({'success': False, 'message': 'Username and password are required.'}, 400)

        users = read_json(SIGNUP_FILE, [])
        user = next((u for u in users if u.get('username', '').lower() == username.lower()), None)
        login_attempts = read_json(LOGIN_FILE, [])
        attempt = {
            'username': username,
            'time': __import__('datetime').datetime.now().isoformat(),
            'success': False,
        }

        if not user or user.get('password') != password:
            attempt['message'] = 'Incorrect username or password.'
            login_attempts.append(attempt)
            write_json(LOGIN_FILE, login_attempts)
            return self.send_json({'success': False, 'message': 'Incorrect username or password.'}, 401)

        attempt['success'] = True
        attempt['message'] = 'Login successful.'
        login_attempts.append(attempt)
        write_json(LOGIN_FILE, login_attempts)
        return self.send_json({'success': True, 'message': 'Login successful.', 'username': user.get('username')})

    def handle_student(self, data):
        username = data.get('username', '').strip()
        student_name = data.get('studentName', '').strip()
        student_id = data.get('studentId', '').strip()
        course = data.get('course', '').strip()
        year = data.get('year', '').strip()

        if not all([username, student_name, student_id, course, year]):
            return self.send_json({'success': False, 'message': 'All student fields are required.'}, 400)

        students = read_json(STUDENT_FILE, {})
        students[username] = {
            'studentName': student_name,
            'studentId': student_id,
            'course': course,
            'year': year,
            'updatedAt': __import__('datetime').datetime.now().isoformat(),
        }
        write_json(STUDENT_FILE, students)
        return self.send_json({'success': True, 'message': 'Student data saved.'})


if __name__ == '__main__':
    os.chdir(ROOT_DIR)
    server = HTTPServer(('localhost', PORT), RequestHandler)
    print(f'Server running on http://localhost:{PORT}')
    server.serve_forever()
