// SAFE AUTO FLOW - Error Resistant Version
(() => {
  'use strict';

  // Prevent multiple loads
  if (window.__SAFE_FLOW_LOADED__) return;
  window.__SAFE_FLOW_LOADED__ = true;

  let STATE = {
    queue: [],
    currentIdx: -1,
    running: false,
    paused: false,
    timeouts: []
  };

  const SETTINGS = {
    typingDelay: 20,      // ms per character
    submitWait: 4000,     // ms after submit
    imageWait: 1500,      // ms after image paste
    nextWait: 500         // ms before next prompt
  };

  /* ==================== UI SETUP ==================== */
  function createUI() {
    const styles = document.createElement('style');
    styles.textContent = `
      #safe-flow-btn {
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 999999;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 18px;
        border-radius: 8px;
        cursor: pointer;
        font-family: sans-serif;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: all 0.2s;
      }
      #safe-flow-btn:hover { transform: translateY(-2px); }
      #safe-flow-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.9);
        z-index: 999998;
        display: none;
        overflow: auto;
        padding: 20px;
        box-sizing: border-box;
      }
      #safe-flow-modal {
        background: #1a1a2e;
        max-width: 850px;
        margin: 3% auto;
        border-radius: 12px;
        padding: 20px;
        font-family: sans-serif;
        color: #fff;
      }
      #safe-flow-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 15px;
        border-bottom: 1px solid #333;
        margin-bottom: 15px;
      }
      #safe-flow-header h3 { margin: 0; font-size: 18px; }
      #safe-flow-close {
        background: #ff3b30;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      }
      .safe-tabs { display: flex; gap: 8px; margin-bottom: 15px; }
      .safe-tab {
        padding: 10px 16px;
        background: #2d2d44;
        border: none;
        border-radius: 6px;
        color: #aaa;
        cursor: pointer;
        font-size: 13px;
      }
      .safe-tab.active { background: #667eea; color: #fff; }
      .safe-panel { display: none; }
      .safe-panel.active { display: block; }
      #safe-json-input {
        width: 100%;
        height: 160px;
        background: #0d0d1a;
        border: 1px solid #333;
        border-radius: 8px;
        color: #0f0;
        font-family: monospace;
        font-size: 12px;
        padding: 12px;
        resize: vertical;
        box-sizing: border-box;
      }
      #safe-json-input:focus { outline: none; border-color: #667eea; }
      .safe-btns { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
      .safe-btns button {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
      }
      .safe-btn-blue { background: #667eea; color: white; }
      .safe-btn-green { background: #34c759; color: white; }
      .safe-btn-orange { background: #ff9500; color: white; }
      .safe-btn-red { background: #ff3b30; color: white; }
      .safe-btn-purple { background: #5856d6; color: white; }
      .safe-msg {
        margin-top: 12px;
        padding: 10px;
        background: #0d0d1a;
        border-radius: 6px;
        font-size: 13px;
      }
      .progress-bar {
        height: 6px;
        background: #333;
        border-radius: 3px;
        overflow: hidden;
        margin: 15px 0;
      }
      .progress-fill {
        height: 100%;
        background: #667eea;
        width: 0%;
        transition: width 0.3s;
      }
      .progress-text { font-size: 12px; color: #888; margin-top: 5px; }
      .current-info {
        background: #2d2d44;
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
        border-left: 4px solid #667eea;
      }
      .current-info h4 { margin: 0 0 8px; color: #667eea; font-size: 14px; }
      .current-info p {
        background: #0d0d1a;
        padding: 12px;
        border-radius: 6px;
        color: #0f0;
        font-family: monospace;
        font-size: 13px;
        word-break: break-all;
        max-height: 80px;
        overflow: auto;
        margin: 0;
      }
      .queue-view {
        max-height: 150px;
        overflow: auto;
        margin-top: 10px;
      }
      .q-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: #2d2d44;
        border-radius: 6px;
        margin-bottom: 5px;
        font-size: 12px;
      }
      .q-row.done { opacity: 0.5; background: #1a3a1a; }
      .q-row.error { background: #3a1a1a; }
      .q-row.current { border: 2px solid #667eea; }
      .q-num {
        background: #667eea;
        color: white;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        flex-shrink: 0;
      }
      .q-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .q-status { font-size: 16px; }
      #safe-log {
        max-height: 100px;
        overflow: auto;
        background: #0d0d1a;
        padding: 8px;
        border-radius: 6px;
        margin-top: 10px;
        font-family: monospace;
        font-size: 11px;
      }
      .log-s { color: #34c759; }
      .log-e { color: #ff3b30; }
      .log-w { color: #ff9500; }
      .log-i { color: #5ac8fa; }
      .running-badge {
        background: #34c759;
        color: white;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        animation: safe-pulse 1s infinite;
      }
      @keyframes safe-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(styles);

    const btn = document.createElement('div');
    btn.id = 'safe-flow-btn';
    btn.textContent = '🚀 Safe Flow';
    document.body.appendChild(btn);

    const overlay = document.createElement('div');
    overlay.id = 'safe-flow-overlay';
    overlay.innerHTML = `
      <div id="safe-flow-modal">
        <div id="safe-flow-header">
          <h3>🚀 Safe Flow Automation</h3>
          <span id="safe-running-badge"></span>
          <button id="safe-close">✕</button>
        </div>
        
        <div class="safe-tabs">
          <button class="safe-tab active" data-t="input">📝 Input</button>
          <button class="safe-tab" data-t="run">▶️ Run</button>
          <button class="safe-tab" data-t="settings">⚙️ Settings</button>
        </div>
        
        <!-- INPUT -->
        <div class="safe-panel active" data-p="input">
          <textarea id="safe-json-input" placeholder='[{ "image_prompt": "...", "reference_image": [] }]'></textarea>
          <div class="safe-btns">
            <button id="safe-parse" class="safe-btn-blue">📥 Parse & Go</button>
            <button id="safe-sample" class="safe-btn-purple">📄 Sample</button>
            <button id="safe-clear" class="safe-btn-red">🗑️ Clear</button>
          </div>
          <div id="safe-msg" class="safe-msg"></div>
        </div>
        
        <!-- RUN -->
        <div class="safe-panel" data-p="run">
          <div class="progress-bar"><div class="progress-fill" id="safe-prog-fill"></div></div>
          <div class="progress-text" id="safe-prog-text">0 / 0</div>
          
          <div class="current-info">
            <h4>Current Prompt</h4>
            <p id="safe-current-text">-</p>
            <p style="font-size:12px;color:#888;margin:5px 0 0;" id="safe-current-refs"></p>
          </div>
          
          <div class="safe-btns">
            <button id="safe-start" class="safe-btn-green">▶️ Start</button>
            <button id="safe-pause" class="safe-btn-orange" style="display:none">⏸️ Pause</button>
            <button id="safe-resume" class="safe-btn-green" style="display:none">▶️ Resume</button>
            <button id="safe-stop" class="safe-btn-red" style="display:none">⏹️ Stop</button>
            <button id="safe-next" class="safe-btn-blue">⏭️ Next</button>
            <button id="safe-reset" class="safe-btn-purple">🔄 Reset</button>
          </div>
          
          <div class="queue-view" id="safe-queue-view"></div>
          <div id="safe-log"></div>
        </div>
        
        <!-- SETTINGS -->
        <div class="safe-panel" data-p="settings">
          <label style="display:flex;gap:10px;align-items:center;font-size:13px;margin-bottom:8px">
            <span style="width:140px">Typing delay (ms):</span>
            <input type="number" id="set-typing" value="20" min="10" max="100" 
                   style="flex:1;padding:8px;background:#0d0d1a;border:1px solid #333;color:white;border-radius:4px">
          </label>
          <label style="display:flex;gap:10px;align-items:center;font-size:13px;margin-bottom:8px">
            <span style="width:140px">Submit wait (ms):</span>
            <input type="number" id="set-submit" value="4000" min="1000" max="30000"
                   style="flex:1;padding:8px;background:#0d0d1a;border:1px solid #333;color:white;border-radius:4px">
          </label>
          <label style="display:flex;gap:10px;align-items:center;font-size:13px;margin-bottom:8px">
            <span style="width:140px">Image wait (ms):</span>
            <input type="number" id="set-image" value="1500" min="500" max="10000"
                   style="flex:1;padding:8px;background:#0d0d1a;border:1px solid #333;color:white;border-radius:4px">
          </label>
          <div class="safe-btns" style="margin-top:15px">
            <button id="safe-save" class="safe-btn-blue">💾 Save Settings</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    return { overlay, btn };
  }

  /* ==================== HELPERS ==================== */
  const $ = s => document.querySelector(`[id*="${s}"]`);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  
  function log(msg, type = 'i') {
    const el = $('#safe-log');
    if (!el || !document.getElementById('safe-log')) return;
    
    const div = document.createElement('div');
    div.className = `log-${type}`;
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    el.insertBefore(div, el.firstChild);
    while (el.children.length > 25) el.removeChild(el.lastChild);
    
    console.log(`[SafeFlow] ${msg}`);
  }

  async function wait(ms) {
    return new Promise(resolve => {
      const timer = setTimeout(resolve, ms);
      STATE.timeouts.push(timer);
    });
  }

  function clearTimeouts() {
    STATE.timeouts.forEach(t => clearTimeout(t));
    STATE.timeouts = [];
  }

  function updateUI() {
    try {
      const done = STATE.queue.filter(q => q.done).length;
      const total = STATE.queue.length;
      
      const progFill = $('#safe-prog-fill');
      const progText = $('#safe-prog-text');
      if (progFill) progFill.style.width = total ? `${(done/total)*100}%` : '0%';
      if (progText) progText.textContent = `${done}/${total}`;
      
      const badge = $('#safe-running-badge');
      if (badge) {
        badge.textContent = STATE.running ? ' 🔄 Running...' : '';
        if (STATE.running) badge.style.display = 'block';
        else badge.style.display = 'none';
      }
      
      // Queue view
      const queueView = $('#safe-queue-view');
      if (queueView) queueView.innerHTML = '';
      
      STATE.queue.forEach((q, i) => {
        if (!queueView) return;
        const row = document.createElement('div');
        row.className = 'q-row';
        if (q.done) row.classList.add('done');
        if (q.error) row.classList.add('error');
        if (i === STATE.currentIdx && STATE.running) row.classList.add('current');
        
        row.innerHTML = `
          <div class="q-num">${i+1}</div>
          <div class="q-text">${String(q.image_prompt || '').substring(0, 40)}...</div>
          <div class="q-status">${q.done ? '✅' : q.error ? '❌' : '⏳'}</div>
        `;
        queueView.appendChild(row);
      });
      
      // Current info
      const txtEl = $('#safe-current-text');
      const refsEl = $('#safe-current-refs');
      if (txtEl && STATE.currentIdx >= 0 && STATE.currentIdx < STATE.queue.length) {
        const q = STATE.queue[STATE.currentIdx];
        txtEl.textContent = q.image_prompt;
        refsEl.textContent = q.reference_image?.length 
          ? `📎 ${q.reference_image.length} reference(s)` 
          : 'No references';
      }
      
    } catch (err) {
      log(`UI Update Error: ${err.message}`, 'e');
    }
  }

  /* ==================== DOM FINDING ==================== */
  function findEditor() {
    try {
      const selectors = [
        'div[data-slate-editor="true"][contenteditable]',
        'div[role="textbox"][contenteditable="true"]',
        '[contenteditable][data-slate-node="value"]',
        '[contenteditable][data-slate-editor="true"]',
        'div.sc-84e494b2-5[contenteditable]'
      ];
      
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.contentEditable === 'true') return el;
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  function findSubmitBtn() {
    try {
      const buttons = $$('.button, button');
      for (const btn of buttons) {
        const icon = btn.querySelector('i');
        if (icon && (icon.textContent.includes('arrow_forward') || icon.textContent.includes('send'))) {
          return btn;
        }
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  function findClearBtn() {
    try {
      const buttons = $$('.button, button');
      for (const btn of buttons) {
        const icon = btn.querySelector('i');
        if (icon && icon.textContent.includes('close')) {
          return btn;
        }
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  /* ==================== CORE FUNCTIONS ==================== */
  async function typeText(text) {
    const editor = findEditor();
    if (!editor) {
      throw new Error('Text editor not found');
    }

    try {
      // Focus
      editor.focus();
      await wait(100);

      // Try clear
      const clearBtn = findClearBtn();
      if (clearBtn) {
        clearBtn.click();
        await wait(200);
      } else {
        document.execCommand('selectAll');
        await wait(50);
        document.execCommand('delete');
        await wait(50);
      }

      editor.focus();
      await wait(100);

      // Type character by character
      for (let i = 0; i < text.length; i++) {
        if (!STATE.running) return;
        while (STATE.paused) await wait(50);

        const char = text[i];

        // Dispatch three different events
        const inputEvent = new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: char
        });
        editor.dispatchEvent(inputEvent);

        document.execCommand('insertText', false, char);

        const keyDown = new KeyboardEvent('keydown', {
          key: char,
          code: char === ' ' ? 'Space' : `Key${char.toUpperCase()}`,
          bubbles: true,
          cancelable: true
        });
        editor.dispatchEvent(keyDown);

        await wait(SETTINGS.typingDelay);
      }

      await wait(SETTINGS.afterTyping || 300);

      // Verify
      const content = editor.textContent || '';
      if (content.length < 3 && text.length > 3) {
        throw new Error('Text may not have been set properly');
      }

      log(`Typed: "${text.substring(0, 30)}..."`, 's');

    } catch (err) {
      throw err;
    }
  }

  async function pasteImage(url) {
    try {
      log(`Fetching image...`, 'i');

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let blob = await res.blob();

      // Convert to PNG
      if (blob.type !== 'image/png') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const objUrl = URL.createObjectURL(blob);
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => resolve(); // Continue even if fails
          img.src = objUrl;
        });

        const canvas = document.createElement('canvas');
        try {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d').drawImage(img, 0, 0);
          blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        } catch {}
        
        URL.revokeObjectURL(objUrl);
      }

      // Write to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      const editor = findEditor();
      if (editor) editor.focus();
      await wait(100);

      document.execCommand('paste');
      await wait(SETTINGS.imageWait);

      log('Image pasted', 's');

    } catch (err) {
      log(`Image failed: ${err.message}`, 'e');
      return false;
    }
  }

  async function clickSubmit() {
    const btn = findSubmitBtn();
    if (!btn) {
      log('Submit button not found', 'w');
      return false;
    }

    btn.click();
    log('Clicked submit', 's');
    await wait(SETTINGS.submitWait);
    return true;
  }

  async function processItem(index) {
    const item = STATE.queue[index];
    STATE.currentIdx = index;
    updateUI();

    log(`Processing ${index + 1}/${STATE.queue.length}`, 'i');

    try {
      // Reference images first
      if (item.reference_image && item.reference_image.length > 0) {
        for (const url of item.reference_image) {
          if (!STATE.running) break;
          while (STATE.paused) await wait(50);
          await pasteImage(url);
        }
      }

      // Type prompt
      await typeText(item.image_prompt);

      // Submit
      await clickSubmit();

      item.done = true;
      log(`Done! ${index + 1}`, 's');

    } catch (err) {
      item.error = err.message;
      log(`Error: ${err.message}`, 'e');
    }

    updateUI();
  }

  /* ==================== QUEUE MANAGEMENT ==================== */
  async function runAll() {
    if (STATE.queue.length === 0) {
      alert('Queue is empty! Add prompts first.');
      return;
    }

    STATE.running = true;
    STATE.paused = false;

    $('#safe-start').style.display = 'none';
    $('#safe-pause').style.display = '';
    $('#safe-stop').style.display = '';

    log('Starting queue...', 'i');
    clearTimeouts();
    updateUI();

    for (let i = 0; i < STATE.queue.length; i++) {
      if (!STATE.running) break;

      while (STATE.paused) {
        await wait(200);
        if (!STATE.running) break;
      }

      if (!STATE.running) break;
      if (STATE.queue[i].done) continue;

      await processItem(i);

      if (i < STATE.queue.length - 1 && STATE.running) {
        await wait(SETTINGS.nextWait);
      }
    }

    STATE.running = false;
    STATE.currentIdx = -1;

    $('#safe-start').style.display = '';
    $('#safe-pause').style.display = 'none';
    $('#safe-resume').style.display = 'none';
    $('#safe-stop').style.display = 'none';

    const done = STATE.queue.filter(q => q.done).length;
    log(`Finished! ${done}/${STATE.queue.length}`, 's');
    updateUI();

    if (done === STATE.queue.length) {
      alert(`🎉 All ${done} prompts completed successfully!`);
    }
  }

  async function processNext() {
    const next = STATE.queue.findIndex(q => !q.done && !q.error);
    if (next === -1) {
      log('No pending items', 'w');
      alert('No pending prompts in queue.');
      return;
    }

    STATE.running = true;
    await processItem(next);
    STATE.running = false;
  }

  /* ==================== JSON HANDLING ==================== */
  function parseJSON() {
    try {
      const input = $('#safe-json-input').value.trim();
      const msg = $('#safe-msg');

      if (!input) {
        msg.innerHTML = '<span style="color:#ff3b30">⚠️ Please enter JSON array</span>';
        return;
      }

      const data = JSON.parse(input);
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('JSON must be a non-empty array');
      }

      // Validate each item
      for (let i = 0; i < data.length; i++) {
        if (!data[i].image_prompt) {
          throw new Error(`Item ${i + 1} missing "image_prompt"`);
        }
      }

      STATE.queue = data.map(item => ({
        image_prompt: String(item.image_prompt),
        reference_image: Array.isArray(item.reference_image) ? item.reference_image : [],
        done: false,
        error: null
      }));

      STATE.currentIdx = 0;
      STATE.queue[0].done = false;

      msg.innerHTML = `<span style="color:#34c759">✅ Loaded ${STATE.queue.length} prompts</span>`;

      switchTab('run');
      updateUI();
      log(`Loaded ${STATE.queue.length} items`, 's');

    } catch (err) {
      $('#safe-msg').innerHTML = `<span style="color:#ff3b30">❌ ${err.message}</span>`;
      log('Parse error: ' + err.message, 'e');
    }
  }

  function loadSample() {
    const sample = [
      { image_prompt: "A beautiful mountain landscape at sunset with dramatic clouds", reference_image: [] },
      { image_prompt: "Cyberpunk cityscape at night with neon lights and rain", reference_image: [] },
      { image_prompt: "Cute anime girl with blue hair in a garden setting", reference_image: ["https://picsum.photos/400/400"] }
    ];
    $('#safe-json-input').value = JSON.stringify(sample, null, 2);
    log('Sample loaded', 's');
  }

  /* ==================== TABS & EVENTS ==================== */
  function switchTab(name) {
    $$('.safe-tab').forEach(t => t.classList.toggle('active', t.dataset.t === name));
    $$('.safe-panel').forEach(p => p.classList.toggle('active', p.dataset.p === name));
  }

  function saveSettings() {
    SETTINGS.typingDelay = parseInt($('#set-typing').value) || 20;
    SETTINGS.submitWait = parseInt($('#set-submit').value) || 4000;
    SETTINGS.imageWait = parseInt($('#set-image').value) || 1500;
    alert('✅ Settings saved!');
    log('Settings saved', 's');
  }

  function resetAll() {
    if (!confirm('Reset all progress?')) return;
    
    STATE.queue.forEach(q => {
      q.done = false;
      q.error = null;
    });
    STATE.currentIdx = 0;
    if (STATE.queue.length > 0) {
      STATE.queue[0].done = false;
    }
    
    $('#safe-log').innerHTML = '';
    updateUI();
    log('Reset complete', 's');
  }

  // Create UI
  const { overlay, btn } = createUI();

  // Event listeners
  btn.onclick = () => overlay.style.display = 'block';
  $('#safe-close').onclick = () => overlay.style.display = 'none';
  
  $$('.safe-tab').forEach(t => t.onclick = () => switchTab(t.dataset.t));
  
  $('#safe-parse').onclick = parseJSON;
  $('#safe-sample').onclick = loadSample;
  $('#safe-clear').onclick = () => {
    $('#safe-json-input').value = '';
    $('#safe-msg').innerHTML = '';
  };
  
  $('#safe-start').onclick = runAll;
  
  $('#safe-pause').onclick = () => {
    STATE.paused = true;
    $('#safe-pause').style.display = 'none';
    $('#safe-resume').style.display = '';
    log('Paused', 'w');
  };
  
  $('#safe-resume').onclick = () => {
    STATE.paused = false;
    $('#safe-pause').style.display = '';
    $('#safe-resume').style.display = 'none';
    log('Resumed', 's');
  };
  
  $('#safe-stop').onclick = () => {
    STATE.running = false;
    STATE.paused = false;
    clearTimeouts();
    log('Stopped', 'w');
  };
  
  $('#safe-next').onclick = processNext;
  $('#safe-reset').onclick = resetAll;
  $('#safe-save').onclick = saveSettings;

  // Clean up on close
  overlay.onclick = (e) => {
    if (e.target.id === 'safe-flow-overlay') {
      clearTimeouts();
      STATE.running = false;
      STATE.paused = false;
    }
  };

  log('Safe Flow loaded!', 's');
})();
