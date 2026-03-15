/**
 * flashSync.js
 * Participant auto-listener for admin flash events.
 */

(function () {
  let _lastTs = null;

  document.addEventListener('DOMContentLoaded', () => {
    connectFlashStream();
    fetchInitialState();
  });

  function connectFlashStream() {
    let stream = null;
    try {
      stream = new EventSource('/api/flash/events');
    } catch (err) {
      notify(`Live sync unavailable: ${err.message}`, 'error');
      return;
    }

    stream.onmessage = (event) => {
      if (!event || !event.data) return;
      let payload = null;
      try {
        payload = JSON.parse(event.data);
      } catch (_err) {
        return;
      }
      handleFlash(payload);
    };

    stream.onerror = () => {
      notify('Live sync interrupted. Reconnecting...', 'info');
    };
  }

  async function fetchInitialState() {
    try {
      const response = await fetch('/api/flash/state');
      if (!response.ok) return;
      const data = await response.json();
      handleFlash((data || {}).state || {});
    } catch (_err) {
      // Silent: SSE may still connect and recover.
    }
  }

  function handleFlash(state) {
    if (!state || !state.moduleId) return;
    if (_lastTs && state.ts && _lastTs === state.ts) return;

    _lastTs = state.ts || String(Date.now());

    window.dispatchEvent(new CustomEvent('round2:flash', { detail: state }));

    showOverlay(state);
    notify('Emoji flash received', 'success');

    if (window.EmojiUI && typeof window.EmojiUI.showToast === 'function') {
      window.EmojiUI.showToast('New emoji flash received', 'info', 3500);
    }
  }

  function showOverlay(state) {
    let overlay = document.getElementById('flash-sync-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'flash-sync-overlay';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.background = 'rgba(8, 8, 16, 0.92)';
      overlay.style.zIndex = '9998';
      overlay.style.display = 'none';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.padding = '20px';
      overlay.style.textAlign = 'center';
      overlay.innerHTML = [
        '<div style="max-width:760px;width:100%;border:1px solid rgba(6,182,212,0.45);border-radius:16px;padding:28px;background:rgba(15,15,26,0.95);box-shadow:0 0 30px rgba(6,182,212,0.18)">',
        '  <div style="font-family:Syne,sans-serif;font-size:24px;letter-spacing:1px;color:#06b6d4;margin-bottom:8px">NEW EMOJI FLASHED</div>',
        '  <div id="flash-sync-emojis" style="font-size:62px;line-height:1.2;margin:14px 0"></div>',
        '  <div style="font-family:Space Mono,monospace;font-size:14px;color:#94a3b8;margin-bottom:18px">Capture the pattern and solve.</div>',
        '  <button id="flash-sync-close" type="button" style="border:none;border-radius:8px;padding:10px 16px;font-weight:700;background:#06b6d4;color:#061017;cursor:pointer">Start Solving</button>',
        '</div>'
      ].join('');
      document.body.appendChild(overlay);
      document.getElementById('flash-sync-close').addEventListener('click', () => {
        overlay.style.display = 'none';
      });
    }

    const emojisEl = document.getElementById('flash-sync-emojis');
    emojisEl.textContent = state.emojis || '❓ ❓ ❓';

    overlay.style.display = 'flex';
  }

  function notify(message, level) {
    if (window.console && typeof window.console.log === 'function') {
      const tag = level ? `[flash-sync:${level}]` : '[flash-sync]';
      console.log(`${tag} ${message}`);
    }
  }
})();
