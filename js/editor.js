// /**
//  * editor.js
//  * Handles the code editor: line numbers, live Python preview,
//  * keyboard shortcuts, and cursor position tracking.
//  */

// window.EmojiEditor = (function () {

//   let _editorEl    = null;
//   let _lineNumsEl  = null;
//   let _pyPreviewEl = null;
//   let _lineCountEl = null;
//   let _charCountEl = null;
//   let _previewPanel = null;
//   let _toggleBtn   = null;
//   let _previewVisible = true;
//   let _debounceTimer = null;

//   function init() {
//     _editorEl     = document.getElementById('code-editor');
//     _lineNumsEl   = document.getElementById('line-numbers');
//     // _pyPreviewEl  = document.getElementById('python-output-preview');
//     _lineCountEl  = document.getElementById('line-count');
//     _charCountEl  = document.getElementById('char-count');
//     // _previewPanel = document.getElementById('python-preview-panel');
//     // _toggleBtn    = document.getElementById('toggle-preview');

//     _editorEl.addEventListener('input',   onEditorChange);
//     _editorEl.addEventListener('scroll',  syncScroll);
//     _editorEl.addEventListener('keydown', onKeyDown);
//     // _toggleBtn.addEventListener('click',  togglePreview);

//     updateLineNumbers();
//     updateMeta();
//   }

//   // ── Change Handler ─────────────────────────────────────────────────
//   function onEditorChange() {
//     updateLineNumbers();
//     updateMeta();

//     // Debounce the Python preview update (300ms)
//     clearTimeout(_debounceTimer);
//     _debounceTimer = setTimeout(updatePythonPreview, 300);
//   }

//   // ── Line Numbers ───────────────────────────────────────────────────
//   function updateLineNumbers() {
//     const lines = _editorEl.value.split('\n');
//     _lineNumsEl.textContent = lines.map((_, i) => i + 1).join('\n');
//   }

//   // ── Scroll Sync ────────────────────────────────────────────────────
//   function syncScroll() {
//     _lineNumsEl.scrollTop = _editorEl.scrollTop;
//   }

//   // ── Meta (line count / char count) ────────────────────────────────
//   function updateMeta() {
//     const val   = _editorEl.value;
//     const lines = val.split('\n').length;
//     const chars = val.length;
//     _lineCountEl.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
//     _charCountEl.textContent = `${chars} char${chars !== 1 ? 's' : ''}`;
//   }

//   // ── Python Preview ─────────────────────────────────────────────────
//   function updatePythonPreview() {
//     const source = _editorEl.value;
//     if (!source.trim()) {
//       _pyPreviewEl.textContent = '';
//       return;
//     }
//     const { python } = window.EmojiCompiler.compile(source);
//     _pyPreviewEl.textContent = python;
//   }

//   // ── Keyboard Shortcuts ─────────────────────────────────────────────
//   function onKeyDown(e) {
//     // Tab → insert 4 spaces
//     if (e.key === 'Tab') {
//       e.preventDefault();
//       const start = _editorEl.selectionStart;
//       const end   = _editorEl.selectionEnd;
//       const val   = _editorEl.value;
//       _editorEl.value = val.substring(0, start) + '    ' + val.substring(end);
//       _editorEl.selectionStart = _editorEl.selectionEnd = start + 4;
//       onEditorChange();
//     }

//     // Ctrl/Cmd + Enter → Run
//     if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
//       e.preventDefault();
//       document.getElementById('btn-run').click();
//     }

//     // Ctrl/Cmd + / → Toggle comment
//     if ((e.ctrlKey || e.metaKey) && e.key === '/') {
//       e.preventDefault();
//       toggleComment();
//     }

//     // Auto-close quotes
//     if (e.key === '"') {
//       const start = _editorEl.selectionStart;
//       const end   = _editorEl.selectionEnd;
//       if (start === end) {
//         // Check if next char is already closing "
//         if (_editorEl.value[start] === '"') {
//           e.preventDefault();
//           _editorEl.selectionStart = _editorEl.selectionEnd = start + 1;
//         } else {
//           e.preventDefault();
//           insertAtCursor('""');
//           _editorEl.selectionStart = _editorEl.selectionEnd = start + 1;
//         }
//       }
//     }
//   }

//   function toggleComment() {
//     const start = _editorEl.selectionStart;
//     const val   = _editorEl.value;
//     // Find start of current line
//     const lineStart = val.lastIndexOf('\n', start - 1) + 1;
//     const line = val.substring(lineStart, val.indexOf('\n', lineStart) >>> 0 || val.length);

