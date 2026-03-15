// // // // /**
// // // //  * participant.js
// // // //  * Handles registration, question loading, submission and result display.
// // // //  */

// // // // window.EmojiParticipant = (function () {

// // // //   let _name        = '';
// // // //   let _roll        = '';
// // // //   let _currentQ    = '';
// // // //   let _startTime   = null;
// // // //   let _questions   = {};
// // // //   let _submitted   = {}; // track which questions already submitted correctly

// // // //   const IS_LOCAL = true; // ← change to false when deploying
// // // //   const BASE_URL = IS_LOCAL
// // // //     ? 'http://localhost:5000'
// // // //     : 'https://emojilang-backend.onrender.com';

// // // //   // ── INIT ───────────────────────────────────────────────────────────
// // // // function init() {
// // // //   // Get name and roll from your existing login system
// // // //   // Change these two lines to however your system stores user info
// // // // //   _name = localStorage.getItem('userName') || 'Participant';
// // // // //   _roll = localStorage.getItem('userRoll') || 'Unknown';
// // // // const params = new URLSearchParams(window.location.search);
// // // // _name = params.get('name') || localStorage.getItem('userName') || 'Participant';
// // // // _roll = params.get('roll') || localStorage.getItem('userRoll') || 'Unknown';

// // // //   // Show badge
// // // //   document.getElementById('participant-badge').innerHTML = `
// // // //     <span>👤</span>
// // // //     <span class="badge-name">${_name}</span>
// // // //     <span class="badge-roll">${_roll}</span>
// // // //   `;

// // // //   document.getElementById('question-select').addEventListener('change', handleQuestionChange);
// // // //   document.getElementById('btn-submit').addEventListener('click', handleSubmit);

// // // //   loadQuestions();
// // // // }
// // // //   // ── REGISTRATION ───────────────────────────────────────────────────
// // // //   function handleRegister() {
// // // //     const name = document.getElementById('reg-name').value.trim();
// // // //     const roll = document.getElementById('reg-roll').value.trim();
// // // //     const errEl = document.getElementById('reg-error');

// // // //     if (!name) { errEl.textContent = 'Please enter your name'; return; }
// // // //     if (!roll) { errEl.textContent = 'Please enter your roll number'; return; }

// // // //     _name = name;
// // // //     _roll = roll;

// // // //     // Hide overlay
// // // //     document.getElementById('reg-overlay').classList.add('hidden');

// // // //     // Show badge
// // // //     document.getElementById('participant-badge').innerHTML = `
// // // //       <span>👤</span>
// // // //       <span class="badge-name">${escHtml(name)}</span>
// // // //       <span class="badge-roll">${escHtml(roll)}</span>
// // // //     `;

// // // //     // Load questions
// // // //     loadQuestions();
// // // //     window.EmojiUI.showToast(`Welcome ${name}! 🎉`, 'success');
// // // //   }

// // // //   // ── LOAD QUESTIONS ─────────────────────────────────────────────────
// // // //   async function loadQuestions() {
// // // //     try {
// // // //       const res = await fetch(`${BASE_URL}/questions`);
// // // //       _questions = await res.json();

// // // //       const select = document.getElementById('question-select');
// // // //       select.innerHTML = '<option value="">Select Question...</option>';

// // // //       Object.entries(_questions).forEach(([qid, q]) => {
// // // //         const opt = document.createElement('option');
// // // //         opt.value = qid;
// // // //         opt.textContent = `${qid}: ${q.title}`;
// // // //         select.appendChild(opt);
// // // //       });

// // // //     } catch (e) {
// // // //       window.EmojiUI.showToast('Failed to load questions', 'error');
// // // //     }
// // // //   }

// // // //   // ── QUESTION CHANGE ────────────────────────────────────────────────
// // // //   function handleQuestionChange() {
// // // //     const qid = document.getElementById('question-select').value;
// // // //     _currentQ  = qid;
// // // //     _startTime = Date.now();

// // // //     const submitBtn = document.getElementById('btn-submit');
// // // //     submitBtn.disabled = false;
// // // //     submitBtn.textContent = '📤 Submit';

// // // //     if (!qid) {
// // // //       document.getElementById('question-label').textContent = 'No question selected';
// // // //       submitBtn.disabled = true;
// // // //       window.EmojiUI.showWelcome();
// // // //       return;
// // // //     }

// // // //     const q = _questions[qid];
// // // //     document.getElementById('question-label').textContent = `${qid}: ${q.title}`;

// // // //     if (_submitted[qid]) {
// // // //       submitBtn.disabled = true;
// // // //       submitBtn.textContent = '✅ Already Solved';
// // // //     }

// // // //     window.EmojiUI.showQuestion(q, qid, _submitted[qid]);
// // // //     window.EmojiEditor.clear();
// // // //     window.EmojiUI.showToast(`Loaded ${qid}: ${q.title}`, 'info');
// // // //   }

// // // //   // ── SUBMIT ─────────────────────────────────────────────────────────
// // // //   async function handleSubmit() {
// // // //     if (!_currentQ) {
// // // //       window.EmojiUI.showToast('Select a question first!', 'error');
// // // //       return;
// // // //     }

// // // //     const source = window.EmojiEditor.getValue().trim();
// // // //     if (!source) {
// // // //       window.EmojiUI.showToast('Write some code first!', 'error');
// // // //       return;
// // // //     }

// // // //     // Compile first
// // // //     const { python, errors } = window.EmojiCompiler.compile(source);
// // // //     if (errors.length > 0) {
// // // //       window.EmojiUI.showCompileErrors(errors);
// // // //       window.EmojiUI.showToast('Fix compile errors before submitting', 'error');
// // // //       return;
// // // //     }

// // // //     // Disable submit button during submission
// // // //     const submitBtn = document.getElementById('btn-submit');
// // // //     submitBtn.disabled = true;
// // // //     submitBtn.textContent = '⏳ Submitting...';
// // // //     const safetyTimer = setTimeout(() => {
// // // //         if (!_submitted[_currentQ]) {
// // // //             submitBtn.disabled = false;
// // // //             submitBtn.textContent = '📤 Submit';
// // // //             window.EmojiUI.showToast('Submission timed out — try again', 'error');
// // // //         }
// // // //     }, 8000);

// // // //     window.EmojiUI.showSubmitting();

// // // //     try {
// // // //       const res = await fetch(`${BASE_URL}/submit`, {
// // // //         method: 'POST',
// // // //         headers: { 'Content-Type': 'application/json' },
// // // //         body: JSON.stringify({
// // // //           name:      _name,
// // // //           roll:      _roll,
// // // //           question:  _currentQ,
// // // //           code:      python,
// // // //           startTime: _startTime,
// // // //         }),
// // // //       });

