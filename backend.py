# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import subprocess, tempfile, os

# app = Flask(__name__)
# CORS(app)

# @app.route('/run', methods=['POST'])
# def run_code():
#     code = request.json.get('code', '')
    
#     with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w', encoding='utf-8') as f:
#         f.write(code)
#         fname = f.name
    
#     try:
#         env = os.environ.copy()
#         env['PYTHONIOENCODING'] = 'utf-8'        # ← forces print() to use utf-8
#         env['PYTHONUTF8'] = '1'                  # ← Python 3.7+ utf-8 mode

#         result = subprocess.run(
#             ['python', fname],
#             capture_output=True,
#             text=True,
#             timeout=10,
#             encoding='utf-8',
#             env=env                              # ← pass the env
#         )
#     except subprocess.TimeoutExpired:
#         os.unlink(fname)
#         return jsonify({ 'stdout': '', 'stderr': 'TimeoutError: Code took too long to run', 'exitCode': 1 })
    
#     os.unlink(fname)
#     return jsonify({ 'stdout': result.stdout, 'stderr': result.stderr, 'exitCode': result.returncode })

# app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)

# # app.run(port=5000, debug=True)


from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess, tempfile, os

app = Flask(__name__)
CORS(app, origins=['*'])

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

@app.route('/ping')
def ping():
    return 'pong', 200

@app.route('/run', methods=['POST'])
def run_code():
    code = request.json.get('code', '')

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
            ['python', fname],
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

app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)