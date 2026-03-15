# # from flask import Flask, request, jsonify
# # from flask_cors import CORS
# # import subprocess, tempfile, os

# # app = Flask(__name__)
# # CORS(app)

# # @app.route('/run', methods=['POST'])
# # def run_code():
# #     code = request.json.get('code', '')
    
# #     with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w', encoding='utf-8') as f:
# #         f.write(code)
# #         fname = f.name
    
# #     try:
# #         env = os.environ.copy()
# #         env['PYTHONIOENCODING'] = 'utf-8'        # ← forces print() to use utf-8
# #         env['PYTHONUTF8'] = '1'                  # ← Python 3.7+ utf-8 mode

# #         result = subprocess.run(
# #             ['python', fname],
# #             capture_output=True,
# #             text=True,
# #             timeout=10,
# #             encoding='utf-8',
# #             env=env                              # ← pass the env
# #         )
# #     except subprocess.TimeoutExpired:
# #         os.unlink(fname)
# #         return jsonify({ 'stdout': '', 'stderr': 'TimeoutError: Code took too long to run', 'exitCode': 1 })
    
# #     os.unlink(fname)
# #     return jsonify({ 'stdout': result.stdout, 'stderr': result.stderr, 'exitCode': result.returncode })

# # app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)

# # # app.run(port=5000, debug=True)


# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
# import subprocess, tempfile, os

# app = Flask(__name__)
# CORS(app, origins=['*'])

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
#     response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
#     return response

# @app.route('/ping')
# def ping():
#     return 'pong', 200

# @app.route('/run', methods=['POST'])
# def run_code():
#     code = request.json.get('code', '')

#     if len(code) > 5000:
#         return jsonify({
#             'stdout': '',
#             'stderr': 'Code too large',
#             'exitCode': 1
#         })

#     with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w', encoding='utf-8') as f:
#         f.write(code)
#         fname = f.name

#     try:
#         env = os.environ.copy()
#         env['PYTHONIOENCODING'] = 'utf-8'
#         env['PYTHONUTF8'] = '1'

#         result = subprocess.run(
#             ['python', fname],
#             capture_output=True,
#             text=True,
#             timeout=5,
#             encoding='utf-8',
#             env=env
#         )
#     except subprocess.TimeoutExpired:
#         os.unlink(fname)
#         return jsonify({
#             'stdout': '',
#             'stderr': 'TimeoutError: Code took too long',
#             'exitCode': 1
#         })

#     os.unlink(fname)
#     return jsonify({
#         'stdout': result.stdout,
#         'stderr': result.stderr,
#         'exitCode': result.returncode
#     })

# # app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
# app.run(port=5000, debug=True)

# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
# import subprocess, tempfile, os, json
# from datetime import datetime

# app = Flask(__name__, static_folder='.')
# CORS(app, origins=['*'])

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
#     response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
#     return response

# # ── Load questions ────────────────────────────────────────────────────
# def load_questions():
#     with open('questions.json', 'r', encoding='utf-8') as f:
#         return json.load(f)

# # ── Load submissions ──────────────────────────────────────────────────
# def load_submissions():
#     if not os.path.exists('submissions.json'):
#         return []
#     with open('submissions.json', 'r', encoding='utf-8') as f:
#         return json.load(f)

# # ── Save submission ───────────────────────────────────────────────────
# def save_submission(entry):
#     submissions = load_submissions()
#     submissions.append(entry)
#     with open('submissions.json', 'w', encoding='utf-8') as f:
#         json.dump(submissions, f, indent=2, ensure_ascii=False)

# # ── Run Python code ───────────────────────────────────────────────────
# def run_python(code):
#     with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w', encoding='utf-8') as f:
#         f.write(code)
#         fname = f.name
#     try:
#         env = os.environ.copy()
#         env['PYTHONIOENCODING'] = 'utf-8'
#         env['PYTHONUTF8'] = '1'
#         result = subprocess.run(
#             ['python', fname],
#             capture_output=True,
#             text=True,
#             timeout=5,
#             encoding='utf-8',
#             env=env
#         )
#         os.unlink(fname)
#         return result.stdout.strip(), result.stderr.strip(), result.returncode
#     except subprocess.TimeoutExpired:
#         os.unlink(fname)
#         return '', 'TimeoutError: Code took too long', 1
#     except Exception as e:
#         os.unlink(fname)
#         return '', str(e), 1