// // // //       const result = await res.json();

// // // //       if (!result.success) {
// // // //         window.EmojiUI.showToast(result.error || 'Submission failed', 'error');
// // // //         submitBtn.disabled = false;
// // // //         submitBtn.textContent = '📤 Submit';
// // // //         return;
// // // //       }

// // // //       window.EmojiUI.showSubmitResult(result, _currentQ, _questions[_currentQ]);

// // // //       if (result.passed) {
// // // //         _submitted[_currentQ] = true;
// // // //         submitBtn.textContent = '✅ Submitted';
// // // //         window.EmojiUI.showToast(`✅ Correct! ${_currentQ} solved!`, 'success', 4000);
// // // //       } else {
// // // //         submitBtn.disabled = false;
// // // //         submitBtn.textContent = '📤 Submit';
// // // //         window.EmojiUI.showToast('❌ Wrong answer — try again!', 'error', 3000);
// // // //       }

// // // //     } catch (e) {
// // // //       window.EmojiUI.showToast('Submission failed — check connection', 'error');
// // // //       submitBtn.disabled = false;
// // // //       submitBtn.textContent = '📤 Submit';
// // // //     }
// // // //     finally {
// // // //     clearTimeout(safetyTimer);
// // // //     } 
// // // //   }

// // // //   function getBaseUrl() { return BASE_URL; }

// // // //   function escHtml(str) {
// // // //     return String(str)
// // // //       .replace(/&/g, '&amp;')
// // // //       .replace(/</g, '&lt;')
// // // //       .replace(/>/g, '&gt;');
// // // //   }

// // // //   return { init, getBaseUrl };

// // // // })();



// // // /**
// // //  * participant.js
// // //  * Handles registration, question loading, submission and result display.
// // //  */

// // // // window.EmojiParticipant = (function () {

// // // //   let _name        = '';
// // // //   let _roll        = '';
// // // //   let _currentQ    = '';
// // // //   let _startTime   = null;
// // // //   let _questions   = {};
// // // //   let _submitted   = {}; // tracks correctly solved questions

// // // //   const IS_LOCAL = true; // ← change to false when deploying
// // // //   const BASE_URL = IS_LOCAL
// // // //     ? 'http://localhost:5000'
// // // //     : 'https://emojilang-backend.onrender.com';

// // // //   // ── INIT ───────────────────────────────────────────────────────────
// // // //   function init() {
// // // //     // Get name and roll from URL params or localStorage
// // // //     const params = new URLSearchParams(window.location.search);
// // // //     _name = params.get('name') || localStorage.getItem('userName') || 'Participant';
// // // //     _roll = params.get('roll') || localStorage.getItem('userRoll') || 'Unknown';

// // // //     // Show badge
// // // //     document.getElementById('participant-badge').innerHTML = `
// // // //       <span>👤</span>
// // // //       <span class="badge-name">${escHtml(_name)}</span>
// // // //       <span class="badge-roll">${escHtml(_roll)}</span>
// // // //     `;

// // // //     document.getElementById('question-select').addEventListener('change', handleQuestionChange);
// // // //     document.getElementById('btn-submit').addEventListener('click', handleSubmit);

// // // //     loadQuestions();
// // // //   }

// // // //   // ── LOAD QUESTIONS ─────────────────────────────────────────────────
// // // //   async function loadQuestions() {
// // // //     try {
// // // //       const res = await fetch(`${BASE_URL}/questions`);
// // // //       _questions = await res.json();

// // // //       const select = document.getElementById('question-select');
// // // //       select.innerHTML = '<option value="">Select Question...</option>';

// // // //       Object.entries(_questions).forEach(([qid, q]) => {
// // // //         const opt = document.createElement('option');
// // // //         opt.value = qid;
// // // //         opt.textContent = `${qid}: ${q.title}`;
// // // //         select.appendChild(opt);
// // // //       });

// // // //     } catch (e) {
// // // //       window.EmojiUI.showToast('Failed to load questions', 'error');
// // // //     }
// // // //   }

// // // //   // ── QUESTION CHANGE ────────────────────────────────────────────────
// // // //   function handleQuestionChange() {
// // // //     const qid      = document.getElementById('question-select').value;
// // // //     _currentQ      = qid;
// // // //     const submitBtn = document.getElementById('btn-submit');

// // // //     // Reset button state first
// // // //     submitBtn.disabled  = false;
// // // //     submitBtn.textContent = '📤 Submit';
// // // //     submitBtn.style.background = '';
// // // //     submitBtn.style.opacity = '';

// // // //     if (!qid) {
// // // //       document.getElementById('question-label').textContent = 'No question selected';
// // // //       submitBtn.disabled = true;
// // // //       window.EmojiUI.showWelcome();
// // // //       return;
// // // //     }

// // // //     // Reset start time for new question
// // // //     _startTime = Date.now();

// // // //     const q = _questions[qid];
// // // //     document.getElementById('question-label').textContent = `${qid}: ${q.title}`;

// // // //     // Clear editor for fresh start
// // // //     window.EmojiEditor.clear();

// // // //     // Check if already solved
// // // //     if (_submitted[qid]) {
// // // //       submitBtn.disabled   = true;
// // // //       submitBtn.textContent = '✅ Solved';
// // // //       submitBtn.style.background = 'var(--green)';
// // // //       submitBtn.style.opacity = '0.8';
// // // //       window.EmojiUI.showQuestion(q, qid, true);
// // // //       window.EmojiUI.showToast(`${qid} already solved! ✅`, 'success', 2000);
// // // //     } else {
// // // //       window.EmojiUI.showQuestion(q, qid, false);
// // // //       window.EmojiUI.showToast(`Loaded ${qid}: ${q.title}`, 'info');
// // // //     }
// // // //   }

// // // //   // ── SUBMIT ─────────────────────────────────────────────────────────
// // // //   async function handleSubmit() {
// // // //     if (!_currentQ) {
// // // //       window.EmojiUI.showToast('Select a question first!', 'error');
// // // //       return;
// // // //     }

// // // //     // Already solved — don't submit again
// // // //     if (_submitted[_currentQ]) {
// // // //       window.EmojiUI.showToast('Already solved! Pick another question.', 'info');
// // // //       return;
// // // //     }

// // // //     const source = window.EmojiEditor.getValue().trim();
// // // //     if (!source) {
// // // //       window.EmojiUI.showToast('Write some code first!', 'error');
// // // //       return;
// // // //     }

