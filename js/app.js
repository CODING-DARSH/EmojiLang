// /**
//  * app.js
//  * Main entry point. Wires together all modules and handles
//  * top-level events (Run, Clear, Examples, Tabs).
//  */

// (function () {

//   // ── INIT ───────────────────────────────────────────────────────────
//   document.addEventListener('DOMContentLoaded', () => {
//     window.EmojiEditor.init();
//     window.EmojiSidebar.init();
//     window.EmojiUI.init();

//     bindButtons();
//     bindTabs();

//     // Load hello world on first open
//     loadExample('helloWorld');
//   });

//   // ── BUTTONS ────────────────────────────────────────────────────────
//   function bindButtons() {
//     document.getElementById('btn-run').addEventListener('click', runCode);
//     document.getElementById('btn-clear').addEventListener('click', clearEditor);
//     document.getElementById('btn-example').addEventListener('click', showExamplePicker);
//   }

//   // ── TABS ───────────────────────────────────────────────────────────
//   function bindTabs() {
//     document.querySelectorAll('.tab').forEach(tab => {
//       tab.addEventListener('click', () => {
//         const target = tab.dataset.tab;
//         document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
//         tab.classList.add('active');

//         if (target === 'docs') {
//           window.EmojiUI.toggleDocs(true);
//         } else {
//           window.EmojiUI.toggleDocs(false);
//         }
//       });
//     });
//   }

//   // ── RUN ────────────────────────────────────────────────────────────
//   async function runCode() {
//     const source = window.EmojiEditor.getValue().trim();

//     if (!source) {
//       window.EmojiUI.showToast('Write some emoji code first! 🖊️', 'error');
//       return;
//     }

//     // Step 1: Compile emoji → Python
//     const { python, errors } = window.EmojiCompiler.compile(source);

//     // Step 2: Show compile errors if any
//     if (errors.length > 0) {
//       window.EmojiUI.showCompileErrors(errors);
//       window.EmojiUI.showToast(`${errors.length} compile error${errors.length > 1 ? 's' : ''} found`, 'error');
//       return;
//     }

//     // Step 3: Run via API
//     const runBtn = document.getElementById('btn-run');
//     runBtn.disabled = true;
//     window.EmojiUI.showRunning();

//     try {
//       const result = await window.EmojiRunner.run(python);

//       if (result.exitCode === 0 && !result.error) {
//         window.EmojiUI.showSuccess(result);
//         window.EmojiUI.showToast('Ran successfully ✓', 'success');
//       } else {
//         window.EmojiUI.showRuntimeError(result);
//         window.EmojiUI.showToast('Runtime error 💥', 'error');
//       }
//     } catch (err) {
//       window.EmojiUI.showFatalError(err.message || 'Unknown error');
//       window.EmojiUI.showToast('API error — check console', 'error');
//       console.error('[EmojiLang] Fatal error:', err);
//     } finally {
//       runBtn.disabled = false;
//     }
//   }

//   // ── CLEAR ──────────────────────────────────────────────────────────
//   function clearEditor() {
//     if (window.EmojiEditor.getValue().trim() === '') return;
//     if (confirm('Clear the editor? This cannot be undone.')) {
//       window.EmojiEditor.clear();
//       window.EmojiUI.showWelcome();
//       window.EmojiUI.showToast('Editor cleared', 'info');
//     }
//   }

//   // ── EXAMPLES ──────────────────────────────────────────────────────
//   function showExamplePicker() {
//     const examples = window.EMOJI_LANG.examples;
//     const names = Object.keys(examples);
//     const labels = {
//       helloWorld: '👋 Hello World',
//       variables:  '📦 Variables & Math',
//       ifElse:     '🤔 If / Else',
//       loop:       '🔁 For & While Loop',
//       function:   '🔧 Functions',
//       fizzbuzz:   '🎯 FizzBuzz',
//     };

//     // Simple inline picker using a floating menu
//     const existing = document.getElementById('example-picker');
//     if (existing) { existing.remove(); return; }

//     const btn = document.getElementById('btn-example');
//     const rect = btn.getBoundingClientRect();

//     const menu = document.createElement('div');
//     menu.id = 'example-picker';
//     menu.style.cssText = `
//       position: fixed;
//       top: ${rect.bottom + 6}px;
//       right: ${window.innerWidth - rect.right}px;
//       background: var(--surface2);
//       border: 1px solid var(--border2);
//       border-radius: var(--radius-lg);
//       padding: 6px;
//       z-index: 9000;
//       min-width: 200px;
//       box-shadow: var(--shadow);
//     `;

//     names.forEach(key => {
//       const item = document.createElement('button');
//       item.style.cssText = `
//         display: block;
//         width: 100%;
//         text-align: left;
//         padding: 8px 12px;
//         border-radius: var(--radius);
//         font-family: var(--font-mono);
//         font-size: 12px;
//         color: var(--text);
//         transition: background 0.15s;
//         cursor: pointer;
//         background: none;
//         border: none;
//       `;
//       item.textContent = labels[key] || key;
//       item.addEventListener('mouseenter', () => item.style.background = 'var(--surface3)');
//       item.addEventListener('mouseleave', () => item.style.background = 'none');
//       item.addEventListener('click', () => {
//         loadExample(key);
//         menu.remove();
//         window.EmojiUI.showToast(`Loaded: ${labels[key]}`, 'success');
//       });
//       menu.appendChild(item);
//     });

