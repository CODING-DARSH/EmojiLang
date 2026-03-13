from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess, tempfile, os

app = Flask(__name__)
CORS(app)

@app.route('/run', methods=['POST'])
def run_code():
    code = request.json.get('code', '')
    
    with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w', encoding='utf-8') as f:
        f.write(code)
        fname = f.name
    
    try:
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'        # ← forces print() to use utf-8
        env['PYTHONUTF8'] = '1'                  # ← Python 3.7+ utf-8 mode

        result = subprocess.run(
            ['python', fname],
            capture_output=True,
            text=True,
            timeout=10,
            encoding='utf-8',
            env=env                              # ← pass the env
        )
    except subprocess.TimeoutExpired:
        os.unlink(fname)
        return jsonify({ 'stdout': '', 'stderr': 'TimeoutError: Code took too long to run', 'exitCode': 1 })
    
    os.unlink(fname)
    return jsonify({ 'stdout': result.stdout, 'stderr': result.stderr, 'exitCode': result.returncode })

app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)