// // // //     // Compile first
// // // //     const { python, errors } = window.EmojiCompiler.compile(source);
// // // //     if (errors.length > 0) {
// // // //       window.EmojiUI.showCompileErrors(errors);
// // // //       window.EmojiUI.showToast('Fix compile errors before submitting', 'error');
// // // //       return;
// // // //     }

// // // //     const submitBtn = document.getElementById('btn-submit');
// // // //     submitBtn.disabled  = true;
// // // //     submitBtn.textContent = '⏳ Submitting...';

// // // //     // Safety timer — unfreeze after 8 seconds no matter what
// // // //     const safetyTimer = setTimeout(() => {
// // // //       if (!_submitted[_currentQ]) {
// // // //         submitBtn.disabled  = false;
// // // //         submitBtn.textContent = '📤 Submit';
// // // //         submitBtn.style.background = '';
// // // //         window.EmojiUI.showToast('Submission timed out — try again', 'error');
// // // //       }
// // // //     }, 8000);

// // // //     window.EmojiUI.showSubmitting();

// // // //     try {
// // // //       const res = await fetch(`${BASE_URL}/submit`, {
// // // //         method: 'POST',
// // // //         headers: { 'Content-Type': 'application/json' },
// // // //         body: JSON.stringify({
// // // //           name:      _name,
// // // //           roll:      _roll,
// // // //           question:  _currentQ,
// // // //           code:      python,
// // // //           startTime: _startTime,
// // // //         }),
// // // //       });

// // // //       const result = await res.json();

// // // //       if (!result.success) {
// // // //         window.EmojiUI.showToast(result.error || 'Submission failed', 'error');
// // // //         submitBtn.disabled  = false;
// // // //         submitBtn.textContent = '📤 Submit';
// // // //         submitBtn.style.background = '';
// // // //         return;
// // // //       }

// // // //       window.EmojiUI.showSubmitResult(result, _currentQ, _questions[_currentQ]);

// // // //       if (result.passed) {
// // // //         // Mark as solved permanently
// // // //         _submitted[_currentQ] = true;

// // // //         // Update button to solved state permanently
// // // //         submitBtn.disabled    = true;
// // // //         submitBtn.textContent = '✅ Solved';
// // // //         submitBtn.style.background = 'var(--green)';
// // // //         submitBtn.style.opacity    = '0.8';

// // // //         // Update question dropdown option to show solved
// // // //         const select = document.getElementById('question-select');
// // // //         const opt    = select.querySelector(`option[value="${_currentQ}"]`);
// // // //         if (opt) opt.textContent = `✅ ${_currentQ}: ${_questions[_currentQ].title}`;

// // // //         window.EmojiUI.showToast(`✅ Correct! ${_currentQ} solved! 🎉`, 'success', 4000);
// // // //       } else {
// // // //         // Wrong answer — re-enable for retry
// // // //         submitBtn.disabled  = false;
// // // //         submitBtn.textContent = '📤 Submit';
// // // //         submitBtn.style.background = '';
// // // //         window.EmojiUI.showToast('❌ Wrong answer — try again!', 'error', 3000);
// // // //       }

// // // //     } catch (e) {
// // // //       window.EmojiUI.showToast('Submission failed — check connection', 'error');
// // // //       submitBtn.disabled  = false;
// // // //       submitBtn.textContent = '📤 Submit';
// // // //       submitBtn.style.background = '';
// // // //     } finally {
// // // //       clearTimeout(safetyTimer);
// // // //     }
// // // //   }

// // // //   function getBaseUrl() { return BASE_URL; }

// // // //   function escHtml(str) {
// // // //     return String(str)
// // // //       .replace(/&/g, '&amp;')
// // // //       .replace(/</g, '&lt;')
// // // //       .replace(/>/g, '&gt;');
// // // //   }

// // // //   return { init, getBaseUrl };

// // // // })();


// // // /**
// // //  * participant.js
// // //  * Handles question loading, submission, progress tracker and question display.
// // //  */

// // // window.EmojiParticipant = (function () {

// // //   let _name      = '';
// // //   let _roll      = '';
// // //   let _currentQ  = '';
// // //   let _startTime = null;
// // //   let _questions = {};
// // //   let _submitted = {}; // qid → true if solved

// // //   const IS_LOCAL = true; // ← change to false when deploying
// // //   const BASE_URL = IS_LOCAL
// // //     ? 'http://localhost:5000'
// // //     : 'https://emojilang-backend.onrender.com';

// // //   // ── INIT ───────────────────────────────────────────────────────────
// // //   function init() {
// // //     const params = new URLSearchParams(window.location.search);
// // //     _name = params.get('name') || localStorage.getItem('userName') || 'Participant';
// // //     _roll = params.get('roll') || localStorage.getItem('userRoll') || 'Unknown';

// // //     document.getElementById('participant-badge').innerHTML = `
// // //       <span>👤</span>
// // //       <span class="badge-name">${escHtml(_name)}</span>
// // //       <span class="badge-roll">${escHtml(_roll)}</span>
// // //     `;

// // //     document.getElementById('question-select').addEventListener('change', handleQuestionChange);
// // //     document.getElementById('btn-submit').addEventListener('click', handleSubmit);

// // //     loadQuestions();
// // //   }

// // //   // ── LOAD QUESTIONS ─────────────────────────────────────────────────
// // //   async function loadQuestions() {
// // //     try {
// // //       const res  = await fetch(`${BASE_URL}/questions`);
// // //       _questions = await res.json();

// // //       const select = document.getElementById('question-select');
// // //       select.innerHTML = '<option value="">Select Question...</option>';

// // //       Object.entries(_questions).forEach(([qid, q]) => {
// // //         const opt = document.createElement('option');
// // //         opt.value = qid;
// // //         opt.textContent = `${qid}: ${q.title}`;
// // //         select.appendChild(opt);
// // //       });

// // //       // Build progress tracker chips
// // //       buildProgressTracker();

// // //     } catch (e) {
// // //       window.EmojiUI.showToast('Failed to load questions', 'error');
// // //     }
// // //   }

// // //   // ── PROGRESS TRACKER ───────────────────────────────────────────────
// // //   function buildProgressTracker() {
// // //     const chipsEl    = document.getElementById('progress-chips');
// // //     const totalEl    = document.getElementById('total-count');
// // //     const solvedEl   = document.getElementById('solved-count');
// // //     const qids       = Object.keys(_questions);

// // //     totalEl.textContent  = qids.length;
// // //     solvedEl.textContent = Object.keys(_submitted).length;

// // //     chipsEl.innerHTML = '';
// // //     chipsEl.style.display = 'flex';
// // //     chipsEl.style.gap = '6px';
// // //     chipsEl.style.flexWrap = 'wrap';