# # ── PING ──────────────────────────────────────────────────────────────
# @app.route('/ping')
# def ping():
#     return 'pong', 200

# # ── SERVE FRONTEND ────────────────────────────────────────────────────
# @app.route('/')
# def index():
#     return send_from_directory('.', 'index.html')

# @app.route('/<path:path>')
# def static_files(path):
#     return send_from_directory('.', path)

# # ── RUN CODE ──────────────────────────────────────────────────────────
# @app.route('/run', methods=['POST'])
# def run_code():
#     code = request.json.get('code', '')
#     if len(code) > 5000:
#         return jsonify({'stdout': '', 'stderr': 'Code too large', 'exitCode': 1})
#     stdout, stderr, exitcode = run_python(code)
#     return jsonify({'stdout': stdout, 'stderr': stderr, 'exitCode': exitcode})

# # ── GET QUESTIONS ─────────────────────────────────────────────────────
# @app.route('/questions', methods=['GET'])
# def get_questions():
#     questions = load_questions()
#     # Send questions without expected output to participants
#     safe = {}
#     for qid, q in questions.items():
#         safe[qid] = {
#             'title': q['title'],
#             'description': q['description'],
#             'expected':    q['expected']
#         }
#     return jsonify(safe)

# # ── SUBMIT CODE ───────────────────────────────────────────────────────
# @app.route('/submit', methods=['POST'])
# def submit_code():
#     data     = request.json
#     name     = data.get('name', '').strip()
#     roll     = data.get('roll', '').strip()
#     qid      = data.get('question', '')
#     code     = data.get('code', '')
#     start_time = data.get('startTime', None)

#     if not name or not roll:
#         return jsonify({'success': False, 'error': 'Name and Roll number required'})

#     if not qid:
#         return jsonify({'success': False, 'error': 'No question selected'})

#     if len(code) > 5000:
#         return jsonify({'success': False, 'error': 'Code too large'})

#     # Load expected output
#     questions = load_questions()
#     if qid not in questions:
#         return jsonify({'success': False, 'error': 'Invalid question'})

#     expected = questions[qid]['expected'].strip()
#     existing = load_submissions()
#     already_solved = any(
#         s['roll'] == roll and s['question'] == qid
#         for s in existing
#     )
#     if already_solved:
#         return jsonify({
#             'success': False,
#             'error': f'You already solved {qid} correctly!'
#         })

#     # Run the code
#     stdout, stderr, exitcode = run_python(code)

#     # Compare output
#     actual = stdout.strip()
#     passed = (actual == expected) and (exitcode == 0)

#     # Calculate time taken
#     time_taken = None
#     if start_time:
#         time_taken = round((datetime.now().timestamp() * 1000 - start_time) / 1000, 1)

#     if passed:
#         entry = {
#             'name':       name,
#             'roll':       roll,
#             'question':   qid,
#             'title':      questions[qid]['title'],
#             'timeTaken':  time_taken,
#             'submittedAt': datetime.now().strftime('%H:%M:%S'),
#             'code':       code,
#             'output':     actual
#         }
#         save_submission(entry)

#     return jsonify({
#         'success':  True,
#         'passed':   passed,
#         'actual':   actual,
#         'expected': expected if not passed else None,
#         'stderr':   stderr,
#         'exitCode': exitcode,
#         'timeTaken': time_taken
#     })

# # ── LEADERBOARD ───────────────────────────────────────────────────────
# @app.route('/leaderboard', methods=['GET'])
# def leaderboard():
#     submissions = load_submissions()
#     return jsonify(submissions)

# # ── CLEAR LEADERBOARD (judge only) ───────────────────────────────────
# @app.route('/clear', methods=['POST'])
# def clear_leaderboard():
#     secret = request.json.get('secret', '')
#     if secret != 'techteam123':
#         return jsonify({'success': False, 'error': 'Invalid secret'})
#     with open('submissions.json', 'w', encoding='utf-8') as f:
#         json.dump([], f)
#     return jsonify({'success': True})

# if __name__ == '__main__':
#     app.run(port=5000, debug=True)


# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
# from dotenv import load_dotenv
# import subprocess, tempfile, os, json
# from datetime import datetime

# # Load .env file
# load_dotenv()

# app = Flask(__name__, static_folder='.')
# CORS(app, origins=['*'])

