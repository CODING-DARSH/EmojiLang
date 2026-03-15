<<<<<<< HEAD
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
=======
from flask import Flask, request, jsonify, send_from_directory, Response, stream_with_context, redirect
from flask_cors import CORS
import hmac
import json
import queue
import re
import sys
import subprocess, tempfile, os
from urllib import request as urlrequest
from urllib import error as urlerror
>>>>>>> f5da7e110be300249f54d955627ebfcc15bf175f

load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app, origins=['*'])

<<<<<<< HEAD
JUDGE_SECRET   = os.environ.get('JUDGE_SECRET', 'judge123')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
SUPABASE_URL   = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY   = os.environ.get('SUPABASE_KEY', '')
=======
flash_state = {
    'moduleId': 'm4',
    'name': 'The Zipper',
    'emojis': '🧵 🤝 📜 ➡️ 📜 ✨',
    'ts': 1741968840000
}
flash_subscribers = []
leaderboard_state = {
    'teams': [
        {'id': 1, 'name': 'Cyber Phantoms', 'score': 450, 'patches': 5, 'hintsUsed': 1},
        {'id': 2, 'name': 'Null Pointers', 'score': 380, 'patches': 4, 'hintsUsed': 2},
        {'id': 3, 'name': 'Logic Bombs', 'score': 310, 'patches': 3, 'hintsUsed': 0},
        {'id': 4, 'name': 'Bit Wizards', 'score': 290, 'patches': 3, 'hintsUsed': 1},
        {'id': 5, 'name': 'Deep Flow', 'score': 150, 'patches': 1, 'hintsUsed': 3}
    ],
    'modules': [
        {'id': 'm1', 'name': 'The Bookbinder', 'solved': True, 'firstBlood': 'Cyber Phantoms', 'expected_time': 'O(log n)', 'expected_space': 'O(1)'},
        {'id': 'm2', 'name': 'The Train Robbery', 'solved': True, 'firstBlood': 'Null Pointers', 'expected_time': 'O(n)', 'expected_space': 'O(1)'},
        {'id': 'm3', 'name': 'The Dishwasher', 'solved': True, 'firstBlood': 'Logic Bombs', 'expected_time': 'O(n)', 'expected_space': 'O(n)'},
        {'id': 'm4', 'name': 'The Zipper', 'solved': False, 'firstBlood': None, 'expected_time': 'O(n)', 'expected_space': 'O(n)'},
        {'id': 'm5', 'name': 'The Floating Balloon', 'solved': False, 'firstBlood': None, 'expected_time': 'O(n^2)', 'expected_space': 'O(1)'},
        {'id': 'm6', 'name': 'Missing Puzzle Piece', 'solved': False, 'firstBlood': None, 'expected_time': 'O(n)', 'expected_space': 'O(n)'},
        {'id': 'm7', 'name': 'The Bouncer', 'solved': False, 'firstBlood': None, 'expected_time': 'O(n)', 'expected_space': 'O(1)'},
        {'id': 'm8', 'name': 'The Finger Crash', 'solved': False, 'firstBlood': None, 'expected_time': 'O(n)', 'expected_space': 'O(1)'},
        {'id': 'm9', 'name': 'Stock Broker Trash', 'solved': False, 'firstBlood': None, 'expected_time': 'O(n)', 'expected_space': 'O(1)'},
        {'id': 'm10', 'name': 'The Masonry Wall', 'solved': False, 'firstBlood': None, 'expected_time': 'O(n)', 'expected_space': 'O(n)'}
    ],
    'currentBroadcastModuleId': 'm4',
    'ts': None
}
leaderboard_subscribers = []
latest_submission = None
submission_subscribers = []