// // //     qids.forEach(qid => {
// // //       const chip = document.createElement('span');
// // //       chip.className = `progress-chip ${
// // //         _submitted[qid] ? 'solved' : qid === _currentQ ? 'current' : 'pending'
// // //       }`;
// // //       chip.textContent = _submitted[qid] ? `${qid} ✓` : qid;
// // //       chip.title = _questions[qid].title;
// // //       chip.addEventListener('click', () => {
// // //         document.getElementById('question-select').value = qid;
// // //         handleQuestionChange();
// // //       });
// // //       chipsEl.appendChild(chip);
// // //     });
// // //   }

// // //   // ── QUESTION CHANGE ────────────────────────────────────────────────
// // //   function handleQuestionChange() {
// // //     const qid      = document.getElementById('question-select').value;
// // //     _currentQ      = qid;
// // //     const submitBtn = document.getElementById('btn-submit');

// // //     // Reset button
// // //     submitBtn.disabled    = false;
// // //     submitBtn.textContent = '📤 Submit';
// // //     submitBtn.style.background = '';
// // //     submitBtn.style.opacity    = '';

// // //     if (!qid) {
// // //       document.getElementById('question-label').textContent = 'No question selected';
// // //       document.getElementById('question-info-panel').classList.remove('visible');
// // //       submitBtn.disabled = true;
// // //       window.EmojiUI.showWelcome();
// // //       buildProgressTracker();
// // //       return;
// // //     }

// // //     _startTime = Date.now();
// // //     const q    = _questions[qid];

// // //     document.getElementById('question-label').textContent = `${qid}: ${q.title}`;

// // //     // Show question info panel
// // //     const panel = document.getElementById('question-info-panel');
// // //     panel.classList.add('visible');
// // //     document.getElementById('q-info-id').textContent    = qid;
// // //     document.getElementById('q-info-title').textContent = q.title;
// // //     document.getElementById('q-info-desc').textContent  = q.description;

// // //     const solvedBadge = document.getElementById('q-info-solved');

// // //     // Clear editor
// // //     window.EmojiEditor.clear();

// // //     if (_submitted[qid]) {
// // //       // Already solved
// // //       submitBtn.disabled    = true;
// // //       submitBtn.textContent = '✅ Solved';
// // //       submitBtn.style.background = 'var(--green)';
// // //       submitBtn.style.opacity    = '0.8';
// // //       solvedBadge.classList.remove('hidden');
// // //       window.EmojiUI.showQuestion(q, qid, true);
// // //       window.EmojiUI.showToast(`${qid} already solved! ✅`, 'success', 2000);
// // //     } else {
// // //       solvedBadge.classList.add('hidden');
// // //       window.EmojiUI.showQuestion(q, qid, false);
// // //       window.EmojiUI.showToast(`Loaded ${qid}: ${q.title}`, 'info');
// // //     }

// // //     // Update progress chips
// // //     buildProgressTracker();
// // //   }

// // //   // ── SUBMIT ─────────────────────────────────────────────────────────
// // //   async function handleSubmit() {
// // //     if (!_currentQ) {
// // //       window.EmojiUI.showToast('Select a question first!', 'error');
// // //       return;
// // //     }
// // //     if (_submitted[_currentQ]) {
// // //       window.EmojiUI.showToast('Already solved! Pick another question.', 'info');
// // //       return;
// // //     }

// // //     const source = window.EmojiEditor.getValue().trim();
// // //     if (!source) {
// // //       window.EmojiUI.showToast('Write some code first!', 'error');
// // //       return;
// // //     }

// // //     const { python, errors } = window.EmojiCompiler.compile(source);
// // //     if (errors.length > 0) {
// // //       window.EmojiUI.showCompileErrors(errors);
// // //       window.EmojiUI.showToast('Fix compile errors before submitting', 'error');
// // //       return;
// // //     }

// // //     const submitBtn = document.getElementById('btn-submit');
// // //     submitBtn.disabled    = true;
// // //     submitBtn.textContent = '⏳ Submitting...';

// // //     // Safety timer
// // //     const safetyTimer = setTimeout(() => {
// // //       if (!_submitted[_currentQ]) {
// // //         submitBtn.disabled    = false;
// // //         submitBtn.textContent = '📤 Submit';
// // //         submitBtn.style.background = '';
// // //         window.EmojiUI.showToast('Submission timed out — try again', 'error');
// // //       }
// // //     }, 8000);

// // //     window.EmojiUI.showSubmitting();

// // //     try {
// // //       const res = await fetch(`${BASE_URL}/submit`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({
// // //           name:      _name,
// // //           roll:      _roll,
// // //           question:  _currentQ,
// // //           code:      python,
// // //           startTime: _startTime,
// // //         }),
// // //       });

// // //       const result = await res.json();

// // //       if (!result.success) {
// // //         window.EmojiUI.showToast(result.error || 'Submission failed', 'error');
// // //         submitBtn.disabled    = false;
// // //         submitBtn.textContent = '📤 Submit';
// // //         submitBtn.style.background = '';
// // //         return;
// // //       }

// // //       window.EmojiUI.showSubmitResult(result, _currentQ, _questions[_currentQ]);

// // //       if (result.passed) {
// // //         _submitted[_currentQ] = true;

// // //         // Update button
// // //         submitBtn.disabled    = true;
// // //         submitBtn.textContent = '✅ Solved';
// // //         submitBtn.style.background = 'var(--green)';
// // //         submitBtn.style.opacity    = '0.8';

// // //         // Show solved badge on question panel
// // //         document.getElementById('q-info-solved').classList.remove('hidden');

// // //         // Update dropdown option
// // //         const select = document.getElementById('question-select');
// // //         const opt    = select.querySelector(`option[value="${_currentQ}"]`);
// // //         if (opt) opt.textContent = `✅ ${_currentQ}: ${_questions[_currentQ].title}`;

// // //         // Update progress tracker
// // //         buildProgressTracker();

// // //         window.EmojiUI.showToast(`✅ Correct! ${_currentQ} solved! 🎉`, 'success', 4000);

// // //       } else {
// // //         submitBtn.disabled    = false;
// // //         submitBtn.textContent = '📤 Submit';
// // //         submitBtn.style.background = '';
// // //         window.EmojiUI.showToast('❌ Wrong answer — try again!', 'error', 3000);
// // //       }

// // //     } catch (e) {
// // //       window.EmojiUI.showToast('Submission failed — check connection', 'error');
// // //       submitBtn.disabled    = false;
// // //       submitBtn.textContent = '📤 Submit';
// // //       submitBtn.style.background = '';
// // //     } finally {
// // //       clearTimeout(safetyTimer);
// // //     }
// // //   }

// // //   function escHtml(str) {
// // //     return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// // //   }

