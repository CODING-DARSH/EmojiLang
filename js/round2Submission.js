/**
 * round2Submission.js
 * Participant workflow for Round 2 autonomous scoring.
 */

window.Round2Submission = (function () {
  const TEAM_STORAGE_KEY = 'aifirst.participant.teamName';
  let activeModuleId = '';

  let teamEl;
  let moduleEl;
  let decodedEl;
  let flashPreviewEl;
  let teamGateEl;
  let teamGateFormEl;
  let teamGateInputEl;
  let teamGateErrorEl;
  let resultEl;
  let submitBtn;
  let hintBtn;

  function init() {
    teamEl = document.getElementById('round2-team');
    moduleEl = document.getElementById('round2-module');
    decodedEl = document.getElementById('round2-decoded');
    flashPreviewEl = document.getElementById('round2-flash-preview');
    teamGateEl = document.getElementById('team-gate');
    teamGateFormEl = document.getElementById('team-gate-form');
    teamGateInputEl = document.getElementById('team-gate-input');
    teamGateErrorEl = document.getElementById('team-gate-error');
    resultEl = document.getElementById('round2-result');
    submitBtn = document.getElementById('round2-submit');
    hintBtn = document.getElementById('round2-hint');

    if (!teamEl || !moduleEl || !decodedEl || !resultEl || !submitBtn || !hintBtn) {
      return;
    }

    const savedTeamName = getInitialTeamName();
    teamEl.value = savedTeamName;
    teamEl.addEventListener('input', () => {
      const normalized = normalizeTeamName(teamEl.value);
      if (normalized) {
        localStorage.setItem(TEAM_STORAGE_KEY, normalized);
      }
    });

    submitBtn.addEventListener('click', submitPatch);
    hintBtn.addEventListener('click', askHint);
    bindTeamGate();
    ensureTeamAccess();

    window.addEventListener('round2:flash', onFlashEvent);
    fetchActiveModule();
  }

  function bindTeamGate() {
    if (!teamGateFormEl || !teamGateInputEl) return;
    teamGateFormEl.addEventListener('submit', (event) => {
      event.preventDefault();
      const teamName = normalizeTeamName(teamGateInputEl.value);
      if (!teamName) {
        if (teamGateErrorEl) {
          teamGateErrorEl.textContent = 'Please enter a valid team name.';
        }
        return;
      }

      localStorage.setItem(TEAM_STORAGE_KEY, teamName);
      teamEl.value = teamName;
      closeTeamGate();
    });
  }

  function ensureTeamAccess() {
    const current = normalizeTeamName(teamEl.value);
    if (current) {
      closeTeamGate();
      return;
    }
    openTeamGate();
  }

  function openTeamGate() {
    if (!teamGateEl) return;
    teamGateEl.classList.add('open');
    if (teamGateErrorEl) {
      teamGateErrorEl.textContent = '';
    }
    if (teamGateInputEl) {
      teamGateInputEl.value = '';
      setTimeout(() => teamGateInputEl.focus(), 0);
    }
  }

  function closeTeamGate() {
    if (!teamGateEl) return;
    teamGateEl.classList.remove('open');
  }

  function getInitialTeamName() {
    const fromQuery = getTeamNameFromQuery();
    if (fromQuery) {
      localStorage.setItem(TEAM_STORAGE_KEY, fromQuery);
      return fromQuery;
    }

    return normalizeTeamName(localStorage.getItem(TEAM_STORAGE_KEY)) || '';
  }

  function getTeamNameFromQuery() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      return normalizeTeamName(params.get('team') || params.get('teamName') || '');
    } catch (_err) {
      return '';
    }
  }

  function normalizeTeamName(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  async function fetchActiveModule() {
    try {
      const response = await fetch('/api/flash/state');
      if (!response.ok) return;
      const data = await response.json();
      onFlashEvent({ detail: (data || {}).state || {} });
    } catch (_err) {
      // Ignore network initialization errors.
    }
  }

  function onFlashEvent(event) {
    const payload = event && event.detail ? event.detail : event;
    if (!payload || !payload.moduleId) return;

    activeModuleId = String(payload.moduleId);
    moduleEl.value = activeModuleId;
    renderFlashedEmoji(payload.emojis);
    setResult('Emoji flashed. Solve and submit your code.');
  }

  function renderFlashedEmoji(emojis) {
    if (!flashPreviewEl) return;

    const emojiTokens = extractEmojiTokens(emojis);
    flashPreviewEl.innerHTML = '';

    if (!emojiTokens.length) {
      return;
    }

    const fragment = document.createDocumentFragment();
    emojiTokens.forEach((emoji, idx) => {
      const pngDataUrl = emojiToPngDataUrl(emoji, 64);
      if (!pngDataUrl) return;

      const img = document.createElement('img');
      img.src = pngDataUrl;
      img.alt = `Flashed emoji ${idx + 1}`;
      img.className = 'round2-flash-emoji-tile';
      fragment.appendChild(img);
    });

    flashPreviewEl.appendChild(fragment);
  }

  function extractEmojiTokens(emojis) {
    const text = String(emojis || '').trim();
    if (!text) return [];
    return text.split(/\s+/).filter(Boolean);
  }

  function emojiToPngDataUrl(emoji, size) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      ctx.clearRect(0, 0, size, size);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.floor(size * 0.8)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.fillText(String(emoji), size / 2, size / 2);

      return canvas.toDataURL('image/png');
    } catch (_err) {
      return '';
    }
  }

  async function submitPatch() {
    const teamName = String(teamEl.value || '').trim();
    const moduleId = String(moduleEl.value || activeModuleId || '').trim();
    const decodedGuess = String(decodedEl.value || '').trim();
    const code = window.EmojiEditor && typeof window.EmojiEditor.getValue === 'function'
      ? window.EmojiEditor.getValue()
      : '';

    if (!teamName) {
      setResult('Team name is required.', true);
      return;
    }
    if (!moduleId) {
      setResult('Wait for emoji flash.', true);
      return;
    }
    if (!code.trim()) {
      setResult('Write code before submitting.', true);
      return;
    }

    lockButtons(true);
    setResult('Submitting patch for autonomous evaluation...');

    try {
      const response = await fetch('/api/round2/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          moduleId,
          inferenceInput: {
            code,
            decodedGuess,
          },
          ts: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const score = data.evaluation.totalScore;
      const bonus = data.firstBloodBonus ? ` + First Blood ${data.firstBloodBonus}` : '';
      setResult(`Scored ${score}${bonus}. Team total: ${data.team.score}. Verdict: ${data.evaluation.verdict.toUpperCase()}`);
      if (window.EmojiUI && typeof window.EmojiUI.showToast === 'function') {
        window.EmojiUI.showToast(`Round 2 score: ${score}${data.firstBloodBonus ? ' +FB' : ''}`, 'success');
      }
    } catch (err) {
      setResult(`Submission failed: ${err.message}`, true);
      if (window.EmojiUI && typeof window.EmojiUI.showToast === 'function') {
        window.EmojiUI.showToast(`Submit failed: ${err.message}`, 'error');
      }
    } finally {
      lockButtons(false);
    }
  }

  async function askHint() {
    const teamName = String(teamEl.value || '').trim();
    const moduleId = String(moduleEl.value || activeModuleId || '').trim();

    if (!teamName) {
      setResult('Team name is required for hint requests.', true);
      return;
    }
    if (!moduleId) {
      setResult('No active module to request a hint for.', true);
      return;
    }

    lockButtons(true);
    setResult('Requesting hint (penalty applies)...');

    try {
      const response = await fetch('/api/round2/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          moduleId,
          ts: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const pingNote = data.adminPinged ? ' Admin notified.' : '';
      setResult(`${data.hint} (-${data.penalty} points). Team total: ${data.team.score}.${pingNote}`);
      if (window.EmojiUI && typeof window.EmojiUI.showToast === 'function') {
        window.EmojiUI.showToast(`Hint used: -${data.penalty} points.${data.adminPinged ? ' Admin pinged.' : ''}`, 'info');
      }
    } catch (err) {
      setResult(`Hint request failed: ${err.message}`, true);
    } finally {
      lockButtons(false);
    }
  }

  function setResult(message, isError) {
    if (!resultEl) return;
    resultEl.textContent = message;
    resultEl.style.color = isError ? 'var(--red)' : 'var(--text2)';
  }

  function lockButtons(isBusy) {
    if (!submitBtn || !hintBtn) return;
    submitBtn.disabled = isBusy;
    hintBtn.disabled = isBusy;
  }

  return { init };
})();