# # ── Config from .env ──────────────────────────────────────────────────
# JUDGE_SECRET   = os.environ.get('JUDGE_SECRET', 'judge123')
# ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
# SUPABASE_URL   = os.environ.get('SUPABASE_URL', '')
# SUPABASE_KEY   = os.environ.get('SUPABASE_KEY', '')

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
#     response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
#     return response

# # ── Load questions ────────────────────────────────────────────────────
# def load_questions():
#     with open('questions.json', 'r', encoding='utf-8') as f:
#         return json.load(f)

# # ── Load submissions ──────────────────────────────────────────────────
# def load_submissions():
#     if not os.path.exists('submissions.json'):
#         return []
#     with open('submissions.json', 'r', encoding='utf-8') as f:
#         return json.load(f)

# # ── Save submission ───────────────────────────────────────────────────
# def save_submission(entry):
#     submissions = load_submissions()
#     submissions.append(entry)
#     with open('submissions.json', 'w', encoding='utf-8') as f:
#         json.dump(submissions, f, indent=2, ensure_ascii=False)

# # ── Run Python code ───────────────────────────────────────────────────
# def run_python(code):
#     with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w', encoding='utf-8') as f:
#         f.write(code)
#         fname = f.name
#     try:
#         env = os.environ.copy()
#         env['PYTHONIOENCODING'] = 'utf-8'
#         env['PYTHONUTF8'] = '1'
#         result = subprocess.run(
#             ['python', fname],
#             capture_output=True,
#             text=True,
#             timeout=5,
#             encoding='utf-8',
#             env=env
#         )
#         os.unlink(fname)
#         return result.stdout.strip(), result.stderr.strip(), result.returncode
#     except subprocess.TimeoutExpired:
#         os.unlink(fname)
#         return '', 'TimeoutError: Code took too long', 1
#     except Exception as e:
#         os.unlink(fname)
#         return '', str(e), 1

# # ── PING ──────────────────────────────────────────────────────────────
# @app.route('/ping')
# def ping():
#     return 'pong', 200

# # ── SERVE FRONTEND ────────────────────────────────────────────────────
# @app.route('/')
# def index():
#     return send_from_directory('.', 'login.html')

# @app.route('/ide')
# def ide():
#     return send_from_directory('.', 'index.html')

# @app.route('/<path:path>')
# def static_files(path):
#     return send_from_directory('.', path)

# # ── RUN CODE ──────────────────────────────────────────────────────────
# @app.route('/run', methods=['POST'])
# def run_code():
#     code = request.json.get('code', '')
#     if len(code) > 5000:
#         return jsonify({'stdout': '', 'stderr': 'Code too large', 'exitCode': 1})
#     stdout, stderr, exitcode = run_python(code)
#     return jsonify({'stdout': stdout, 'stderr': stderr, 'exitCode': exitcode})

# # ── GET QUESTIONS ─────────────────────────────────────────────────────
# @app.route('/questions', methods=['GET'])
# def get_questions():
#     questions = load_questions()
#     safe = {}
#     for qid, q in questions.items():
#         safe[qid] = {
#             'title':       q['title'],
#             'description': q['description'],
#             'expected':    q['expected'],
#         }
#     return jsonify(safe)

# # ── SUBMIT CODE ───────────────────────────────────────────────────────
# @app.route('/submit', methods=['POST'])
# def submit_code():
#     data       = request.json
#     name       = data.get('name', '').strip()
#     roll       = data.get('roll', '').strip()
#     qid        = data.get('question', '')
#     code       = data.get('code', '')
#     start_time = data.get('startTime', None)

#     if not name or not roll:
#         return jsonify({'success': False, 'error': 'Name and Roll number required'})
#     if not qid:
#         return jsonify({'success': False, 'error': 'No question selected'})
#     if len(code) > 5000:
#         return jsonify({'success': False, 'error': 'Code too large'})

#     questions = load_questions()
#     if qid not in questions:
#         return jsonify({'success': False, 'error': 'Invalid question'})

#     # Block duplicate correct submissions
#     existing = load_submissions()
#     already_solved = any(
#         s['roll'] == roll and s['question'] == qid
#         for s in existing
#     )
#     if already_solved:
#         return jsonify({'success': False, 'error': f'You already solved {qid} correctly!'})