// // //   function getBaseUrl() { return BASE_URL; }

// // //   return { init, getBaseUrl };

// // // })();



// // /**
// //  * participant.js
// //  * Handles question loading, submission, progress tracker and question display.
// //  * Uses HC_SESSION from auth.js for name/roll.
// //  */

// // window.EmojiParticipant = (function () {

// //   let _name      = '';
// //   let _roll      = '';
// //   let _currentQ  = '';
// //   let _startTime = null;
// //   let _questions = {};
// //   let _submitted = {};

// //   const IS_LOCAL = true; // ← change to false when deploying
// //   const BASE_URL = IS_LOCAL
// //     ? 'http://localhost:5000'
// //     : 'https://emojilang-backend.onrender.com';

// //   // ── INIT ───────────────────────────────────────────────────────────
// //   function init() {
// //     // Use session from auth.js (already validated)
// //     // Fallback to URL params for testing
// //     if (window.HC_SESSION) {
// //       _name = window.HC_SESSION.name;
// //       _roll = window.HC_SESSION.roll;
// //     } else {
// //       const params = new URLSearchParams(window.location.search);
// //       _name = params.get('name') || 'Participant';
// //       _roll = params.get('roll') || 'Unknown';
// //     }

// //     document.getElementById('participant-badge').innerHTML = `
// //       <span>👤</span>
// //       <span class="badge-name">${escHtml(_name)}</span>
// //       <span class="badge-roll">${escHtml(_roll)}</span>
// //     `;

// //     document.getElementById('question-select').addEventListener('change', handleQuestionChange);
// //     document.getElementById('btn-submit').addEventListener('click', handleSubmit);

// //     loadQuestions();
// //   }

// //   // ── LOAD QUESTIONS ─────────────────────────────────────────────────
// //   async function loadQuestions() {
// //     try {
// //       const res  = await fetch(`${BASE_URL}/questions`);
// //       _questions = await res.json();

// //       const select = document.getElementById('question-select');
// //       select.innerHTML = '<option value="">Select Question...</option>';

// //       Object.entries(_questions).forEach(([qid, q]) => {
// //         const opt = document.createElement('option');
// //         opt.value = qid;
// //         opt.textContent = `${qid}: ${q.title}`;
// //         select.appendChild(opt);
// //       });

// //       buildProgressTracker();
// //     } catch (e) {
// //       window.EmojiUI.showToast('Failed to load questions', 'error');
// //     }
// //   }

// //   // ── PROGRESS TRACKER ───────────────────────────────────────────────
// //   function buildProgressTracker() {
// //     const chipsEl  = document.getElementById('progress-chips');
// //     const totalEl  = document.getElementById('total-count');
// //     const solvedEl = document.getElementById('solved-count');
// //     const qids     = Object.keys(_questions).sort((a, b) =>
// //       parseInt(a.replace('Q','')) - parseInt(b.replace('Q',''))
// //     );

// //     totalEl.textContent  = qids.length;
// //     solvedEl.textContent = Object.keys(_submitted).length;

// //     chipsEl.innerHTML = '';
// //     chipsEl.style.display = 'flex';
// //     chipsEl.style.gap = '6px';
// //     chipsEl.style.flexWrap = 'wrap';

// //     qids.forEach(qid => {
// //       const chip = document.createElement('span');
// //       chip.className = `progress-chip ${
// //         _submitted[qid] ? 'solved' : qid === _currentQ ? 'current' : 'pending'
// //       }`;
// //       chip.textContent = _submitted[qid] ? `${qid} ✓` : qid;
// //       chip.title = _questions[qid]?.title || qid;
// //       chip.addEventListener('click', () => {
// //         document.getElementById('question-select').value = qid;
// //         handleQuestionChange();
// //       });
// //       chipsEl.appendChild(chip);
// //     });
// //   }

// //   // ── QUESTION CHANGE ────────────────────────────────────────────────
// //   function handleQuestionChange() {
// //     const qid       = document.getElementById('question-select').value;
// //     _currentQ       = qid;
// //     const submitBtn = document.getElementById('btn-submit');

// //     submitBtn.disabled    = false;
// //     submitBtn.textContent = '📤 Submit';
// //     submitBtn.style.background = '';
// //     submitBtn.style.opacity    = '';

// //     if (!qid) {
// //       document.getElementById('question-label').textContent = 'No question selected';
// //       document.getElementById('question-info-panel').classList.remove('visible');
// //       submitBtn.disabled = true;
// //       window.EmojiUI.showWelcome();
// //       buildProgressTracker();
// //       return;
// //     }

// //     _startTime = Date.now();
// //     const q    = _questions[qid];

// //     document.getElementById('question-label').textContent = `${qid}: ${q.title}`;

// //     const panel = document.getElementById('question-info-panel');
// //     panel.classList.add('visible');
// //     document.getElementById('q-info-id').textContent    = qid;
// //     document.getElementById('q-info-title').textContent = q.title;
// //     document.getElementById('q-info-desc').textContent  = q.description;

// //     const solvedBadge = document.getElementById('q-info-solved');

// //     window.EmojiEditor.clear();

// //     if (_submitted[qid]) {
// //       submitBtn.disabled    = true;
// //       submitBtn.textContent = '✅ Solved';
// //       submitBtn.style.background = 'var(--green)';
// //       submitBtn.style.opacity    = '0.8';
// //       solvedBadge.classList.remove('hidden');
// //       window.EmojiUI.showQuestion(q, qid, true);
// //       window.EmojiUI.showToast(`${qid} already solved! ✅`, 'success', 2000);
// //     } else {
// //       solvedBadge.classList.add('hidden');
// //       window.EmojiUI.showQuestion(q, qid, false);
// //       window.EmojiUI.showToast(`Loaded ${qid}: ${q.title}`, 'info');
// //     }

// //     buildProgressTracker();
// //   }

// //   // ── SUBMIT ─────────────────────────────────────────────────────────
// //   async function handleSubmit() {
// //     if (!_currentQ) { window.EmojiUI.showToast('Select a question first!', 'error'); return; }
// //     if (_submitted[_currentQ]) { window.EmojiUI.showToast('Already solved! Pick another.', 'info'); return; }

// //     const source = window.EmojiEditor.getValue().trim();
// //     if (!source) { window.EmojiUI.showToast('Write some code first!', 'error'); return; }

// //     const { python, errors } = window.EmojiCompiler.compile(source);
// //     if (errors.length > 0) {
// //       window.EmojiUI.showCompileErrors(errors);
// //       window.EmojiUI.showToast('Fix compile errors before submitting', 'error');
// //       return;
// //     }