MODULE_LIBRARY = {
    'm1': {'name': 'The Bookbinder', 'context': 'Binary Search on a sorted array', 'expected_time': 'O(log n)', 'expected_space': 'O(1)', 'signals': ['binary', 'mid', 'left', 'right', 'sorted'], 'emojis': '📖 ✂️ 📖 📍'},
    'm2': {'name': 'The Train Robbery', 'context': 'Sliding Window max sum of subarray size K', 'expected_time': 'O(n)', 'expected_space': 'O(1)', 'signals': ['window', 'sum', 'k', 'max', 'subarray'], 'emojis': '🚂 🚃 ➡️ 🛤️ 💰'},
    'm3': {'name': 'The Dishwasher', 'context': 'Reverse an array using stack', 'expected_time': 'O(n)', 'expected_space': 'O(n)', 'signals': ['stack', 'reverse', 'pop', 'append'], 'emojis': '🍽️ 🧱 🔄 🧱'},
    'm4': {'name': 'The Zipper', 'context': 'Merge two sorted arrays using two pointers', 'expected_time': 'O(n)', 'expected_space': 'O(n)', 'signals': ['merge', 'sorted', 'pointer', 'i', 'j'], 'emojis': '🧵 🤝 📜 ➡️ 📜 ✨'},
    'm5': {'name': 'The Floating Balloon', 'context': 'Bubble sort implementation', 'expected_time': 'O(n^2)', 'expected_space': 'O(1)', 'signals': ['bubble', 'swap', 'sort', 'for', 'range'], 'emojis': '🎈 ⬆️ 🪂 ⬇️ 🔄'},
    'm6': {'name': 'Missing Puzzle Piece', 'context': 'Two Sum using hash map', 'expected_time': 'O(n)', 'expected_space': 'O(n)', 'signals': ['two', 'sum', 'hash', 'dict', 'target'], 'emojis': '🧩 🔍 ❓ ➡️ 🖼️'},
    'm7': {'name': 'The Bouncer', 'context': 'Remove duplicates from sorted array', 'expected_time': 'O(n)', 'expected_space': 'O(1)', 'signals': ['duplicate', 'sorted', 'unique'], 'emojis': '🧍‍♂️ ✅ 🧍‍♂️ ❌ 🧞'},
    'm8': {'name': 'The Finger Crash', 'context': 'Palindrome check using two pointers', 'expected_time': 'O(n)', 'expected_space': 'O(1)', 'signals': ['palindrome', 'left', 'right', 'string'], 'emojis': '👈 🔤 👉 💥 🤝'},
    'm9': {'name': 'Stock Broker Trash', 'context': 'Kadane algorithm max subarray', 'expected_time': 'O(n)', 'expected_space': 'O(1)', 'signals': ['kadane', 'max', 'subarray', 'current', 'sum'], 'emojis': '📉 🗑️ 📈 🎒 💰'},
    'm10': {'name': 'The Masonry Wall', 'context': 'Fibonacci sequence generator', 'expected_time': 'O(n)', 'expected_space': 'O(n)', 'signals': ['fibonacci', 'sequence', 'n', 'append'], 'emojis': '🧱 ➕ 🧱🧱 ➡️ 🔄'},
}

submission_log = []

GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_DEFAULT_MODEL = 'llama-3.1-8b-instant'
>>>>>>> f5da7e110be300249f54d955627ebfcc15bf175f

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