//     if (line.trimStart().startsWith('#️⃣')) {
//       // Remove comment
//       const newLine = line.replace(/^(\s*)#️⃣\s?/, '$1');
//       _editorEl.value = val.substring(0, lineStart) + newLine + val.substring(lineStart + line.length);
//     } else {
//       // Add comment
//       const newLine = line.replace(/^(\s*)/, '$1#️⃣ ');
//       _editorEl.value = val.substring(0, lineStart) + newLine + val.substring(lineStart + line.length);
//     }
//     onEditorChange();
//   }

//   function insertAtCursor(text) {
//     const start = _editorEl.selectionStart;
//     const end   = _editorEl.selectionEnd;
//     const val   = _editorEl.value;
//     _editorEl.value = val.substring(0, start) + text + val.substring(end);
//     _editorEl.selectionStart = _editorEl.selectionEnd = start + text.length;
//   }

//   // ── Insert Emoji at Cursor ─────────────────────────────────────────
//   function insertEmoji(emoji) {
//     _editorEl.focus();
//     insertAtCursor(emoji + ' ');
//     onEditorChange();
//   }

//   // ── Get / Set Value ───────────────────────────────────────────────
//   function getValue() {
//     return _editorEl.value;
//   }

//   function setValue(code) {
//     _editorEl.value = code;
//     onEditorChange();
//   }

//   function clear() {
//     _editorEl.value = '';
//     onEditorChange();
//   }

//   // ── Preview Toggle ─────────────────────────────────────────────────
//   function togglePreview() {
//     _previewVisible = !_previewVisible;
//     if (_previewVisible) {
//       _previewPanel.classList.remove('collapsed');
//       _toggleBtn.textContent = '▲ Hide';
//     } else {
//       _previewPanel.classList.add('collapsed');
//       _toggleBtn.textContent = '▼ Show';
//     }
//   }

//   return { init, getValue, setValue, clear, insertEmoji };

// })();


/**
 * editor.js
 * Handles the code editor: line numbers, keyboard shortcuts.
 */

window.EmojiEditor = (function () {

  let _editorEl    = null;
  let _lineNumsEl  = null;
  let _lineCountEl = null;
  let _charCountEl = null;
  let _debounceTimer = null;

  function init() {
    _editorEl     = document.getElementById('code-editor');
    _lineNumsEl   = document.getElementById('line-numbers');
    _lineCountEl  = document.getElementById('line-count');
    _charCountEl  = document.getElementById('char-count');

    _editorEl.addEventListener('input',   onEditorChange);
    _editorEl.addEventListener('scroll',  syncScroll);
    _editorEl.addEventListener('keydown', onKeyDown);

    updateLineNumbers();
    updateMeta();
  }

  function onEditorChange() {
    updateLineNumbers();
    updateMeta();
  }

  function updateLineNumbers() {
    const lines = _editorEl.value.split('\n');
    _lineNumsEl.textContent = lines.map((_, i) => i + 1).join('\n');
  }

  function syncScroll() {
    _lineNumsEl.scrollTop = _editorEl.scrollTop;
  }

  function updateMeta() {
    const val   = _editorEl.value;
    const lines = val.split('\n').length;
    const chars = val.length;
    _lineCountEl.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
    _charCountEl.textContent = `${chars} char${chars !== 1 ? 's' : ''}`;
  }

  function onKeyDown(e) {
    // Tab → insert 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = _editorEl.selectionStart;
      const end   = _editorEl.selectionEnd;
      const val   = _editorEl.value;
      _editorEl.value = val.substring(0, start) + '    ' + val.substring(end);
      _editorEl.selectionStart = _editorEl.selectionEnd = start + 4;
      onEditorChange();
    }

    // Ctrl/Cmd + Enter → Run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('btn-run').click();
    }
  }

  function insertAtCursor(text) {
    _editorEl.focus();
    const start = _editorEl.selectionStart;
    const end   = _editorEl.selectionEnd;
    const val   = _editorEl.value;
    _editorEl.value = val.substring(0, start) + text + val.substring(end);
    _editorEl.selectionStart = _editorEl.selectionEnd = start + text.length;
    onEditorChange();
  }

  function insertEmoji(emoji) {
    insertAtCursor(emoji + ' ');
  }

  function getValue() {
    return _editorEl.value;
  }

  function setValue(code) {
    _editorEl.value = code;
    onEditorChange();
  }

  function clear() {
    _editorEl.value = '';
    onEditorChange();
  }

  return { init, getValue, setValue, clear, insertEmoji };

})();