// //     const submitBtn = document.getElementById('btn-submit');
// //     submitBtn.disabled    = true;
// //     submitBtn.textContent = '⏳ Submitting...';

// //     const safetyTimer = setTimeout(() => {
// //       if (!_submitted[_currentQ]) {
// //         submitBtn.disabled    = false;
// //         submitBtn.textContent = '📤 Submit';
// //         submitBtn.style.background = '';
// //         window.EmojiUI.showToast('Submission timed out — try again', 'error');
// //       }
// //     }, 8000);

// //     window.EmojiUI.showSubmitting();

// //     try {
// //       const res = await fetch(`${BASE_URL}/submit`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           name: _name, roll: _roll,
// //           question: _currentQ, code: python,
// //           startTime: _startTime,
// //         }),
// //       });

// //       const result = await res.json();

// //       if (!result.success) {
// //         window.EmojiUI.showToast(result.error || 'Submission failed', 'error');
// //         submitBtn.disabled    = false;
// //         submitBtn.textContent = '📤 Submit';
// //         submitBtn.style.background = '';
// //         return;
// //       }

// //       window.EmojiUI.showSubmitResult(result, _currentQ, _questions[_currentQ]);

// //       if (result.passed) {
// //         _submitted[_currentQ] = true;
// //         submitBtn.disabled    = true;
// //         submitBtn.textContent = '✅ Solved';
// //         submitBtn.style.background = 'var(--green)';
// //         submitBtn.style.opacity    = '0.8';
// //         document.getElementById('q-info-solved').classList.remove('hidden');
// //         const opt = document.querySelector(`#question-select option[value="${_currentQ}"]`);
// //         if (opt) opt.textContent = `✅ ${_currentQ}: ${_questions[_currentQ].title}`;
// //         buildProgressTracker();
// //         window.EmojiUI.showToast(`✅ Correct! ${_currentQ} solved! 🎉`, 'success', 4000);
// //       } else {
// //         submitBtn.disabled    = false;
// //         submitBtn.textContent = '📤 Submit';
// //         submitBtn.style.background = '';
// //         window.EmojiUI.showToast('❌ Wrong answer — try again!', 'error', 3000);
// //       }

// //     } catch (e) {
// //       window.EmojiUI.showToast('Submission failed — check connection', 'error');
// //       submitBtn.disabled    = false;
// //       submitBtn.textContent = '📤 Submit';
// //       submitBtn.style.background = '';
// //     } finally {
// //       clearTimeout(safetyTimer);
// //     }
// //   }

// //   function escHtml(str) {
// //     return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// //   }

// //   return { init };

// // })();
// /**
//  * participant.js
//  * Uses HC_CONFIG.BASE_URL from config.js for all API calls.
//  */

// window.EmojiParticipant = (function () {

//   let _name      = '';
//   let _roll      = '';
//   let _currentQ  = '';
//   let _startTime = null;
//   let _questions = {};
//   let _submitted = {}; // only tracks THIS session's correct solves

//   // ── INIT ───────────────────────────────────────────────────────────
//   function init() {
//     // Use session from auth.js
//     if (window.HC_SESSION) {
//       _name = window.HC_SESSION.name;
//       _roll = window.HC_SESSION.roll;
//     } else {
//       const params = new URLSearchParams(window.location.search);
//       _name = params.get('name') || 'Participant';
//       _roll = params.get('roll') || 'Unknown';
//     }

//     document.getElementById('participant-badge').innerHTML = `
//       <span>👤</span>
//       <span class="badge-name">${escHtml(_name)}</span>
//       <span class="badge-roll">${escHtml(_roll)}</span>
//     `;

//     document.getElementById('question-select').addEventListener('change', handleQuestionChange);
//     document.getElementById('btn-submit').addEventListener('click', handleSubmit);

//     loadQuestions();
//   }

//   // ── LOAD QUESTIONS ─────────────────────────────────────────────────
//   async function loadQuestions() {
//     try {
//       const res  = await fetch(`${HC_CONFIG.BASE_URL}/questions`);
//       _questions = await res.json();

//       const select = document.getElementById('question-select');
//       select.innerHTML = '<option value="">Select Question...</option>';

//       // Sort Q1, Q2... Q10 correctly
//       const sorted = Object.entries(_questions).sort((a, b) =>
//         parseInt(a[0].replace('Q','')) - parseInt(b[0].replace('Q',''))
//       );

//       sorted.forEach(([qid, q]) => {
//         const opt = document.createElement('option');
//         opt.value = qid;
//         opt.textContent = `${qid}: ${q.title}`;
//         select.appendChild(opt);
//       });

//       buildProgressTracker();
//     } catch(e) {
//       window.EmojiUI.showToast('Failed to load questions', 'error');
//     }
//   }

//   // ── PROGRESS TRACKER ───────────────────────────────────────────────
//   function buildProgressTracker() {
//     const chipsEl  = document.getElementById('progress-chips');
//     const totalEl  = document.getElementById('total-count');
//     const solvedEl = document.getElementById('solved-count');

//     if (!chipsEl) return;

//     const qids = Object.keys(_questions).sort((a, b) =>
//       parseInt(a.replace('Q','')) - parseInt(b.replace('Q',''))
//     );

//     totalEl.textContent  = qids.length;
//     solvedEl.textContent = Object.keys(_submitted).length;

//     chipsEl.innerHTML = '';
//     chipsEl.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';

//     qids.forEach(qid => {
//       const chip       = document.createElement('span');
//       const isSolved   = !!_submitted[qid];
//       const isCurrent  = qid === _currentQ;

//       chip.className   = `progress-chip ${isSolved ? 'solved' : isCurrent ? 'current' : 'pending'}`;
//       chip.textContent = isSolved ? `${qid} ✓` : qid;
//       chip.title       = _questions[qid]?.title || qid;

//       chip.addEventListener('click', () => {
//         document.getElementById('question-select').value = qid;
//         handleQuestionChange();
//       });
//       chipsEl.appendChild(chip);
//     });
//   }

//   // ── QUESTION CHANGE ────────────────────────────────────────────────
//   function handleQuestionChange() {
//     const qid       = document.getElementById('question-select').value;
//     _currentQ       = qid;
//     const submitBtn = document.getElementById('btn-submit');

//     // Always reset button first
//     submitBtn.disabled    = false;
//     submitBtn.textContent = '📤 Submit';
//     submitBtn.style.background = '';
//     submitBtn.style.opacity    = '';

//     if (!qid) {
//       document.getElementById('question-label').textContent = 'No question selected';
//       document.getElementById('question-info-panel').classList.remove('visible');
//       submitBtn.disabled = true;
//       window.EmojiUI.showWelcome();
//       buildProgressTracker();
//       return;
//     }

