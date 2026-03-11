/**
 * sidebar.js
 * Renders the emoji reference sidebar with search and click-to-insert.
 */

window.EmojiSidebar = (function () {

  let _listEl   = null;
  let _searchEl = null;
  let _query    = '';

  function init() {
    _listEl   = document.getElementById('emoji-list');
    _searchEl = document.getElementById('emoji-search');

    _searchEl.addEventListener('input', e => {
      _query = e.target.value.toLowerCase().trim();
      render();
    });

    render();
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