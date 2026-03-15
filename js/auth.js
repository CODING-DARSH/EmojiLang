/**
 * auth.js
 * - Session validation
 * - Tab switch detection → writes to Supabase tab_violations
 * - Auto logout on 3rd switch → creates unlock_request in Supabase
 * - No copy/paste
 * - Round lock detection
 */

(function () {
  const session = JSON.parse(localStorage.getItem('hc_session') || 'null');
  if (!session) { window.location.href = '/login.html'; return; }
  window.HC_SESSION = session;

  const SB_URL = HC_CONFIG.SUPABASE_URL;
  const SB_KEY = HC_CONFIG.SUPABASE_KEY;
  const MAX_SWITCHES = 3;

  let tabSwitchCount = 0;
  let isProcessing   = false;
  let isLocked       = false;

  // ── SUPABASE HELPER ─────────────────────────────────────────────
  async function sb(path, method = 'GET', body = null) {
    const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
      method,
      headers: {
        'apikey':        SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (res.status === 204) return null;
    return res.json();
  }

  // ── DISABLE COPY / PASTE / CUT ──────────────────────────────────
  ['copy','paste','cut'].forEach(evt =>
    document.addEventListener(evt, e => { e.preventDefault(); showNoCopyToast(); })
  );
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && ['c','v','x'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      showNoCopyToast();
    }
  });

  function showNoCopyToast() {
    const id = 'no-copy-toast';
    if (document.getElementById(id)) return;
    const toast = document.createElement('div');
    toast.id = id;
    toast.style.cssText = `
      position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:#ef4444;color:white;padding:10px 20px;border-radius:8px;
      font-family:'Space Mono',monospace;font-size:12px;font-weight:700;
      z-index:99999;white-space:nowrap;animation:fadeIn 0.2s ease;
    `;
    toast.textContent = '🚫 Copy/Paste is not allowed during the challenge!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // ── TAB / WINDOW SWITCH DETECTION ───────────────────────────────
  let lastBlurTime = 0;

  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) {
      lastBlurTime = Date.now();
      await handleTabLeave();
    } else {
      if (tabSwitchCount > 0 && !isLocked) showWarningOverlay();
    }
  });

  window.addEventListener('blur', async () => {
    // Prevent double counting with visibilitychange
    if (Date.now() - lastBlurTime > 500) {
      await handleTabLeave();
    }
  });

  window.addEventListener('focus', () => {
    if (tabSwitchCount > 0 && !isLocked) showWarningOverlay();
  });

  async function handleTabLeave() {
    if (isLocked || isProcessing) return;
    isProcessing   = true;
    tabSwitchCount++;

    try {
      // Upsert into Supabase tab_violations
      const existing = await sb(
        `tab_violations?roll_number=eq.${encodeURIComponent(session.roll)}&select=*`
      );

      const now       = new Date().toLocaleTimeString();
      const willLock  = tabSwitchCount >= MAX_SWITCHES;

      if (existing && existing.length > 0) {
        // Update existing record
        await sb(
          `tab_violations?roll_number=eq.${encodeURIComponent(session.roll)}`,
          'PATCH',
          {
            switch_count:    tabSwitchCount,
            is_locked:       willLock,
            last_switch_at:  now,
          }
        );
      } else {
        // Insert new record
        await sb('tab_violations', 'POST', {
          roll_number:     session.roll,
          team_name:       session.name,
          switch_count:    tabSwitchCount,
          is_locked:       willLock,
          last_switch_at:  now,
        });
      }

      if (willLock) {
        // Create unlock request in Supabase
        await sb('unlock_requests', 'POST', {
          roll_number:  session.roll,
          team_name:    session.name,
          reason:       'tab_switching',
          status:       'pending',
        });

        // Deactivate session
        await sb(
          `sessions?id=eq.${session.sessionId}`,
          'PATCH',
          { is_active: false }
        );

        isLocked = true;
        autoLogout();
      }
    } catch(e) {
      console.error('Tab violation write failed:', e);
    } finally {
      isProcessing = false;
    }
  }

  // ── WARNING OVERLAY ─────────────────────────────────────────────
  function showWarningOverlay() {
    const existing = document.getElementById('tab-warning-overlay');
    if (existing) existing.remove();

    const remaining = MAX_SWITCHES - tabSwitchCount;
    const isSerious = remaining <= 1;

    const overlay   = document.createElement('div');
    overlay.id      = 'tab-warning-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      background:rgba(8,8,16,0.97);backdrop-filter:blur(10px);
      display:flex;align-items:center;justify-content:center;
      font-family:'Space Mono',monospace;
    `;

    overlay.innerHTML = `
      <div style="
        background:#0f0f1a;
        border:2px solid ${isSerious ? '#ef4444' : '#eab308'};
        border-radius:16px;padding:48px;max-width:460px;text-align:center;
        box-shadow:0 0 60px ${isSerious ? 'rgba(239,68,68,0.4)' : 'rgba(234,179,8,0.3)'};
      ">
        <div style="font-size:56px;margin-bottom:16px;">${isSerious ? '🚨' : '⚠️'}</div>
        <div style="font-family:'Syne',sans-serif;font-size:24px;font-weight:900;
          color:${isSerious ? '#ef4444' : '#eab308'};margin-bottom:10px;">
          ${isSerious ? 'Final Warning!' : 'Tab Switch Detected!'}
        </div>
        <div style="font-size:13px;color:#94a3b8;line-height:1.8;margin-bottom:20px;">
          You switched tabs/windows
          <strong style="color:#e2e8f0;">${tabSwitchCount} time${tabSwitchCount !== 1 ? 's' : ''}</strong>.<br/>
          ${isSerious
            ? '<strong style="color:#ef4444;">One more switch and you will be automatically logged out and blocked!</strong>'
            : `You have <strong style="color:#eab308;">${remaining} warning${remaining !== 1 ? 's' : ''}</strong> remaining before auto-logout.`
          }
        </div>
        <div style="
          background:${isSerious ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)'};
          border:1px solid ${isSerious ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'};
          border-radius:8px;padding:10px;font-size:11px;
          color:${isSerious ? '#ef4444' : '#eab308'};margin-bottom:24px;
        ">
          📋 Switch count: ${tabSwitchCount}/${MAX_SWITCHES} — Recorded in admin panel
        </div>
        <button onclick="document.getElementById('tab-warning-overlay').remove()" style="
          background:${isSerious ? '#ef4444' : '#eab308'};
          color:${isSerious ? 'white' : '#000'};
          border:none;padding:14px 32px;border-radius:8px;
          font-family:'Space Mono',monospace;font-size:13px;font-weight:700;
          cursor:pointer;width:100%;
        ">I understand — Back to coding</button>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  // ── AUTO LOGOUT ─────────────────────────────────────────────────
  function autoLogout() {
    // Remove any existing overlays
    const existing = document.getElementById('tab-warning-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99999;
      background:rgba(8,8,16,0.99);backdrop-filter:blur(10px);
      display:flex;align-items:center;justify-content:center;
      font-family:'Space Mono',monospace;
    `;
    overlay.innerHTML = `
      <div style="
        background:#0f0f1a;border:2px solid #ef4444;
        border-radius:16px;padding:48px;max-width:460px;text-align:center;
        box-shadow:0 0 60px rgba(239,68,68,0.5);
      ">
        <div style="font-size:56px;margin-bottom:16px;">🔒</div>
        <div style="font-family:'Syne',sans-serif;font-size:24px;font-weight:900;
          color:#ef4444;margin-bottom:10px;">Auto Logged Out</div>
        <div style="font-size:13px;color:#94a3b8;line-height:1.8;margin-bottom:20px;">
          You were automatically logged out due to
          <strong style="color:#e2e8f0;">repeated tab switching (${MAX_SWITCHES} times)</strong>.<br/><br/>
          Your account is <strong style="color:#ef4444;">blocked</strong>.
          The admin has been notified and must unlock your account before you can login again.
        </div>
        <div style="font-size:11px;color:#475569;margin-bottom:16px;">
          Redirecting to login page in 3 seconds...
        </div>
        <div style="
          background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);
          border-radius:8px;padding:10px;font-size:11px;color:#ef4444;
        ">
          🔔 Admin has been notified automatically
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    localStorage.removeItem('hc_session');
    setTimeout(() => { window.location.href = '/login.html'; }, 3000);
  }

  // ── SESSION & ROUND CHECK ────────────────────────────────────────
  async function checkSession() {
    if (isLocked) return;
    try {
      const sessData = await sb(`sessions?id=eq.${session.sessionId}&select=is_active`);
      if (!sessData || !sessData.length || !sessData[0].is_active) {
        localStorage.removeItem('hc_session');
        alert('Your session was disconnected by the admin.');
        window.location.href = '/login.html';
        return;
      }

      const roundData = await sb('round_control?id=eq.1&select=round_released');
      if (roundData && roundData.length && !roundData[0].round_released) {
        window.location.href = '/waiting.html';
      }
    } catch(e) {}
  }

  setInterval(checkSession, 5000);

})();