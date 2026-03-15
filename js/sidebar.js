/**
 * sidebar.js
 * Renders the emoji reference sidebar with search and click-to-insert.
 */

window.EmojiSidebar = (function () {

  let _listEl   = null;
  let _searchEl = null;
  let _sidebarEl = null;
  let _minimizeBtn = null;
  let _flashBtn = null;
  let _cornerBtns = [];
  let _query    = '';
  let _state = {
    minimized: false,
    corner: 'top-left',
  };

  function init() {
    _sidebarEl = document.getElementById('sidebar');
    _listEl   = document.getElementById('emoji-list');
    _searchEl = document.getElementById('emoji-search');
    _minimizeBtn = document.getElementById('emoji-minimize');
    _flashBtn = document.getElementById('emoji-flash');
    _cornerBtns = Array.from(document.querySelectorAll('.sidebar-corner'));

    _searchEl.addEventListener('input', e => {
      _query = e.target.value.toLowerCase().trim();
      render();
    });

    bindControls();
    applyOverlayState();

    render();
  }

  function bindControls() {
    if (_minimizeBtn) {
      _minimizeBtn.addEventListener('click', () => {
        _state.minimized = !_state.minimized;
        applyOverlayState();
      });
    }

    if (_flashBtn) {
      _flashBtn.addEventListener('click', () => {
        _state.minimized = false;
        applyOverlayState();
        if (_searchEl) {
          _searchEl.focus();
          _searchEl.select();
        }
      });
    }

    _cornerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        _state.corner = btn.dataset.corner || 'top-left';
        _state.minimized = true;
        applyOverlayState();
      });
    });
  }

  function applyOverlayState() {
    if (!_sidebarEl) return;

    _sidebarEl.classList.toggle('is-minimized', _state.minimized);
    _sidebarEl.classList.remove('corner-top-left', 'corner-top-right', 'corner-bottom-left', 'corner-bottom-right');
    _sidebarEl.classList.add(`corner-${_state.corner}`);

    _cornerBtns.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.corner === _state.corner);
    });

    if (_minimizeBtn) {
      _minimizeBtn.textContent = _state.minimized ? '□' : '_';
      _minimizeBtn.title = _state.minimized ? 'Expand reference' : 'Minimize reference';
    }
  }

  function render() {
    const { tokens, groups } = window.EMOJI_LANG;
    _listEl.innerHTML = '';

    // Filter tokens
    const filtered = _query
      ? tokens.filter(t =>
          t.emoji.includes(_query) ||
          t.desc.toLowerCase().includes(_query) ||
          t.python.toLowerCase().includes(_query)
        )
      : tokens;

    if (filtered.length === 0) {
      const el = document.createElement('div');
      el.className = 'emoji-item no-result';
      el.textContent = `No results for "${_query}"`;
      _listEl.appendChild(el);
      return;
    }

    if (_query) {
      // Flat list when searching
      filtered.forEach(token => _listEl.appendChild(makeItem(token)));
    } else {
      // Grouped when browsing
      groups.forEach(group => {
        const groupTokens = tokens.filter(t => t.group === group.id);
        if (groupTokens.length === 0) return;

        const label = document.createElement('div');
        label.className = 'emoji-group-label';
        label.textContent = group.label;
        _listEl.appendChild(label);

        groupTokens.forEach(token => _listEl.appendChild(makeItem(token)));
      });
    }
  }

  function makeItem(token) {
    const el = document.createElement('div');
    el.className = 'emoji-item';
    el.title = `Click to insert "${token.emoji}" → Example: ${token.example}`;

    el.innerHTML = `
      <span class="em">${token.emoji}</span>
      <div class="info">
        <div class="kw">${token.python || token.desc}</div>
        <div class="desc">${token.desc}</div>
      </div>
      <span class="insert-chip">insert</span>
    `;

    el.addEventListener('click', () => {
      window.EmojiEditor.insertEmoji(token.emoji);
      window.EmojiUI.showToast(`Inserted ${token.emoji}`, 'info', 1200);
    });

    return el;
  }

  return { init };

})();