#     expected = questions[qid]['expected'].strip()
#     stdout, stderr, exitcode = run_python(code)
#     actual = stdout.strip()
#     passed = (actual == expected) and (exitcode == 0)

#     time_taken = None
#     if start_time:
#         time_taken = round((datetime.now().timestamp() * 1000 - start_time) / 1000, 1)

#     if passed:
#         save_submission({
#             'name':        name,
#             'roll':        roll,
#             'question':    qid,
#             'title':       questions[qid]['title'],
#             'timeTaken':   time_taken,
#             'submittedAt': datetime.now().strftime('%H:%M:%S'),
#             'code':        code,
#             'output':      actual
#         })

#     return jsonify({
#         'success':   True,
#         'passed':    passed,
#         'actual':    actual,
#         'expected':  expected if not passed else None,
#         'stderr':    stderr,
#         'exitCode':  exitcode,
#         'timeTaken': time_taken
#     })

# # ── LEADERBOARD ───────────────────────────────────────────────────────
# @app.route('/leaderboard', methods=['GET'])
# def leaderboard():
#     return jsonify(load_submissions())

# # ── CLEAR LEADERBOARD ─────────────────────────────────────────────────
# @app.route('/clear', methods=['POST'])
# def clear_leaderboard():
#     secret = request.json.get('secret', '')
#     if secret != JUDGE_SECRET:
#         return jsonify({'success': False, 'error': 'Invalid secret'})
#     with open('submissions.json', 'w', encoding='utf-8') as f:
#         json.dump([], f)
#     return jsonify({'success': True})

# # ── VERIFY ADMIN ──────────────────────────────────────────────────────
# @app.route('/admin/verify', methods=['POST'])
# def verify_admin():
#     password = request.json.get('password', '')
#     if password != ADMIN_PASSWORD:
#         return jsonify({'success': False, 'error': 'Wrong password'})
#     return jsonify({'success': True})

# if __name__ == '__main__':
#     port = int(os.environ.get('PORT', 5000))
#     app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true')



from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import subprocess, tempfile, os, json
from datetime import datetime

load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app, origins=['*'])

JUDGE_SECRET   = os.environ.get('JUDGE_SECRET', 'judge123')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
SUPABASE_URL   = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY   = os.environ.get('SUPABASE_KEY', '')

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

