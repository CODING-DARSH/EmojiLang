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

app = Flask(__name__)
CORS(app, origins=['*'])

flash_state = {
    'moduleId': None,
    'name': None,
    'emojis': None,
    'ts': None
}
flash_subscribers = []
leaderboard_state = {
    'teams': [],
    'modules': [],
    'currentBroadcastModuleId': None,
    'ts': None
}
leaderboard_subscribers = []
latest_submission = None
submission_subscribers = []

MODULE_LIBRARY = {
    'm1': {'name': 'The Bookbinder', 'context': 'Binary Search on a sorted array', 'expected_time': 'O(log n)', 'expected_space': 'O(1)', 'signals': ['binary', 'mid', 'left', 'right', 'sorted']},
    'm2': {'name': 'The Train Robbery', 'context': 'Sliding Window max sum of subarray size K', 'expected_time': 'O(n)', 'expected_space': 'O(1)', 'signals': ['window', 'sum', 'k', 'max', 'subarray']},
    'm3': {'name': 'The Dishwasher', 'context': 'Reverse an array using stack', 'expected_time': 'O(n)', 'expected_space': 'O(n)', 'signals': ['stack', 'reverse', 'pop', 'append']},
    'm4': {'name': 'The Zipper', 'context': 'Merge two sorted arrays using two pointers', 'expected_time': 'O(n)', 'expected_space': 'O(n)', 'signals': ['merge', 'sorted', 'pointer', 'i', 'j']},
    'm5': {'name': 'The Floating Balloon', 'context': 'Bubble sort implementation', 'expected_time': 'O(n^2)', 'expected_space': 'O(1)', 'signals': ['bubble', 'swap', 'sort', 'for', 'range']},
    'm6': {'name': 'Missing Puzzle Piece', 'context': 'Two Sum using hash map', 'expected_time': 'O(n)', 'expected_space': 'O(n)', 'signals': ['two', 'sum', 'hash', 'dict', 'target']},
    'm7': {'name': 'The Bouncer', 'context': 'Remove duplicates from sorted array', 'expected_time': 'O(n)', 'expected_space': 'O(1)', 'signals': ['duplicate', 'sorted', 'unique']},
    'm8': {'name': 'The Finger Crash', 'context': 'Palindrome check using two pointers', 'expected_time': 'O(n)', 'expected_space': 'O(1)', 'signals': ['palindrome', 'left', 'right', 'string']},
    'm9': {'name': 'Stock Broker Trash', 'context': 'Kadane algorithm max subarray', 'expected_time': 'O(n)', 'expected_space': 'O(1)', 'signals': ['kadane', 'max', 'subarray', 'current', 'sum']},
    'm10': {'name': 'The Masonry Wall', 'context': 'Fibonacci sequence generator', 'expected_time': 'O(n)', 'expected_space': 'O(n)', 'signals': ['fibonacci', 'sequence', 'n', 'append']},
}

submission_log = []

GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_DEFAULT_MODEL = 'llama-3.1-8b-instant'

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

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

    if len(code) > 5000:
        return jsonify({
            'stdout': '',
            'stderr': 'Code too large',
            'exitCode': 1
        })

    with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w', encoding='utf-8') as f:
        f.write(code)
        fname = f.name

    try:
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'
        env['PYTHONUTF8'] = '1'

        result = subprocess.run(
            [sys.executable, fname],
            capture_output=True,
            text=True,
            timeout=5,
            encoding='utf-8',
            env=env
        )
    except subprocess.TimeoutExpired:
        os.unlink(fname)
        return jsonify({
            'stdout': '',
            'stderr': 'TimeoutError: Code took too long',
            'exitCode': 1
        })

    os.unlink(fname)
    return jsonify({
        'stdout': result.stdout,
        'stderr': result.stderr,
        'exitCode': result.returncode
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)