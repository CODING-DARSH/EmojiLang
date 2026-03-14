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