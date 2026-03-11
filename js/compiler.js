/**
 * compiler.js
 * Converts EmojiLang source code → Python source code.
 * Also performs static analysis and reports compile errors.
 */

window.EmojiCompiler = (function () {

  // Build sorted replacement table (longest emoji first to avoid partial matches)
  function buildReplacementTable() {
    const tokens = window.EMOJI_LANG.tokens;
    // Sort by emoji length descending so multi-char emoji match before sub-sequences
    return [...tokens]
      .filter(t => t.python !== '')
      .sort((a, b) => [...b.emoji].length - [...a.emoji].length);
  }

  /**
   * Compile EmojiLang source to Python.
   * Returns: { python: string, errors: Array<CompileError>, warnings: Array }
   */
  function compile(source) {
    const errors = [];
    const warnings = [];

    if (!source.trim()) {
      return { python: '', errors: [], warnings: [] };
    }

    const lines = source.split('\n');
    const pythonLines = [];
    const table = buildReplacementTable();

    // Track structural state
    let openBlocks = 0;

    lines.forEach((rawLine, lineIdx) => {
      const lineNum = lineIdx + 1;

      // Preserve blank lines
      if (rawLine.trim() === '') {
        pythonLines.push('');
        return;
      }

      // Detect indentation (spaces/tabs before first non-whitespace)
      const indentMatch = rawLine.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';
      let line = rawLine;

      // ── Apply replacements ──────────────────────────────────────────
      // Replace each emoji token with its Python equivalent
      for (const token of table) {
        // Use a global replace for the emoji
        line = replaceAll(line, token.emoji, ` ${token.python} `);
      }

      // ── Handle 🔚 (end-of-statement) ─────────────────────────────
      // 🔚 just signals end of logical line, remove it
      line = replaceAll(line, ' 🔚 ', ' ');
      line = replaceAll(line, '🔚', '');

      // ── Handle 📞 (function call indicator) ───────────────────────
      // 📞 funcName(...) → just funcName(...), strip the marker
      line = replaceAll(line, ' 📞 ', ' ');
      line = replaceAll(line, '📞', '');

      // ── Handle ➕📋 / 🗑️📋 already in table ────────────────────

      // ── Clean up spacing ───────────────────────────────────────────
      // Collapse multiple spaces into one (but preserve leading indent)
      line = indent + line.trim().replace(/  +/g, ' ');

      // ── Fix colon placement ─────────────────────────────────────────
      // Sometimes colon ends up with spaces: "if x > 0 :" → "if x > 0:"
      line = line.replace(/\s+:/g, ':');

      // ── Fix print/input syntax ─────────────────────────────────────
      // "print "hello"" → "print("hello")"
      line = fixFunctionCall(line, 'print');
      line = fixFunctionCall(line, 'input');
      line = fixFunctionCall(line, 'return');
      line = fixFunctionCall(line, 'int');
      line = fixFunctionCall(line, 'float');
      line = fixFunctionCall(line, 'str');
      line = fixFunctionCall(line, 'len');
      line = fixFunctionCall(line, 'range');
      line = fixFunctionCall(line, 'import');
      line = fixFunctionCall(line, 'abs');
      line = fixFunctionCall(line, 'round');
      line = fixFunctionCall(line, 'sorted');
      line = fixFunctionCall(line, 'max');
      line = fixFunctionCall(line, 'min');
      line = fixFunctionCall(line, 'sum');
      // Fix f-string: 🧵 becomes f" so clean up spacing
      line = line.replace(/f"\s+/g, 'f"');
// Fix dict: remove any accidental spaces inside {}
      line = line.replace(/\{\s+\}/g, '{}');
      // ── Track open blocks ───────────────────────────────────────────
      if (line.trimEnd().endsWith(':')) {
        openBlocks++;
      }

      // ── Static checks ───────────────────────────────────────────────
      const stripped = line.trim();

      // Unmatched quotes
      const quoteCount = (stripped.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        errors.push({
          type: 'SyntaxError',
          message: 'Unmatched quote — did you forget a closing `"`?',
          line: lineNum,
          hint: 'Make sure every opening " has a matching closing ".',
        });
      }

      // Unmatched parentheses
      const openP  = (stripped.match(/\(/g) || []).length;
      const closeP = (stripped.match(/\)/g) || []).length;
      if (openP !== closeP) {
        errors.push({
          type: 'SyntaxError',
          message: `Unmatched parentheses on line ${lineNum}`,
          line: lineNum,
          hint: 'Count your opening ( and closing ) — they must match.',
        });
      }

      // if/elif/else/for/while without colon
      if (/^\s*(if|elif|else|for|while|def)\b/.test(line) && !stripped.endsWith(':')) {
        errors.push({
          type: 'SyntaxError',
          message: `Missing 📌 (colon) after \`${stripped.split(' ')[0]}\``,
          line: lineNum,
          hint: 'Every if/elif/else/for/while/def must end with 📌',
        });
      }

      // def without parentheses
    //   if (/^\s*def\s+\w+\s*[^(]/.test(line)) {
    //     errors.push({
    //       type: 'SyntaxError',
    //       message: `Function definition missing parentheses on line ${lineNum}`,
    //       line: lineNum,
    //       hint: 'Use: 🔧 myFunc(params) 📌',
    //     });
    //   }

      pythonLines.push(line);
    });

    return {
      python: pythonLines.join('\n'),
      errors,
      warnings,
    };
  }

  /**
   * Replaces ALL occurrences of `search` in `str` with `replacement`.
   * Uses a simple loop to handle emoji (which may not work with RegExp).
   */
  function replaceAll(str, search, replacement) {
    if (!str.includes(search)) return str;
    return str.split(search).join(replacement);
  }

  /**
   * Wraps a bare keyword call in parentheses if not already.
   * e.g. "print "hello"" → "print("hello")"
   *      "return x + 1"  → "return(x + 1)"  ← not needed; leave return alone
   */
  function fixFunctionCall(line, keyword) {
    // Don't wrap import or return in parens
    if (keyword === 'import' || keyword === 'return' || keyword === 'keys' || keyword === 'values' || keyword === 'find' || keyword === 'replace' || keyword === 'try' || keyword === 'except' || keyword === 'finally' || keyword === 'raise' || keyword === 'sort' || keyword === 'reverse' || keyword === 'clear' || keyword === 'index' || keyword === 'sorted' || keyword === 'max' || keyword === 'min' || keyword === 'sum' || keyword === 'abs' || keyword === 'round' || keyword === 'join' || keyword === 'strip' || keyword === 'count' || keyword === 'startswith' || keyword === 'endswith' || keyword === 'class' || keyword === 'super') 
        {
        
      return line;
    }

    // Pattern: keyword followed by space and something not starting with (
    const re = new RegExp(`\\b${keyword}\\s+(?!\\()(.+)$`);
    return line.replace(re, (match, args) => {
      return `${keyword}(${args.trim()})`;
    });
  }

  /**
   * Format compile errors into user-friendly messages.
   */
  function formatErrors(errors) {
    return errors.map(e => ({
      ...e,
      display: `[Line ${e.line}] ${e.type}: ${e.message}`,
    }));
  }

  return { compile, formatErrors };

})();