<<<<<<< HEAD
def load_questions():
    with open('questions.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_submissions():
    if not os.path.exists('submissions.json'):
        return []
    with open('submissions.json', 'r', encoding='utf-8') as f:
        return json.load(f)
=======
def require_admin_token():
    expected_token = os.environ.get('ADMIN_API_TOKEN', '').strip()
    is_production = os.environ.get('VERCEL') == '1' or os.environ.get('NODE_ENV', '').lower() == 'production'

    if not expected_token:
        if is_production:
            return False, jsonify({'ok': False, 'error': 'ADMIN_API_TOKEN is required in production'}), 500
        return True, None, None

    provided_token = request.headers.get('X-Admin-Token', '').strip()
    if not provided_token or not hmac.compare_digest(provided_token, expected_token):
        return False, jsonify({'ok': False, 'error': 'Unauthorized'}), 401

    return True, None, None

def ensure_default_modules_state():
    if leaderboard_state.get('modules'):
        return

    leaderboard_state['modules'] = [
        {
            'id': module_id,
            'name': module['name'],
            'solved': False,
            'firstBlood': None,
            'expected_time': module['expected_time'],
            'expected_space': module['expected_space'],
        }
        for module_id, module in MODULE_LIBRARY.items()
    ]

def get_or_create_team(team_name):
    normalized = re.sub(r'\s+', ' ', str(team_name or '').strip())
    if not normalized:
        return None

    teams = leaderboard_state.setdefault('teams', [])
    existing = next((team for team in teams if str(team.get('name', '')).lower() == normalized.lower()), None)
    if existing:
        return existing

    new_id = (max([int(team.get('id', 0)) for team in teams], default=0) + 1)
    team = {
        'id': new_id,
        'name': normalized,
        'score': 0,
        'patches': 0,
        'hintsUsed': 0,
    }
    teams.append(team)
    return team

def get_module_state(module_id):
    ensure_default_modules_state()
    return next((module for module in leaderboard_state['modules'] if module.get('id') == module_id), None)

def estimate_time_complexity(source):
    src = source.lower()
    nested_for = bool(re.search(r'for\s+.+:\s*(?:.|\n){0,120}for\s+.+:', src))
    has_for = 'for ' in src
    has_while = 'while ' in src
    binary_pattern = all(keyword in src for keyword in ('mid', 'left', 'right')) and has_while

    if binary_pattern:
        return 'O(log n)'
    if nested_for:
        return 'O(n^2)'
    if has_for or has_while:
        return 'O(n)'
    return 'O(1)'

def estimate_space_complexity(source):
    src = source.lower()
    aux_structures = sum(1 for marker in ('dict(', 'set(', '[]', 'append(', 'stack', '{}') if marker in src)
    if aux_structures >= 2:
        return 'O(n)'
    return 'O(1)'

def complexity_score(estimated, expected):
    rank = {'O(1)': 1, 'O(log n)': 2, 'O(n)': 3, 'O(n^2)': 4, 'O(n^3)': 5}
    e_rank = rank.get(estimated, 6)
    x_rank = rank.get(expected, 6)
    if e_rank <= x_rank:
        return 15
    if e_rank == x_rank + 1:
        return 8
    return 3

def token_hit_ratio(text, token_pool):
    normalized = re.sub(r'[^a-z0-9 ]+', ' ', str(text or '').lower())
    tokens = set(normalized.split())
    if not token_pool:
        return 0.0
    hits = sum(1 for token in token_pool if token in tokens)
    return hits / float(len(token_pool))

def evaluate_round2_submission(module_id, decoded_guess, source_code):
    module = MODULE_LIBRARY[module_id]
    src = str(source_code or '')

    decode_pool = set(module['name'].lower().split() + module['context'].lower().split() + module['signals'])
    decode_ratio = token_hit_ratio(decoded_guess, decode_pool)
    decode_from_code = token_hit_ratio(src, module['signals'])
    decode_score = 25 if max(decode_ratio, decode_from_code) >= 0.25 else 10 if max(decode_ratio, decode_from_code) >= 0.12 else 0

    has_flow = bool(re.search(r'\bif\b|\bfor\b|\bwhile\b', src.lower()))
    has_return_or_print = bool(re.search(r'\breturn\b|\bprint\b', src.lower()))
    signal_hits = sum(1 for signal in module['signals'] if signal in src.lower())
    logical_score = min(45, signal_hits * 8 + (12 if has_flow else 0) + (9 if has_return_or_print else 0))

    est_time = estimate_time_complexity(src)
    est_space = estimate_space_complexity(src)
    time_score = complexity_score(est_time, module['expected_time'])
    space_score = complexity_score(est_space, module['expected_space'])
    quality_score = time_score + space_score

    total = decode_score + logical_score + quality_score
    verdict = 'accepted' if total >= 60 and logical_score >= 22 else 'review'

    return {
        'decodeScore': decode_score,
        'logicalScore': logical_score,
        'qualityScore': quality_score,
        'timeComplexity': {'estimated': est_time, 'expected': module['expected_time'], 'score': time_score},
        'spaceComplexity': {'estimated': est_space, 'expected': module['expected_space'], 'score': space_score},
        'totalScore': total,
        'verdict': verdict,
        'moduleName': module['name'],
    }

def build_round2_scoring_prompts(module_id, decoded_guess, source_code):
    module = MODULE_LIBRARY[module_id]

    system_prompt = (
        "You are the autonomous scoring engine for an undergraduate CS event called Operation: System Override. "
        "Your job is to score Round 2 submissions strictly and fairly. "
        "You must return only valid JSON and never include markdown or extra text."
    )

    rubric = (
        "Scoring rubric (total 100):\n"
        "- decodeScore: 0..25 -> how accurately decoded emoji problem intent.\n"
        "- logicalScore: 0..45 -> algorithm design, correctness, edge-case handling.\n"
        "- qualityScore: 0..30 -> time/space quality versus expected complexity.\n"
        "Verdict rules:\n"
        "- accepted if totalScore >= 60 and logicalScore >= 22\n"
        "- review otherwise\n"
        "Complexity scoring guidance:\n"
        "- strong match to expected complexity: high score\n"
        "- one tier worse: medium score\n"
        "- significantly worse: low score"
    )

    output_contract = (
        "Return JSON with this exact structure and key names:\n"
        "{\n"
        "  \"decodeScore\": <int 0..25>,\n"
        "  \"logicalScore\": <int 0..45>,\n"
        "  \"qualityScore\": <int 0..30>,\n"
        "  \"timeComplexity\": {\"estimated\": \"...\", \"expected\": \"...\", \"score\": <int 0..15>},\n"
        "  \"spaceComplexity\": {\"estimated\": \"...\", \"expected\": \"...\", \"score\": <int 0..15>},\n"
        "  \"totalScore\": <int 0..100>,\n"
        "  \"verdict\": \"accepted\" | \"review\",\n"
        "  \"moduleName\": \"...\",\n"
        "  \"notes\": \"one concise sentence\"\n"
        "}"
    )

    user_prompt = (
        f"Module ID: {module_id}\n"
        f"Module Name: {module['name']}\n"
        f"Expected Approach: {module['context']}\n"
        f"Expected Time Complexity: {module['expected_time']}\n"
        f"Expected Space Complexity: {module['expected_space']}\n"
        f"Signal Keywords: {', '.join(module['signals'])}\n\n"
        f"Decoded Guess from Team:\n{decoded_guess or '(empty)'}\n\n"
        f"Submitted Source Code:\n{source_code}\n\n"
        f"{rubric}\n\n"
        f"{output_contract}"
    )

    return system_prompt, user_prompt

def normalize_groq_scoring(raw, module_id):
    module = MODULE_LIBRARY[module_id]

    decode_score = int(raw.get('decodeScore', 0))
    logical_score = int(raw.get('logicalScore', 0))
    quality_score = int(raw.get('qualityScore', 0))

    decode_score = max(0, min(25, decode_score))
    logical_score = max(0, min(45, logical_score))
    quality_score = max(0, min(30, quality_score))

    total_score = max(0, min(100, decode_score + logical_score + quality_score))
    verdict = str(raw.get('verdict', 'review')).lower().strip()
    if verdict not in ('accepted', 'review'):
        verdict = 'review'
    if total_score < 60 or logical_score < 22:
        verdict = 'review'

    time_obj = raw.get('timeComplexity') or {}
    space_obj = raw.get('spaceComplexity') or {}

    time_score = int(time_obj.get('score', 0)) if isinstance(time_obj, dict) else 0
    space_score = int(space_obj.get('score', 0)) if isinstance(space_obj, dict) else 0
    time_score = max(0, min(15, time_score))
    space_score = max(0, min(15, space_score))

    return {
        'decodeScore': decode_score,
        'logicalScore': logical_score,
        'qualityScore': quality_score,
        'timeComplexity': {
            'estimated': str(time_obj.get('estimated', 'unknown')) if isinstance(time_obj, dict) else 'unknown',
            'expected': str(time_obj.get('expected', module['expected_time'])) if isinstance(time_obj, dict) else module['expected_time'],
            'score': time_score,
        },
        'spaceComplexity': {
            'estimated': str(space_obj.get('estimated', 'unknown')) if isinstance(space_obj, dict) else 'unknown',
            'expected': str(space_obj.get('expected', module['expected_space'])) if isinstance(space_obj, dict) else module['expected_space'],
            'score': space_score,
        },
        'totalScore': total_score,
        'verdict': verdict,
        'moduleName': module['name'],
        'notes': str(raw.get('notes', '')).strip(),
    }

def infer_with_groq_round2(module_id, decoded_guess, source_code):
    api_key = os.environ.get('GROQ_SERVER_API_KEY', '').strip()
    if not api_key:
        return None

    system_prompt, user_prompt = build_round2_scoring_prompts(module_id, decoded_guess, source_code)
    model_name = os.environ.get('GROQ_SCORING_MODEL', GROQ_DEFAULT_MODEL).strip() or GROQ_DEFAULT_MODEL

    body = {
        'model': model_name,
        'temperature': 0.2,
        'max_tokens': 500,
        'response_format': {'type': 'json_object'},
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt},
        ],
    }

    req = urlrequest.Request(
        GROQ_API_URL,
        data=json.dumps(body).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
        method='POST',
    )

    try:
        with urlrequest.urlopen(req, timeout=20) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except (urlerror.URLError, json.JSONDecodeError, TimeoutError):
        return None

    content = (
        payload.get('choices', [{}])[0]
        .get('message', {})
        .get('content', '')
    )
    if not content:
        return None

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        return None

    return normalize_groq_scoring(parsed, module_id)