//     document.body.appendChild(menu);
//     document.addEventListener('click', function closeMenu(e) {
//       if (!menu.contains(e.target) && e.target !== btn) {
//         menu.remove();
//         document.removeEventListener('click', closeMenu);
//       }
//     }, { capture: true });
//   }

//   function loadExample(key) {
//     const code = window.EMOJI_LANG.examples[key];
//     if (code) {
//       window.EmojiEditor.setValue(code);
//       window.EmojiUI.showWelcome();
//     }
//   }

// })();


/**
 * app.js
 * Main entry point. Wires together all modules.
 */

(function () {

  document.addEventListener('DOMContentLoaded', () => {
    window.EmojiEditor.init();
    window.EmojiSidebar.init();
    window.EmojiUI.init();
<<<<<<< HEAD
    window.EmojiParticipant.init();
=======
    if (window.Round2Submission && typeof window.Round2Submission.init === 'function') {
      window.Round2Submission.init();
    }
>>>>>>> f5da7e110be300249f54d955627ebfcc15bf175f

    bindButtons();
    bindTabs();
  });

  function bindButtons() {
    document.getElementById('btn-run').addEventListener('click', runCode);
    document.getElementById('btn-clear').addEventListener('click', clearEditor);
    document.getElementById('btn-example').addEventListener('click', showExamplePicker);

    const displayBtn = document.getElementById('btn-display');
    if (displayBtn) {
      displayBtn.addEventListener('click', () => {
        window.location.href = '/display';
      });
    }

    const adminBtn = document.getElementById('btn-admin');
    if (adminBtn) {
      adminBtn.addEventListener('click', () => {
        window.location.href = '/evaluation';
      });
    }

  }

  function bindTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        window.EmojiUI.toggleDocs(target === 'docs');
      });
    });
  }

  async function runCode() {
    const source = window.EmojiEditor.getValue().trim();
    if (!source) { window.EmojiUI.showToast('Write some emoji code first! 🖊️', 'error'); return; }

    const { python, errors } = window.EmojiCompiler.compile(source);
    if (errors.length > 0) {
      window.EmojiUI.showCompileErrors(errors);
      window.EmojiUI.showToast(`${errors.length} compile error${errors.length > 1 ? 's' : ''} found`, 'error');
      return;
    }

    const runBtn = document.getElementById('btn-run');
    runBtn.disabled = true;
    window.EmojiUI.showRunning();

    try {
      const result = await window.EmojiRunner.run(python);
      if (result.exitCode === 0 && !result.error) {
        window.EmojiUI.showSuccess(result);
        window.EmojiUI.showToast('Ran successfully ✓', 'success');
      } else {
        window.EmojiUI.showRuntimeError(result);
        window.EmojiUI.showToast('Runtime error 💥', 'error');
      }
    } catch (err) {
      window.EmojiUI.showFatalError(err.message || 'Unknown error');
      window.EmojiUI.showToast('API error', 'error');
    } finally {
      runBtn.disabled = false;
    }
  }

  function clearEditor() {
    if (!window.EmojiEditor.getValue().trim()) return;
    if (confirm('Clear the editor?')) {
      window.EmojiEditor.clear();
      window.EmojiUI.showWelcome();
      window.EmojiUI.showToast('Editor cleared', 'info');
    }
  }

  function showExamplePicker() {
    const examples = window.EMOJI_LANG.examples;
    const labels = {
      helloWorld: '👋 Hello World', variables: '📦 Variables',
      ifElse: '🤔 If / Else', loop: '🔁 Loops',
      function: '🔧 Functions', fizzbuzz: '🎯 FizzBuzz',
    };
    const existing = document.getElementById('example-picker');
    if (existing) { existing.remove(); return; }
    const btn  = document.getElementById('btn-example');
    const rect = btn.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id = 'example-picker';
    menu.style.cssText = `position:fixed;top:${rect.bottom+6}px;right:${window.innerWidth-rect.right}px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius-lg);padding:6px;z-index:9000;min-width:200px;box-shadow:var(--shadow);`;
    Object.keys(examples).forEach(key => {
      const item = document.createElement('button');
      item.style.cssText = `display:block;width:100%;text-align:left;padding:8px 12px;border-radius:var(--radius);font-family:var(--font-mono);font-size:12px;color:var(--text);transition:background 0.15s;cursor:pointer;background:none;border:none;`;
      item.textContent = labels[key] || key;
      item.addEventListener('mouseenter', () => item.style.background = 'var(--surface3)');
      item.addEventListener('mouseleave', () => item.style.background = 'none');
      item.addEventListener('click', () => {
        window.EmojiEditor.setValue(examples[key]);
        window.EmojiUI.showWelcome();
        menu.remove();
        window.EmojiUI.showToast(`Loaded: ${labels[key]}`, 'success');
      });
      menu.appendChild(item);
    });
    document.body.appendChild(menu);
    document.addEventListener('click', function close(e) {
      if (!menu.contains(e.target) && e.target !== btn) { menu.remove(); document.removeEventListener('click', close); }
    }, { capture: true });
  }

})();