//     _startTime = Date.now();
//     const q    = _questions[qid];

//     document.getElementById('question-label').textContent = `${qid}: ${q.title}`;

//     // Show question info panel
//     const panel = document.getElementById('question-info-panel');
//     panel.classList.add('visible');
//     document.getElementById('q-info-id').textContent    = qid;
//     document.getElementById('q-info-title').textContent = q.title;
//     document.getElementById('q-info-desc').textContent  = q.description;

//     const solvedBadge = document.getElementById('q-info-solved');

//     // Clear editor for fresh attempt
//     window.EmojiEditor.clear();

//     if (_submitted[qid]) {
//       // This question solved in current session
//       submitBtn.disabled    = true;
//       submitBtn.textContent = '✅ Solved';
//       submitBtn.style.background = 'var(--green)';
//       submitBtn.style.opacity    = '0.8';
//       solvedBadge.classList.remove('hidden');
//       window.EmojiUI.showQuestion(q, qid, true);
//       window.EmojiUI.showToast(`${qid} already solved! ✅`, 'success', 2000);
//     } else {
//       solvedBadge.classList.add('hidden');
//       window.EmojiUI.showQuestion(q, qid, false);
//       window.EmojiUI.showToast(`Loaded ${qid}: ${q.title}`, 'info');
//     }

//     buildProgressTracker();
//   }

//   // ── SUBMIT ─────────────────────────────────────────────────────────
//   async function handleSubmit() {
//     if (!_currentQ) { window.EmojiUI.showToast('Select a question first!', 'error'); return; }
//     if (_submitted[_currentQ]) { window.EmojiUI.showToast('Already solved! Pick another.', 'info'); return; }

//     const source = window.EmojiEditor.getValue().trim();
//     if (!source) { window.EmojiUI.showToast('Write some code first!', 'error'); return; }

//     const { python, errors } = window.EmojiCompiler.compile(source);
//     if (errors.length > 0) {
//       window.EmojiUI.showCompileErrors(errors);
//       window.EmojiUI.showToast('Fix compile errors before submitting', 'error');
//       return;
//     }

//     const submitBtn = document.getElementById('btn-submit');
//     submitBtn.disabled    = true;
//     submitBtn.textContent = '⏳ Submitting...';

//     // Safety timer — unfreeze after 10s no matter what
//     const safetyTimer = setTimeout(() => {
//       if (!_submitted[_currentQ]) {
//         submitBtn.disabled    = false;
//         submitBtn.textContent = '📤 Submit';
//         submitBtn.style.background = '';
//         window.EmojiUI.showToast('Submission timed out — try again', 'error');
//       }
//     }, 10000);

//     window.EmojiUI.showSubmitting();

//     try {
//       const res = await fetch(`${HC_CONFIG.BASE_URL}/submit`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name:      _name,
//           roll:      _roll,
//           question:  _currentQ,
//           code:      python,
//           startTime: _startTime,
//         }),
//       });

//       if (!res.ok) {
//         throw new Error(`HTTP ${res.status}`);
//       }

//       const result = await res.json();

//       if (!result.success) {
//         window.EmojiUI.showToast(result.error || 'Submission failed', 'error');
//         submitBtn.disabled    = false;
//         submitBtn.textContent = '📤 Submit';
//         submitBtn.style.background = '';
//         return;
//       }

//       window.EmojiUI.showSubmitResult(result, _currentQ, _questions[_currentQ]);

//       if (result.passed) {
//         // Mark solved in current session
//         _submitted[_currentQ] = true;

//         submitBtn.disabled    = true;
//         submitBtn.textContent = '✅ Solved';
//         submitBtn.style.background = 'var(--green)';
//         submitBtn.style.opacity    = '0.8';

//         document.getElementById('q-info-solved').classList.remove('hidden');

//         // Update dropdown option
//         const opt = document.querySelector(`#question-select option[value="${_currentQ}"]`);
//         if (opt) opt.textContent = `✅ ${_currentQ}: ${_questions[_currentQ].title}`;

//         buildProgressTracker();
//         window.EmojiUI.showToast(`✅ Correct! ${_currentQ} solved! 🎉`, 'success', 4000);

//       } else {
//         // Wrong answer — re-enable
//         submitBtn.disabled    = false;
//         submitBtn.textContent = '📤 Submit';
//         submitBtn.style.background = '';
//         window.EmojiUI.showToast('❌ Wrong answer — try again!', 'error', 3000);
//       }

//     } catch(e) {
//       console.error('Submit error:', e);
//       window.EmojiUI.showToast(`Submission failed: ${e.message}`, 'error');
//       submitBtn.disabled    = false;
//       submitBtn.textContent = '📤 Submit';
//       submitBtn.style.background = '';
//     } finally {
//       clearTimeout(safetyTimer);
//     }
//   }

//   function escHtml(str) {
//     return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
//   }

//   return { init };

// })();


/**
 * participant.js
 * Fixed: solved state only tracks current session correctly
 */

