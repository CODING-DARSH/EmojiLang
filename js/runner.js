// /**
//  * runner.js
//  * Executes Python code by sending it to the Anthropic API.
//  * The API simulates Python execution and returns stdout/stderr.
//  */

// window.EmojiRunner = (function () {


//   const SYSTEM_PROMPT = `You are a Python interpreter / execution engine.

// When given Python source code, you must:
// 1. Execute it mentally, step by step.
// 2. Return ONLY a JSON object (no markdown, no explanation, no code fences) with this exact structure:

// {
//   "stdout": "<everything that would be printed to stdout>",
//   "stderr": "",
//   "error": null,
//   "exitCode": 0,
//   "execTimeMs": <realistic number>
// }

// If there is a runtime error (e.g. ZeroDivisionError, NameError, TypeError, etc):
// {
//   "stdout": "<any output before the error>",
//   "stderr": "Traceback (most recent call last):\n  File \"main.py\", line N, in <module>\n    <the line that caused it>\nErrorType: Error message here",
//   "error": {
//     "type": "ZeroDivisionError",
//     "message": "division by zero",
//     "line": 5,
//     "hint": "You cannot divide by zero. Check your divisor."
//   },
//   "exitCode": 1,
//   "execTimeMs": <number>
// }

// Rules:
// - stdout is the EXACT output the program would produce (with real newlines as \\n)
// - stderr contains the full Python traceback string for errors
// - error is null if no error, otherwise an object with type, message, line number, hint
// - exitCode is 0 for success, 1 for error
// - execTimeMs is a realistic execution time in milliseconds (1-200)
// - NEVER include markdown fences, NEVER include explanation outside the JSON
// - Simulate input() calls with a placeholder like "user_input_placeholder"
// - For infinite loops, simulate 3 iterations then say "...loop truncated"`;

//   /**
//    * Run Python source code via the Anthropic API.
//    * Returns a Promise resolving to a RunResult object.
//    */
//   async function run(pythonCode) {
//     const startTime = Date.now();

//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: MODEL,
//         max_tokens: 1000,
//         system: SYSTEM_PROMPT,
//         messages: [
//           {
//             role: 'user',
//             content: `Execute this Python code:\n\n\`\`\`python\n${pythonCode}\n\`\`\``,
//           },
//         ],
//       }),
//     });

//     if (!response.ok) {
//       const errBody = await response.text();
//       throw new Error(`API error ${response.status}: ${errBody}`);
//     }

//     const data = await response.json();
//     const rawText = data.content
//       .filter(b => b.type === 'text')
//       .map(b => b.text)
//       .join('');

//     // Parse the JSON result
//     let result;
//     try {
//       // Strip any accidental markdown fences
//       const cleaned = rawText
//         .replace(/```json\n?/gi, '')
//         .replace(/```\n?/g, '')
//         .trim();
//       result = JSON.parse(cleaned);
//     } catch (e) {
//       // If parsing fails, treat it as a raw stdout response
//       result = {
//         stdout: rawText,
//         stderr: '',
//         error: null,
//         exitCode: 0,
//         execTimeMs: Date.now() - startTime,
//       };
//     }

//     result.wallTimeMs = Date.now() - startTime;
//     return result;
//   }

//   return { run };

// })();

/**
 * runner.js
 * Executes Python code using the FREE Piston API.
 * No API key needed. Actually runs real Python.
 * https://github.com/engineer-man/piston
 */

/**
 * runner.js
 * Executes Python code using the Piston API (free, no auth needed).
 * https://github.com/engineer-man/piston
 */

/**
 * runner.js
 * Executes Python code using Judge0 CE (free, no auth needed for basic use).
 * https://ce.judge0.com
 */

window.EmojiRunner = (function () {

  const SUBMIT_URL = 'https://emojilang-backend.onrender.com';
  const PYTHON_ID  = 71; // Python 3.8.1 on Judge0

  /**
   * Run Python source code via Judge0 CE API.
   */
async function run(pythonCode) {
  const startTime = Date.now();

  const response = await fetch(SUBMIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: pythonCode }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Backend error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const wallTimeMs = Date.now() - startTime;
  const exitCode = data.exitCode ?? 0;

  let error = null;
  if (exitCode !== 0 && data.stderr) {
    error = parseTraceback(data.stderr);
  }

  return {
    stdout: data.stdout || '',
    stderr: data.stderr || '',
    error,
    exitCode,
    execTimeMs: wallTimeMs,
    wallTimeMs,
  };
}

  function parseTraceback(stderr, statusId, statusDesc) {
    const lines    = stderr.trim().split('\n');
    const lastLine = lines[lines.length - 1] || '';
    const match    = lastLine.match(/^(\w+(?:Error|Exception)?)\s*:\s*(.+)$/);
    const type     = match ? match[1] : (statusDesc || 'RuntimeError');
    const message  = match ? match[2] : lastLine;

    let lineNum = null;
    for (const l of lines) {
      const m = l.match(/line (\d+)/);
      if (m) lineNum = parseInt(m[1]);
    }

    return { type, message, line: lineNum, hint: getHint(type) };
  }

  function getHint(type) {
    const hints = {
      ZeroDivisionError:   'You are dividing by zero — make sure your divisor is never 0.',
      NameError:           'Variable not defined yet. Check spelling or define it first.',
      TypeError:           'Wrong types mixed. Use 💬 to convert to string, 🔢➡️ for int.',
      IndexError:          'List index out of range. Check list length with 📏.',
      ValueError:          'Wrong value passed to a function. Check what you are converting.',
      SyntaxError:         'Invalid syntax. Check for missing 📌 colons or brackets.',
      IndentationError:    'Indentation error. Use exactly 4 spaces inside every block.',
      AttributeError:      'Method or property does not exist on this object.',
      KeyError:            'Dictionary key does not exist.',
      RecursionError:      'Function is calling itself infinitely.',
      ModuleNotFoundError: 'This module is not available in the sandbox.',
    };
    return hints[type] || 'Check the line number and review your logic.';
  }

  return { run };

})();