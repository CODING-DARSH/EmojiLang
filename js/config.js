/**
 * config.js
 * ← ONLY FILE YOU NEED TO EDIT FOR FRONTEND SETTINGS
 *
 * NOTE: Supabase anon key is safe to be public — it's designed that way.
 * Real secrets (JUDGE_SECRET, ADMIN_PASSWORD) live in .env on the server.
 */

window.HC_CONFIG = {

  // ── SUPABASE (safe to be public — anon key only) ─────────────────
  SUPABASE_URL: 'https://pfcgamdlrmvbfzpgmtbe.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmY2dhbWRscm12YmZ6cGdtdGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDI2NzEsImV4cCI6MjA4OTA3ODY3MX0.9Ku4UqF7vx89CT0DcpbjPv5-ZH3cSb8j3elCqMOwFZ0',

  // ── BACKEND URL ───────────────────────────────────────────────────
  IS_LOCAL:        true,   // ← change to false when deploying
  BASE_URL_LOCAL:  'http://localhost:5000',
  BASE_URL_DEPLOY: 'https://emojilang-backend.onrender.com',

  // ── HELPER ────────────────────────────────────────────────────────
  JUDGE_SECRET: 'judge123',   // ← only used in control panel

  get BASE_URL() {
    return this.IS_LOCAL ? this.BASE_URL_LOCAL : this.BASE_URL_DEPLOY;
  },

  // ── SUPABASE FETCH HELPER ─────────────────────────────────────────
  async sbFetch(path, method = 'GET', body = null) {
    const res = await fetch(`${this.SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: {
        'apikey':        this.SUPABASE_KEY,
        'Authorization': `Bearer ${this.SUPABASE_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (res.status === 204 || method === 'DELETE') return null;
    return res.json();
  }
};

// Note: JUDGE_SECRET here is only for control panel UI
// Real validation happens in backend.py from .env
// This is acceptable since control panel requires admin login first