def load_questions():
    with open('questions.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_submissions():
    if not os.path.exists('submissions.json'):
        return []
    with open('submissions.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_submission(entry):
    submissions = load_submissions()
    submissions.append(entry)
    with open('submissions.json', 'w', encoding='utf-8') as f:
        json.dump(submissions, f, indent=2, ensure_ascii=False)

def load_failed_attempts():
    if not os.path.exists('failed_attempts.json'):
        return {}
    with open('failed_attempts.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_failed_attempts(data):
    with open('failed_attempts.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def load_unlock_requests():
    if not os.path.exists('unlock_requests.json'):
        return []
    with open('unlock_requests.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_unlock_requests(data):
    with open('unlock_requests.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def run_python(code):
    with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w', encoding='utf-8') as f:
        f.write(code)
        fname = f.name
    try:
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'
        env['PYTHONUTF8'] = '1'
        result = subprocess.run(
            ['python', fname],
            capture_output=True, text=True,
            timeout=5, encoding='utf-8', env=env
        )
        os.unlink(fname)
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except subprocess.TimeoutExpired:
        os.unlink(fname)
        return '', 'TimeoutError: Code took too long', 1
    except Exception as e:
        os.unlink(fname)
        return '', str(e), 1

# ── ROUTES ────────────────────────────────────────────────────────────

@app.route('/ping')
def ping():
    return 'pong', 200

@app.route('/')
def index():
    return send_from_directory('.', 'login.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# ── LOGIN ATTEMPT TRACKING ────────────────────────────────────────────
@app.route('/login/attempt', methods=['POST'])
def login_attempt():
    """Track failed login attempts. Lock after 3 failures."""
    data = request.json
    roll   = data.get('roll', '').strip()
    failed = load_failed_attempts()

    if roll not in failed:
        failed[roll] = {'count': 0, 'locked': False, 'requested_unlock': False}

    failed[roll]['count'] += 1

    if failed[roll]['count'] >= 3:
        failed[roll]['locked'] = True

    save_failed_attempts(failed)
    remaining = max(0, 3 - failed[roll]['count'])

    return jsonify({
        'locked':    failed[roll]['locked'],
        'attempts':  failed[roll]['count'],
        'remaining': remaining
    })

@app.route('/login/status', methods=['POST'])
def login_status():
    """Check if a roll number is locked."""
    roll   = request.json.get('roll', '').strip()
    failed = load_failed_attempts()
    info   = failed.get(roll, {'count': 0, 'locked': False, 'requested_unlock': False})
    return jsonify({
        'locked':            info.get('locked', False),
        'attempts':          info.get('count', 0),
        'remaining':         max(0, 3 - info.get('count', 0)),
        'requested_unlock':  info.get('requested_unlock', False)
    })

@app.route('/login/success', methods=['POST'])
def login_success():
    """Clear failed attempts on successful login."""
    roll   = request.json.get('roll', '').strip()
    failed = load_failed_attempts()
    if roll in failed:
        del failed[roll]
        save_failed_attempts(failed)
    return jsonify({'success': True})

# ── UNLOCK REQUESTS ───────────────────────────────────────────────────
@app.route('/unlock/request', methods=['POST'])
def request_unlock():
    """Team requests unlock after being locked."""
    data      = request.json
    roll      = data.get('roll', '').strip()
    team_name = data.get('team_name', '').strip()

    # Mark as requested in failed_attempts
    failed = load_failed_attempts()
    if roll in failed:
        failed[roll]['requested_unlock'] = True
        save_failed_attempts(failed)

    # Add to unlock requests list
    requests_list = load_unlock_requests()
    # Remove old request for same roll if exists
    requests_list = [r for r in requests_list if r['roll'] != roll]
    requests_list.append({
        'roll':        roll,
        'team_name':   team_name,
        'requested_at': datetime.now().strftime('%H:%M:%S'),
        'status':      'pending'
    })
    save_unlock_requests(requests_list)

    return jsonify({'success': True})

@app.route('/unlock/requests', methods=['GET'])
def get_unlock_requests():
    """Admin gets all pending unlock requests."""
    return jsonify(load_unlock_requests())

@app.route('/unlock/approve', methods=['POST'])
def approve_unlock():
    """Admin approves unlock for a team."""
    data   = request.json
    secret = data.get('secret', '')
    roll   = data.get('roll', '').strip()

    if secret != JUDGE_SECRET:
        return jsonify({'success': False, 'error': 'Invalid secret'})

    # Clear failed attempts
    failed = load_failed_attempts()
    if roll in failed:
        del failed[roll]
        save_failed_attempts(failed)

    # Update unlock request status
    requests_list = load_unlock_requests()
    for r in requests_list:
        if r['roll'] == roll:
            r['status'] = 'approved'
    save_unlock_requests(requests_list)

    return jsonify({'success': True})

@app.route('/unlock/check', methods=['POST'])
def check_unlock():
    """Team polls to see if their unlock was approved."""
    roll          = request.json.get('roll', '').strip()
    requests_list = load_unlock_requests()
    for r in requests_list:
        if r['roll'] == roll and r['status'] == 'approved':
            return jsonify({'approved': True})
    return jsonify({'approved': False})

# ── RUN CODE ──────────────────────────────────────────────────────────
@app.route('/run', methods=['POST'])
def run_code():
    code = request.json.get('code', '')
    if len(code) > 5000:
        return jsonify({'stdout': '', 'stderr': 'Code too large', 'exitCode': 1})
    stdout, stderr, exitcode = run_python(code)
    return jsonify({'stdout': stdout, 'stderr': stderr, 'exitCode': exitcode})

# ── QUESTIONS ─────────────────────────────────────────────────────────
@app.route('/questions', methods=['GET'])
def get_questions():
    questions = load_questions()
    safe = {}
    for qid, q in questions.items():
        safe[qid] = {
            'title':       q['title'],
            'description': q['description'],
            'expected':    q['expected'],
        }
    return jsonify(safe)

# ── SUBMIT ────────────────────────────────────────────────────────────
@app.route('/submit', methods=['POST'])
def submit_code():
    data       = request.json
    name       = data.get('name', '').strip()
    roll       = data.get('roll', '').strip()
    qid        = data.get('question', '')
    code       = data.get('code', '')
    start_time = data.get('startTime', None)

    if not name:
        return jsonify({'success': False, 'error': 'Team name required'})
    if not qid:
        return jsonify({'success': False, 'error': 'No question selected'})
    if len(code) > 5000:
        return jsonify({'success': False, 'error': 'Code too large'})

    questions = load_questions()
    if qid not in questions:
        return jsonify({'success': False, 'error': 'Invalid question'})

    existing = load_submissions()
    if any(s['name'] == name and s['question'] == qid for s in existing):
        return jsonify({'success': False, 'error': f'Already solved {qid}!'})

    expected          = questions[qid]['expected'].strip()
    stdout, stderr, exitcode = run_python(code)
    actual            = stdout.strip()
    passed            = (actual == expected) and (exitcode == 0)
    time_taken        = None
    if start_time:
        time_taken = round((datetime.now().timestamp() * 1000 - start_time) / 1000, 1)

    if passed:
        save_submission({
            'name': name,
            'question': qid, 'title': questions[qid]['title'],
            'timeTaken': time_taken,
            'submittedAt': datetime.now().strftime('%H:%M:%S'),
            'code': code, 'output': actual
        })

    return jsonify({
        'success': True, 'passed': passed,
        'actual': actual, 'expected': expected if not passed else None,
        'stderr': stderr, 'exitCode': exitcode, 'timeTaken': time_taken
    })

# ── LEADERBOARD ───────────────────────────────────────────────────────
@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    return jsonify(load_submissions())

@app.route('/clear', methods=['POST'])
def clear_leaderboard():
    secret = request.json.get('secret', '')
    if secret != JUDGE_SECRET:
        return jsonify({'success': False, 'error': 'Invalid secret'})
    with open('submissions.json', 'w', encoding='utf-8') as f:
        json.dump([], f)
    return jsonify({'success': True})

# ── ADMIN VERIFY ──────────────────────────────────────────────────────
@app.route('/admin/verify', methods=['POST'])
def verify_admin():
    password = request.json.get('password', '')
    if password != ADMIN_PASSWORD:
        return jsonify({'success': False, 'error': 'Wrong password'})
    return jsonify({'success': True})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)


# ── TAB VIOLATION TRACKING ────────────────────────────────────────────

def load_tab_violations():
    if not os.path.exists('tab_violations.json'):
        return []
    with open('tab_violations.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_tab_violations(data):
    with open('tab_violations.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

@app.route('/tab/violation', methods=['POST'])
def tab_violation():
    """Record a tab switch violation and notify admin."""
    data  = request.json
    roll  = data.get('roll', '')
    name  = data.get('name', '')
    count = data.get('count', 0)
    is_final = data.get('isFinal', False)
    time  = data.get('time', '')

    violations = load_tab_violations()
    # Update or add violation for this roll
    existing = next((v for v in violations if v['roll'] == roll), None)
    if existing:
        existing['count']    = count
        existing['isFinal']  = is_final
        existing['lastTime'] = time
    else:
        violations.append({
            'roll':      roll,
            'name':      name,
            'count':     count,
            'isFinal':   is_final,
            'lastTime':  time,
            'locked':    False
        })
    save_tab_violations(violations)
    return jsonify({'success': True})

@app.route('/tab/lock', methods=['POST'])
def tab_lock():
    """Lock a team due to tab switching violations."""
    data = request.json
    roll = data.get('roll', '')
    name = data.get('name', '')

    # Add to failed_attempts as locked
    failed = load_failed_attempts()
    failed[roll] = {
        'count':            3,
        'locked':           True,
        'requested_unlock': False,
        'reason':           'tab_switching'
    }
    save_failed_attempts(failed)

    # Mark in violations
    violations = load_tab_violations()
    for v in violations:
        if v['roll'] == roll:
            v['locked'] = True
    save_tab_violations(violations)

    # Add to unlock requests automatically
    requests_list = load_unlock_requests()
    requests_list = [r for r in requests_list if r['roll'] != roll]
    requests_list.append({
        'roll':         roll,
        'team_name':    name,
        'requested_at': datetime.now().strftime('%H:%M:%S'),
        'status':       'pending',
        'reason':       'tab_switching'
    })
    save_unlock_requests(requests_list)

    return jsonify({'success': True})

@app.route('/tab/violations', methods=['GET'])
def get_tab_violations():
    """Admin gets all tab violations."""
    return jsonify(load_tab_violations())