window.EmojiParticipant = (function () {

  let _name      = '';
  let _roll      = '';
  let _currentQ  = '';
  let _startTime = null;
  let _questions = {};
  let _submitted = {}; // qid → true, only after confirmed correct in THIS session

  function init() {
    if (window.HC_SESSION) {
      _name = window.HC_SESSION.name;
      _roll = window.HC_SESSION.roll;
    } else {
      const params = new URLSearchParams(window.location.search);
      _name = params.get('name') || 'Participant';
      _roll = params.get('roll') || 'Unknown';
    }

    document.getElementById('participant-badge').innerHTML = `
      <span>👤</span>
      <span class="badge-name">${escHtml(_name)}</span>
      <span class="badge-roll">${escHtml(_roll)}</span>
    `;

    document.getElementById('question-select').addEventListener('change', handleQuestionChange);
    document.getElementById('btn-submit').addEventListener('click', handleSubmit);

    loadQuestions();
  }

  async function loadQuestions() {
  try {
    const res  = await fetch(`${HC_CONFIG.BASE_URL}/questions`);
    _questions = await res.json();

    const select = document.getElementById('question-select');
    select.innerHTML = '<option value="">Select Question...</option>';

    Object.entries(_questions)
      .sort((a, b) => parseInt(a[0].replace('Q','')) - parseInt(b[0].replace('Q','')))
      .forEach(([qid, q]) => {
        const opt       = document.createElement('option');
        opt.value       = qid;
        opt.textContent = `${qid}: ${q.title}`;
        select.appendChild(opt);
      });

    buildProgressTracker();

    // Load previously solved questions from Supabase
    const solved = await HC_CONFIG.sbFetch(
      `solved_questions?team_name=eq.${encodeURIComponent(_name)}&select=question_id`
    );
    if (solved && solved.length) {
      solved.forEach(s => {
        _submitted[s.question_id] = true;
        const opt = document.querySelector(`#question-select option[value="${s.question_id}"]`);
        if (opt) opt.textContent = `✅ ${s.question_id}: ${_questions[s.question_id]?.title || ''}`;
      });
      buildProgressTracker();
    }

  } catch(e) {
    console.error('loadQuestions error:', e);
    window.EmojiUI.showToast('Failed to load questions', 'error');
  }
}

  function buildProgressTracker() {
    const chipsEl  = document.getElementById('progress-chips');
    const totalEl  = document.getElementById('total-count');
    const solvedEl = document.getElementById('solved-count');
    if (!chipsEl) return;

    const qids = Object.keys(_questions)
      .sort((a,b) => parseInt(a.replace('Q','')) - parseInt(b.replace('Q','')));

    totalEl.textContent  = qids.length;
    solvedEl.textContent = Object.keys(_submitted).length;
    chipsEl.innerHTML    = '';
    chipsEl.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';

    qids.forEach(qid => {
      const chip = document.createElement('span');
      chip.className   = `progress-chip ${_submitted[qid] ? 'solved' : qid === _currentQ ? 'current' : 'pending'}`;
      chip.textContent = _submitted[qid] ? `${qid} ✓` : qid;
      chip.title       = _questions[qid]?.title || qid;
      chip.addEventListener('click', () => {
        document.getElementById('question-select').value = qid;
        handleQuestionChange();
      });
      chipsEl.appendChild(chip);
    });
  }

  function handleQuestionChange() {
    const qid       = document.getElementById('question-select').value;
    _currentQ       = qid;
    const submitBtn = document.getElementById('btn-submit');
    const solvedBadge = document.getElementById('q-info-solved');

    // Always reset button and badge first
    submitBtn.disabled         = false;
    submitBtn.textContent      = '📤 Submit';
    submitBtn.style.background = '';
    submitBtn.style.opacity    = '';
    solvedBadge.classList.add('hidden'); // ← always hide initially

    if (!qid) {
      document.getElementById('question-label').textContent = 'No question selected';
      document.getElementById('question-info-panel').classList.remove('visible');
      submitBtn.disabled = true;
      window.EmojiUI.showWelcome();
      buildProgressTracker();
      return;
    }

    _startTime = Date.now();
    const q    = _questions[qid];

    document.getElementById('question-label').textContent = `${qid}: ${q.title}`;

    // Show question info panel
    document.getElementById('question-info-panel').classList.add('visible');
    document.getElementById('q-info-id').textContent    = qid;
    document.getElementById('q-info-title').textContent = q.title;
    document.getElementById('q-info-desc').textContent  = q.description;

    window.EmojiEditor.clear();

    const isSolved = !!_submitted[qid]; // only true if solved in THIS session

    if (isSolved) {
      submitBtn.disabled         = true;
      submitBtn.textContent      = '✅ Solved';
      submitBtn.style.background = 'var(--green)';
      submitBtn.style.opacity    = '0.8';
      solvedBadge.classList.remove('hidden'); // ← only show if actually solved
      window.EmojiUI.showQuestionSolved(q, qid); // ← shows solved state in output
    } else {
      window.EmojiUI.showQuestionUnsolved(q, qid); // ← shows only expected output
    }

    buildProgressTracker();
  }

  async function handleSubmit() {
    if (!_currentQ) { window.EmojiUI.showToast('Select a question first!', 'error'); return; }
    if (_submitted[_currentQ]) { window.EmojiUI.showToast('Already solved! Pick another.', 'info'); return; }

    const source = window.EmojiEditor.getValue().trim();
    if (!source) { window.EmojiUI.showToast('Write some code first!', 'error'); return; }

    const { python, errors } = window.EmojiCompiler.compile(source);
    if (errors.length > 0) {
      window.EmojiUI.showCompileErrors(errors);
      window.EmojiUI.showToast('Fix compile errors first', 'error');
      return;
    }

    const submitBtn    = document.getElementById('btn-submit');
    submitBtn.disabled    = true;
    submitBtn.textContent = '⏳ Submitting...';

    const safetyTimer = setTimeout(() => {
      if (!_submitted[_currentQ]) {
        submitBtn.disabled    = false;
        submitBtn.textContent = '📤 Submit';
        submitBtn.style.background = '';
        window.EmojiUI.showToast('Submission timed out — try again', 'error');
      }
    }, 10000);

    window.EmojiUI.showSubmitting();

    try {
      const res = await fetch(`${HC_CONFIG.BASE_URL}/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: _name, roll: _name,
          question: _currentQ, code: python,
          startTime: _startTime,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();

      if (!result.success) {
        window.EmojiUI.showToast(result.error || 'Submission failed', 'error');
        submitBtn.disabled    = false;
        submitBtn.textContent = '📤 Submit';
        submitBtn.style.background = '';
        return;
      }

      window.EmojiUI.showSubmitResult(result, _currentQ, _questions[_currentQ]);

      if (result.passed) {
        _submitted[_currentQ] = true;

      // Save to Supabase
      try {
        await HC_CONFIG.sbFetch('solved_questions', 'POST', {
          team_name:   _name,
          question_id: _currentQ,
          time_taken:  result.timeTaken,
        });
      } catch(e) {
        console.error('Failed to save solved question:', e);
      }// ← only set here on confirmed correct

        submitBtn.disabled         = true;
        submitBtn.textContent      = '✅ Solved';
        submitBtn.style.background = 'var(--green)';
        submitBtn.style.opacity    = '0.8';

        // Now show solved badge
        document.getElementById('q-info-solved').classList.remove('hidden');

        // Update dropdown
        const opt = document.querySelector(`#question-select option[value="${_currentQ}"]`);
        if (opt) opt.textContent = `✅ ${_currentQ}: ${_questions[_currentQ].title}`;

        buildProgressTracker();
        window.EmojiUI.showToast(`✅ Correct! ${_currentQ} solved! 🎉`, 'success', 4000);

      } else {
        submitBtn.disabled    = false;
        submitBtn.textContent = '📤 Submit';
        submitBtn.style.background = '';
        window.EmojiUI.showToast('❌ Wrong answer — try again!', 'error', 3000);
      }

    } catch(e) {
      console.error('Submit error:', e);
      window.EmojiUI.showToast(`Submission failed: ${e.message}`, 'error');
      submitBtn.disabled    = false;
      submitBtn.textContent = '📤 Submit';
      submitBtn.style.background = '';
    } finally {
      clearTimeout(safetyTimer);
    }
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { init };

})();