def broadcast_leaderboard_state():
    leaderboard_state['ts'] = leaderboard_state.get('ts') or None
    message = f"data: {json.dumps(leaderboard_state)}\n\n"
    stale = []
    for subscriber in leaderboard_subscribers:
        try:
            subscriber.put_nowait(message)
        except Exception:
            stale.append(subscriber)

    for subscriber in stale:
        if subscriber in leaderboard_subscribers:
            leaderboard_subscribers.remove(subscriber)

def broadcast_submission_state(payload):
    global latest_submission
    latest_submission = payload

    message = f"data: {json.dumps(payload)}\n\n"
    stale = []
    for subscriber in submission_subscribers:
        try:
            subscriber.put_nowait(message)
        except Exception:
            stale.append(subscriber)

    for subscriber in stale:
        if subscriber in submission_subscribers:
            submission_subscribers.remove(subscriber)

def broadcast_flash_state():
    message = f"data: {json.dumps(flash_state)}\n\n"
    stale = []
    for subscriber in flash_subscribers:
        try:
            subscriber.put_nowait(message)
        except Exception:
            stale.append(subscriber)

    for subscriber in stale:
        if subscriber in flash_subscribers:
            flash_subscribers.remove(subscriber)

@app.route('/ping')
def ping():
    return 'pong', 200

