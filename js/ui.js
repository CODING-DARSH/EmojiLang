/**
 * ui.js
 * Output rendering, toast notifications, status badges, and docs panel.
 */

window.EmojiUI = (function () {

  // ── ELEMENTS ───────────────────────────────────────────────────────
  let _outputBody   = null;
  let _outputStatus = null;
  let _toastCont    = null;
  let _docsPanel    = null;
  let _docsCont     = null;

  function init() {
    _outputBody   = document.getElementById('output-body');
    _outputStatus = document.getElementById('output-status');
    _toastCont    = document.getElementById('toast-container');
    _docsPanel    = document.getElementById('docs-panel');
    _docsCont     = document.getElementById('docs-content');

    buildDocs();
  }

  // ── STATUS ─────────────────────────────────────────────────────────
  function setStatus(type) {
    _outputStatus.className = '';
    if (type === 'running') {
      _outputStatus.className = 'output-status status-running';
      _outputStatus.innerHTML = '<span class="spinner"></span> Running...';
    } else if (type === 'success') {
      _outputStatus.className = 'output-status status-success';
      _outputStatus.innerHTML = '✓ Success';
    } else if (type === 'error') {
      _outputStatus.className = 'output-status status-error';
      _outputStatus.innerHTML = '✕ Error';
    } else {
      _outputStatus.innerHTML = '';
    }
  }

  // ── OUTPUT STATES ──────────────────────────────────────────────────
  function showRunning() {
    setStatus('running');
    _outputBody.innerHTML = `
      <div class="running-indicator">
        <span class="spinner"></span>
        <span>Executing your code...</span>
      </div>
    `;
  }

  function showWelcome() {
    setStatus('');
    _outputBody.innerHTML = `
      <div class="output-welcome">
        <div class="welcome-icon">🚀</div>
        <div class="welcome-title">Ready to Run</div>
        <div class="welcome-sub">Write emoji code on the left, hit <strong>Run Code</strong> to execute</div>
      </div>
    `;
  }

  /**
   * Render compile errors (before the code is even sent to the API).
   */
  function highlightEditorLine(lineNum) {
  const editor = document.getElementById('code-editor');
  const lines = editor.value.split('\n');
  let pos = 0;
  for (let i = 0; i < lineNum - 1; i++) {
    pos += lines[i].length + 1;
  }
  editor.focus();
  editor.setSelectionRange(pos, pos + lines[lineNum - 1].length);
}
  function showCompileErrors(errors) {
    setStatus('error');
    _outputBody.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'output-block';
    header.innerHTML = `
      <div class="output-block-header" style="color: var(--red);">
        🚨 Compile Errors — Fix these before running
      </div>
    `;
    _outputBody.appendChild(header);

    errors.forEach(err => {
        if (err.line) highlightEditorLine(err.line);
        const block = document.createElement('div');  
      block.className = 'compile-error-block';
      block.innerHTML = `
        <div class="error-block-header">
          🔴 ${err.type || 'SyntaxError'}
          <span class="error-type">Line ${err.line}</span>
        </div>
        <div class="error-body">
          <div class="error-message">${escHtml(err.message)}</div>
          <div class="error-location">📍 Emoji Line ${err.line} — check your editor, the line is highlighted</div>
          ${err.hint ? `<div class="error-hint">${escHtml(err.hint)}</div>` : ''}
        </div>
      `;
      _outputBody.appendChild(block);
    });
  }


  /**
   * Render a successful run result.
   */
  function showSuccess(result) {
    setStatus('success');
    _outputBody.innerHTML = '';

    // Success meta bar
    const meta = document.createElement('div');
    meta.className = 'output-block';
    meta.innerHTML = `
      <div class="success-meta">
        ✅ Program exited with code 0
        <span class="exec-time">⏱ ${result.execTimeMs || result.wallTimeMs || 0}ms</span>
      </div>
    `;
    _outputBody.appendChild(meta);

    // stdout
    if (result.stdout && result.stdout.trim()) {
      const block = document.createElement('div');
      block.className = 'output-block';
      block.innerHTML = `
        <div class="output-block-header">📤 stdout</div>
        <div class="output-stdout">${escHtml(result.stdout)}</div>
      `;
      _outputBody.appendChild(block);
    } else {
      const block = document.createElement('div');
      block.className = 'output-block';
      block.innerHTML = `
        <div class="output-stdout" style="color: var(--muted); font-style: italic;">
          (no output)
        </div>
      `;
      _outputBody.appendChild(block);
    }
  }

  /**
   * Render a runtime error result.
   */
  function showRuntimeError(result) {
    setStatus('error');
    _outputBody.innerHTML = '';

    // Any stdout before the crash
    if (result.stdout && result.stdout.trim()) {
      const block = document.createElement('div');
      block.className = 'output-block';
      block.innerHTML = `
        <div class="output-block-header">📤 stdout (before error)</div>
        <div class="output-stdout">${escHtml(result.stdout)}</div>
      `;
      _outputBody.appendChild(block);
    }

    // Error block
    const err = result.error || {};
    const block = document.createElement('div');
    block.className = 'error-block';
    block.innerHTML = `
      <div class="error-block-header">
        💥 Runtime Error
        <span class="error-type">${escHtml(err.type || 'Error')}</span>
      </div>
      <div class="error-body">
        <div class="error-message">${escHtml(err.message || 'An error occurred')}</div>
        ${err.line ? `<div class="error-location">📍 Line ${err.line}</div>` : ''}
        ${result.stderr ? `<div class="output-stdout" style="color:var(--red);font-size:11px;margin-top:8px;">${escHtml(result.stderr)}</div>` : ''}
        ${err.hint ? `<div class="error-hint">${escHtml(err.hint)}</div>` : ''}
      </div>
    `;
    _outputBody.appendChild(block);
  }

  /**
   * Render an unexpected API/network error.
   */
  function showFatalError(message) {
    setStatus('error');
    _outputBody.innerHTML = `
      <div class="error-block" style="margin: 12px;">
        <div class="error-block-header">
          🌐 API Error
        </div>
        <div class="error-body">
          <div class="error-message">${escHtml(message)}</div>
          <div class="error-hint">Check your network connection and try again.</div>
        </div>
      </div>
    `;
  }

  // ── TOAST ──────────────────────────────────────────────────────────
  function showToast(message, type = 'info', duration = 2500) {
    const toast = document.createElement('div');
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${escHtml(message)}`;
    _toastCont.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ── DOCS ───────────────────────────────────────────────────────────
  function buildDocs() {
    const { tokens, groups } = window.EMOJI_LANG;

    let html = `
      <h1>EmojiLang 🌀 Documentation</h1>
      <p class="docs-sub">A fun programming language where every keyword is an emoji. Under the hood, your code compiles to Python.</p>
    `;

    groups.forEach(group => {
      const groupTokens = tokens.filter(t => t.group === group.id);
      if (!groupTokens.length) return;

      html += `<h2>${group.label}</h2>`;
      html += `
        <table class="docs-table">
          <thead>
            <tr>
              <th>Emoji</th>
              <th>Python</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            ${groupTokens.map(t => `
              <tr>
                <td class="em-cell">${t.emoji}</td>
                <td class="kw-cell">${escHtml(t.python) || '—'}</td>
                <td>${escHtml(t.desc)}</td>
                <td class="ex-cell">${escHtml(t.example)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    });

    html += `
      <h2>📝 Code Examples</h2>
      <p>Here are some full programs written in EmojiLang:</p>
    `;

    const exs = window.EMOJI_LANG.examples;
    Object.entries(exs).forEach(([key, code]) => {
      html += `<div class="docs-code-block">${escHtml(code)}</div>`;
    });

    _docsCont.innerHTML = html;
  }

  function toggleDocs(show) {
    if (show) {
      _docsPanel.classList.remove('hidden');
    } else {
      _docsPanel.classList.add('hidden');
    }
  }

  // ── UTILS ──────────────────────────────────────────────────────────
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    init,
    showRunning,
    showWelcome,
    showCompileErrors,
    showSuccess,
    showRuntimeError,
    showFatalError,
    showToast,
    toggleDocs,
  };

})();