@app.route('/')
def serve_index():
    return redirect('/display')

@app.route('/participant')
def serve_participant():
    return send_from_directory('.', 'index.html')

@app.route('/evaluation')
def serve_evaluation():
    return send_from_directory('.', 'evaluation.html')

@app.route('/display')
def serve_display():
    return send_from_directory('.', 'display.html')

@app.route('/api/flash', methods=['POST'])
def publish_flash():
    ok, error_response, status_code = require_admin_token()
    if not ok:
        return error_response, status_code

    payload = request.get_json(silent=True) or {}
    module_id = payload.get('moduleId')
    if not module_id:
        return jsonify({'ok': False, 'error': 'moduleId is required'}), 400

    flash_state['moduleId'] = str(module_id)
    flash_state['name'] = payload.get('name')
    flash_state['emojis'] = payload.get('emojis')
    flash_state['ts'] = payload.get('ts')

    broadcast_flash_state()

    return jsonify({'ok': True, 'state': flash_state})

@app.route('/api/flash/state', methods=['GET'])
def get_flash_state():
    return jsonify({'ok': True, 'state': flash_state})

@app.route('/api/flash/events', methods=['GET'])
def flash_events():
    subscriber = queue.Queue(maxsize=20)
    flash_subscribers.append(subscriber)

    def event_stream():
        try:
            initial = f"data: {json.dumps(flash_state)}\n\n"
            yield initial
            while True:
                try:
                    message = subscriber.get(timeout=25)
                    yield message
                except queue.Empty:
                    yield ': keep-alive\n\n'
        finally:
            if subscriber in flash_subscribers:
                flash_subscribers.remove(subscriber)

    return Response(
        stream_with_context(event_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    )

@app.route('/api/leaderboard', methods=['POST'])
def publish_leaderboard():
    ok, error_response, status_code = require_admin_token()
    if not ok:
        return error_response, status_code

    payload = request.get_json(silent=True) or {}
    leaderboard_state['teams'] = payload.get('teams') or []
    leaderboard_state['modules'] = payload.get('modules') or []
    leaderboard_state['currentBroadcastModuleId'] = payload.get('currentBroadcastModuleId')
    leaderboard_state['ts'] = payload.get('ts')

    broadcast_leaderboard_state()

    return jsonify({'ok': True, 'state': leaderboard_state})

@app.route('/api/leaderboard/state', methods=['GET'])
def get_leaderboard_state():
    return jsonify({'ok': True, 'state': leaderboard_state})

@app.route('/api/leaderboard/events', methods=['GET'])
def leaderboard_events():
    subscriber = queue.Queue(maxsize=20)
    leaderboard_subscribers.append(subscriber)

    def event_stream():
        try:
            initial = f"data: {json.dumps(leaderboard_state)}\n\n"
            yield initial
            while True:
                try:
                    message = subscriber.get(timeout=25)
                    yield message
                except queue.Empty:
                    yield ': keep-alive\n\n'
        finally:
            if subscriber in leaderboard_subscribers:
                leaderboard_subscribers.remove(subscriber)

    return Response(
        stream_with_context(event_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    )

@app.route('/<path:asset_path>')
def serve_assets(asset_path):
    if asset_path in ('run', 'ping'):
        return jsonify({'error': 'Not found'}), 404
    return send_from_directory('.', asset_path)

@app.route('/api/round2/submit', methods=['POST'])
def round2_submit():
    ensure_default_modules_state()
    payload = request.get_json(silent=True) or {}
    inference_input = payload.get('inferenceInput') or {}

    team_name = payload.get('teamName')
    module_id = str(payload.get('moduleId') or '').strip()
    decoded_guess = (
        inference_input.get('decodedGuess')
        if isinstance(inference_input, dict)
        else None
    )
    source_code = (
        inference_input.get('code')
        if isinstance(inference_input, dict)
        else None
    )

    if decoded_guess is None:
        decoded_guess = payload.get('decodedGuess', '')
    if source_code is None:
        source_code = payload.get('code', '')

    if module_id not in MODULE_LIBRARY:
        return jsonify({'ok': False, 'error': 'Invalid moduleId'}), 400
    if not str(source_code).strip():
        return jsonify({'ok': False, 'error': 'Source code is required'}), 400

    if flash_state.get('moduleId') and flash_state.get('moduleId') != module_id:
        return jsonify({'ok': False, 'error': f'Active dataset is {flash_state.get("moduleId")}. Submissions are locked to the active module.'}), 409

    team = get_or_create_team(team_name)
    if not team:
        return jsonify({'ok': False, 'error': 'teamName is required'}), 400

    module_state = get_module_state(module_id)
    evaluation = infer_with_groq_round2(module_id, decoded_guess, source_code)
    if not evaluation:
        evaluation = evaluate_round2_submission(module_id, decoded_guess, source_code)
    gained_points = int(evaluation['totalScore'])
    first_blood_bonus = 0

    if evaluation['verdict'] == 'accepted' and module_state and not module_state.get('firstBlood'):
        module_state['firstBlood'] = team['name']
        module_state['solved'] = True
        first_blood_bonus = 15
        gained_points += first_blood_bonus

    team['score'] = int(team.get('score', 0)) + gained_points
    if evaluation['verdict'] == 'accepted':
        team['patches'] = int(team.get('patches', 0)) + 1

    leaderboard_state['currentBroadcastModuleId'] = module_id
    leaderboard_state['ts'] = payload.get('ts') or None
    broadcast_leaderboard_state()

    submission_entry = {
        'id': len(submission_log) + 1,
        'teamId': team['id'],
        'teamName': team['name'],
        'moduleId': module_id,
        'decodedGuess': decoded_guess,
        'code': source_code,
        'result': evaluation,
        'firstBloodBonus': first_blood_bonus,
    }
    submission_log.append(submission_entry)
    if len(submission_log) > 200:
        submission_log.pop(0)

    broadcast_submission_state(submission_entry)

    return jsonify({
        'ok': True,
        'team': team,
        'module': module_state,
        'evaluation': evaluation,
        'firstBloodBonus': first_blood_bonus,
        'gainedPoints': gained_points,
    })

@app.route('/api/submissions/state', methods=['GET'])
def get_submissions_state():
    return jsonify({
        'ok': True,
        'latest': latest_submission,
        'recent': submission_log[-10:],
    })

@app.route('/api/submissions/events', methods=['GET'])
def submissions_events():
    subscriber = queue.Queue(maxsize=20)
    submission_subscribers.append(subscriber)

    def event_stream():
        try:
            initial_payload = latest_submission if latest_submission else {'type': 'empty'}
            initial = f"data: {json.dumps(initial_payload)}\n\n"
            yield initial
            while True:
                try:
                    message = subscriber.get(timeout=25)
                    yield message
                except queue.Empty:
                    yield ': keep-alive\n\n'
        finally:
            if subscriber in submission_subscribers:
                submission_subscribers.remove(subscriber)

    return Response(
        stream_with_context(event_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    )

@app.route('/api/admin/reset', methods=['POST'])
def admin_reset_state():
    ok, error_response, status_code = require_admin_token()
    if not ok:
        return error_response, status_code

    global latest_submission

    flash_state['moduleId'] = None
    flash_state['name'] = None
    flash_state['emojis'] = None
    flash_state['ts'] = None

    leaderboard_state['teams'] = []
    leaderboard_state['modules'] = []
    leaderboard_state['currentBroadcastModuleId'] = None
    leaderboard_state['ts'] = None

    latest_submission = None
    submission_log.clear()

    broadcast_flash_state()
    broadcast_leaderboard_state()
    broadcast_submission_state({'type': 'empty'})

    return jsonify({'ok': True})

@app.route('/api/round2/hint', methods=['POST'])
def round2_hint():
    ensure_default_modules_state()
    payload = request.get_json(silent=True) or {}

    team = get_or_create_team(payload.get('teamName'))
    module_id = str(payload.get('moduleId') or '').strip()
    if not team:
        return jsonify({'ok': False, 'error': 'teamName is required'}), 400
    if module_id not in MODULE_LIBRARY:
        return jsonify({'ok': False, 'error': 'Invalid moduleId'}), 400

    hint_text = f"Hint unlocked: focus on {MODULE_LIBRARY[module_id]['context'].split(' using ')[0].lower()}."
    penalty = 10
    team['score'] = int(team.get('score', 0)) - penalty
    team['hintsUsed'] = int(team.get('hintsUsed', 0)) + 1

    leaderboard_state['ts'] = payload.get('ts') or None
    broadcast_leaderboard_state()

    hint_ping = {
        'type': 'hint_request',
        'teamId': team.get('id'),
        'teamName': team.get('name'),
        'moduleId': module_id,
        'penalty': penalty,
        'ts': payload.get('ts') or None,
    }
    broadcast_submission_state(hint_ping)

    return jsonify({
        'ok': True,
        'hint': hint_text,
        'penalty': penalty,
        'team': team,
        'adminPinged': True,
    })

@app.route('/api/round2/prompt-preview', methods=['POST'])
def round2_prompt_preview():
    payload = request.get_json(silent=True) or {}
    module_id = str(payload.get('moduleId') or '').strip()
    if module_id not in MODULE_LIBRARY:
        return jsonify({'ok': False, 'error': 'Invalid moduleId'}), 400

    decoded_guess = payload.get('decodedGuess', '')
    source_code = payload.get('code', '')
    system_prompt, user_prompt = build_round2_scoring_prompts(module_id, decoded_guess, source_code)
    return jsonify({
        'ok': True,
        'model': os.environ.get('GROQ_SCORING_MODEL', GROQ_DEFAULT_MODEL),
        'systemPrompt': system_prompt,
        'userPrompt': user_prompt,
    })

@app.route('/run', methods=['POST'])
def run_code():
    payload = request.get_json(silent=True) or {}
    code = payload.get('code', '')
>>>>>>> f5da7e110be300249f54d955627ebfcc15bf175f

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
<<<<<<< HEAD
            ['python', fname],
            capture_output=True, text=True,
            timeout=5, encoding='utf-8', env=env
=======
            [sys.executable, fname],
            capture_output=True,
            text=True,
            timeout=5,
            encoding='utf-8',
            env=env
>>>>>>> f5da7e110be300249f54d955627ebfcc15bf175f
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

<<<<<<< HEAD
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
=======
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
>>>>>>> f5da7e110be300249f54d955627ebfcc15bf175f
