(function () {
  if (window.__FLOW_AUTO__) return;
  window.__FLOW_AUTO__ = true;

  /* ---------- STYLES ---------- */
  const style = document.createElement("style");
  style.textContent = `
    #flow-btn {
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 999999;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 12px 18px;
      border-radius: 8px;
      cursor: pointer;
      font-family: sans-serif;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    #flow-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.9);
      z-index: 999998;
      display: none;
      overflow: auto;
    }
    #flow-modal {
      background: #1a1a2e;
      width: 90%;
      max-width: 800px;
      margin: 3% auto;
      border-radius: 12px;
      padding: 20px;
      font-family: sans-serif;
      color: #fff;
    }
    #flow-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #333;
    }
    #flow-close {
      background: #ff3b30;
      border: none;
      color: #fff;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }
    .flow-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 15px;
    }
    .flow-tab {
      padding: 10px 16px;
      background: #2d2d44;
      border: none;
      border-radius: 6px;
      color: #aaa;
      cursor: pointer;
      font-size: 13px;
    }
    .flow-tab.active {
      background: #667eea;
      color: #fff;
    }
    .flow-panel {
      display: none;
    }
    .flow-panel.active {
      display: block;
    }
    #flow-json {
      width: 100%;
      height: 180px;
      background: #0d0d1a;
      border: 2px solid #333;
      border-radius: 8px;
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 12px;
      resize: vertical;
    }
    .flow-btns {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .flow-btns button {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }
    .b-blue { background: #667eea; color: #fff; }
    .b-green { background: #34c759; color: #fff; }
    .b-orange { background: #ff9500; color: #fff; }
    .b-red { background: #ff3b30; color: #fff; }
    .b-purple { background: #5856d6; color: #fff; }
    .b-teal { background: #5ac8fa; color: #fff; }
    #flow-msg {
      margin-top: 12px;
      padding: 10px;
      background: #0d0d1a;
      border-radius: 6px;
      font-size: 13px;
    }
    .progress-wrap {
      margin: 15px 0;
    }
    .progress-bar {
      height: 6px;
      background: #333;
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #667eea;
      width: 0%;
      transition: width 0.3s;
    }
    .progress-label {
      font-size: 12px;
      color: #888;
      margin-top: 5px;
    }
    .current-box {
      background: #2d2d44;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #667eea;
    }
    .current-box h4 {
      margin: 0 0 8px;
      color: #667eea;
      font-size: 14px;
    }
    .current-box .text {
      background: #0d0d1a;
      padding: 12px;
      border-radius: 6px;
      color: #0f0;
      font-family: monospace;
      font-size: 13px;
      word-break: break-word;
      max-height: 100px;
      overflow: auto;
    }
    .current-box .refs {
      margin-top: 8px;
      font-size: 11px;
      color: #888;
    }
    .queue-list {
      max-height: 200px;
      overflow: auto;
      margin-top: 10px;
    }
    .q-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: #2d2d44;
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .q-item.done { opacity: 0.5; background: #1a3a1a; }
    .q-item.active { border: 2px solid #667eea; }
    .q-item.error { background: #3a1a1a; }
    .q-num {
      background: #667eea;
      color: #fff;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
    }
    .q-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .q-status { font-size: 16px; }
    #flow-log {
      max-height: 120px;
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
    .status-running {
      background: #34c759;
      color: #fff;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);

  /* ---------- STATE ---------- */
  let queue = [];
  let idx = -1;
  let running = false;
  let paused = false;

  const DELAY = {
    typing: 15,        // ms between characters
    afterType: 300,    // ms after typing complete
    afterImage: 1500,  // ms after pasting image
    afterSubmit: 4000, // ms after clicking submit
    beforeNext: 1000   // ms before next prompt
  };

  /* ---------- CREATE UI ---------- */
  const btn = document.createElement("div");
  btn.id = "flow-btn";
  btn.innerHTML = "🚀 Flow";
  document.body.appendChild(btn);

  const overlay = document.createElement("div");
  overlay.id = "flow-overlay";
  overlay.innerHTML = `
    <div id="flow-modal">
      <div id="flow-header">
        <h3 style="margin:0">🚀 Auto Flow</h3>
        <span id="flow-running-status"></span>
        <button id="flow-close">✕</button>
      </div>
      
      <div class="flow-tabs">
        <button class="flow-tab active" data-t="input">📝 Input</button>
        <button class="flow-tab" data-t="run">▶️ Run</button>
        <button class="flow-tab" data-t="settings">⚙️ Settings</button>
      </div>
      
      <!-- INPUT PANEL -->
      <div class="flow-panel active" data-p="input">
        <textarea id="flow-json" placeholder='[{"image_prompt":"text","reference_image":[]}]'></textarea>
        <div class="flow-btns">
          <button id="btn-parse" class="b-blue">📥 Parse & Go</button>
          <button id="btn-sample" class="b-purple">📄 Sample</button>
          <button id="btn-clear" class="b-red">🗑️</button>
        </div>
        <div id="flow-msg"></div>
      </div>
      
      <!-- RUN PANEL -->
      <div class="flow-panel" data-p="run">
        <div class="progress-wrap">
          <div class="progress-bar"><div class="progress-fill" id="prog-fill"></div></div>
          <div class="progress-label" id="prog-label">0/0</div>
        </div>
        
        <div class="current-box" id="current-box">
          <h4>Current Prompt</h4>
          <div class="text" id="current-text">-</div>
          <div class="refs" id="current-refs"></div>
        </div>
        
        <div class="flow-btns">
          <button id="btn-start" class="b-green">▶️ Start</button>
          <button id="btn-pause" class="b-orange" style="display:none">⏸️ Pause</button>
          <button id="btn-resume" class="b-green" style="display:none">▶️ Resume</button>
          <button id="btn-stop" class="b-red" style="display:none">⏹️ Stop</button>
          <button id="btn-next" class="b-teal">⏭️ Next One</button>
          <button id="btn-reset" class="b-purple">🔄 Reset</button>
        </div>
        
        <div class="queue-list" id="queue-list"></div>
        <div id="flow-log"></div>
      </div>
      
      <!-- SETTINGS PANEL -->
      <div class="flow-panel" data-p="settings">
        <p style="color:#888;font-size:13px">Timing Settings (ms):</p>
        <div style="display:grid;gap:10px;margin-top:10px">
          <label style="display:flex;gap:10px;align-items:center;font-size:13px">
            <span style="width:150px">Typing speed:</span>
            <input type="number" id="set-typing" value="15" min="5" max="100" style="flex:1;padding:8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px">
            <span style="color:#666">ms/char</span>
          </label>
          <label style="display:flex;gap:10px;align-items:center;font-size:13px">
            <span style="width:150px">After submit wait:</span>
            <input type="number" id="set-submit" value="4000" min="1000" max="30000" style="flex:1;padding:8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px">
            <span style="color:#666">ms</span>
          </label>
          <label style="display:flex;gap:10px;align-items:center;font-size:13px">
            <span style="width:150px">After image wait:</span>
            <input type="number" id="set-image" value="1500" min="500" max="10000" style="flex:1;padding:8px;background:#0d0d1a;border:1px solid #333;color:#fff;border-radius:4px">
            <span style="color:#666">ms</span>
          </label>
        </div>
        <div class="flow-btns" style="margin-top:15px">
          <button id="btn-save-settings" class="b-blue">💾 Save</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ---------- HELPERS ---------- */
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function log(msg, type = 'i') {
    const el = $('#flow-log');
    if (!el) return;
    const d = document.createElement('div');
    d.className = `log-${type}`;
    d.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    el.insertBefore(d, el.firstChild);
    while (el.children.length > 30) el.removeChild(el.lastChild);
    console.log(`[Flow] ${msg}`);
  }

  function updateUI() {
    const done = queue.filter(q => q.done).length;
    const total = queue.length;
    
    $('#prog-fill').style.width = total ? `${(done/total)*100}%` : '0%';
    $('#prog-label').textContent = `${done}/${total} completed`;
    
    // Queue list
    const list = $('#queue-list');
    list.innerHTML = '';
    queue.forEach((q, i) => {
      const div = document.createElement('div');
      div.className = 'q-item';
      if (q.done) div.classList.add('done');
      if (q.error) div.classList.add('error');
      if (i === idx && running) div.classList.add('active');
      
      div.innerHTML = `
        <div class="q-num">${i+1}</div>
        <div class="q-text">${q.image_prompt.substring(0,50)}...</div>
        <div class="q-status">${q.done ? '✅' : q.error ? '❌' : '⏳'}</div>
      `;
      list.appendChild(div);
    });
    
    // Current
    if (idx >= 0 && idx < queue.length) {
      const q = queue[idx];
      $('#current-text').textContent = q.image_prompt;
      $('#current-refs').textContent = q.reference_image?.length 
        ? `📎 ${q.reference_image.length} reference(s)` 
        : 'No references';
    }
    
    // Running status
    $('#flow-running-status').innerHTML = running 
      ? '<span class="status-running">🔄 Running...</span>' 
      : '';
  }

  /* ---------- FIND ELEMENTS ---------- */
  function findEditor() {
    // Multiple selectors for Slate editor
    const selectors = [
      'div[data-slate-editor="true"]',
      'div[role="textbox"][contenteditable="true"]',
      '[contenteditable="true"][data-slate-node="value"]',
      '.sc-84e494b2-5[contenteditable="true"]'
    ];
    
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function findSubmitBtn() {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      const icon = b.querySelector('i');
      if (icon && icon.textContent.includes('arrow_forward')) {
        return b;
      }
    }
    return null;
  }

  function findClearBtn() {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      const icon = b.querySelector('i');
      const span = b.querySelector('span');
      if (icon && icon.textContent.includes('close')) {
        if (span && span.textContent.toLowerCase().includes('clear')) {
          return b;
        }
      }
    }
    return null;
  }

  /* ---------- CORE: TYPE TEXT ---------- */
  async function typeText(text) {
    const editor = findEditor();
    if (!editor) throw new Error('Editor not found');

    // Focus
    editor.focus();
    await wait(100);

    // Clear existing
    const clearBtn = findClearBtn();
    if (clearBtn) {
      clearBtn.click();
      await wait(300);
    } else {
      document.execCommand('selectAll');
      await wait(50);
      document.execCommand('delete');
      await wait(100);
    }

    // Re-focus
    editor.focus();
    await wait(100);

    // Type character by character using InputEvent
    for (let i = 0; i < text.length; i++) {
      if (!running && !paused) break; // Stop if cancelled
      
      while (paused) {
        await wait(100); // Wait while paused
      }

      const char = text[i];
      
      // Method 1: InputEvent with insertText
      const inputEvent = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: char
      });
      editor.dispatchEvent(inputEvent);

      // Method 2: Also try execCommand
      document.execCommand('insertText', false, char);

      // Method 3: KeyboardEvent
      const keyDown = new KeyboardEvent('keydown', {
        key: char,
        code: char === ' ' ? 'Space' : `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true
      });
      editor.dispatchEvent(keyDown);

      const keyUp = new KeyboardEvent('keyup', {
        key: char,
        code: char === ' ' ? 'Space' : `Key${char.toUpperCase()}`,
        bubbles: true
      });
      editor.dispatchEvent(keyUp);

      await wait(DELAY.typing);
    }

    await wait(DELAY.afterType);

    // Verify
    const content = editor.textContent || '';
    if (content.length < 3) {
      throw new Error('Text not inserted');
    }

    log(`Typed: "${text.substring(0, 30)}..."`, 's');
    return true;
  }

  /* ---------- CORE: PASTE IMAGE ---------- */
  async function pasteImage(url) {
    try {
      log(`Fetching: ${url.substring(0, 40)}...`, 'i');

      // Fetch
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
          img.onerror = reject;
          img.src = objUrl;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        
        blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        URL.revokeObjectURL(objUrl);
      }

      // Write to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      // Focus editor
      const editor = findEditor();
      if (editor) editor.focus();
      await wait(100);

      // Paste
      document.execCommand('paste');

      await wait(DELAY.afterImage);
      log('Image pasted', 's');
      return true;

    } catch (err) {
      log(`Image failed: ${err.message}`, 'e');
      return false;
    }
  }

  /* ---------- CORE: CLICK SUBMIT ---------- */
  async function clickSubmit() {
    const btn = findSubmitBtn();
    if (!btn) {
      log('Submit button not found', 'e');
      return false;
    }

    btn.click();
    log('Submitted!', 's');
    await wait(DELAY.afterSubmit);
    return true;
  }

  /* ---------- PROCESS ONE ITEM ---------- */
  async function processItem(index) {
    const item = queue[index];
    idx = index;
    updateUI();

    log(`Processing ${index + 1}/${queue.length}`, 'i');

    try {
      // 1. Paste reference images first
      if (item.reference_image && item.reference_image.length > 0) {
        for (const url of item.reference_image) {
          if (!running) break;
          while (paused) await wait(100);
          await pasteImage(url);
        }
      }

      // 2. Type prompt
      await typeText(item.image_prompt);

      // 3. Submit
      await clickSubmit();

      item.done = true;
      log(`Done ${index + 1}!`, 's');

    } catch (err) {
      item.error = err.message;
      log(`Error: ${err.message}`, 'e');
    }

    updateUI();
  }

  /* ---------- RUN QUEUE ---------- */
  async function runAll() {
    if (queue.length === 0) {
      log('Queue empty', 'w');
      return;
    }

    running = true;
    paused = false;

    $('#btn-start').style.display = 'none';
    $('#btn-pause').style.display = '';
    $('#btn-stop').style.display = '';

    log('Starting...', 'i');
    updateUI();

    for (let i = 0; i < queue.length; i++) {
      if (!running) break;

      while (paused) {
        await wait(200);
        if (!running) break;
      }

      if (!running) break;
      if (queue[i].done) continue;

      await processItem(i);

      if (i < queue.length - 1 && running) {
        await wait(DELAY.beforeNext);
      }
    }

    running = false;
    idx = -1;

    $('#btn-start').style.display = '';
    $('#btn-pause').style.display = 'none';
    $('#btn-resume').style.display = 'none';
    $('#btn-stop').style.display = 'none';

    const done = queue.filter(q => q.done).length;
    log(`Finished! ${done}/${queue.length} done`, 's');
    updateUI();

    if (done === queue.length) {
      alert('🎉 All prompts completed!');
    }
  }

  /* ---------- PROCESS NEXT ONE ---------- */
  async function processNext() {
    const nextIdx = queue.findIndex(q => !q.done && !q.error);
    if (nextIdx === -1) {
      log('No pending items', 'w');
      return;
    }

    running = true;
    await processItem(nextIdx);
    running = false;
  }

  /* ---------- PARSE JSON ---------- */
  function parseJSON() {
    const input = $('#flow-json').value.trim();
    const msg = $('#flow-msg');

    if (!input) {
      msg.innerHTML = '<span style="color:#ff3b30">⚠️ Enter JSON</span>';
      return;
    }

    try {
      const data = JSON.parse(input);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Must be non-empty array');
      }

      queue = data.map((item, i) => {
        if (!item.image_prompt) {
          throw new Error(`Item ${i + 1}: missing image_prompt`);
        }
        return {
          image_prompt: String(item.image_prompt),
          reference_image: Array.isArray(item.reference_image) ? item.reference_image : [],
          done: false,
          error: null
        };
      });

      idx = 0;
      msg.innerHTML = `<span style="color:#34c759">✅ Loaded ${queue.length} prompts</span>`;

      // Switch to run tab
      switchTab('run');
      updateUI();
      log(`Loaded ${queue.length}`, 's');

    } catch (err) {
      msg.innerHTML = `<span style="color:#ff3b30">❌ ${err.message}</span>`;
    }
  }

  /* ---------- SAMPLE ---------- */
  function loadSample() {
    const sample = [
      {
        image_prompt: "A beautiful sunset over mountains with dramatic clouds",
        reference_image: []
      },
      {
        image_prompt: "Cyberpunk city at night with neon lights",
        reference_image: []
      }
    ];
    $('#flow-json').value = JSON.stringify(sample, null, 2);
  }

  /* ---------- SWITCH TAB ---------- */
  function switchTab(name) {
    $$('.flow-tab').forEach(t => t.classList.toggle('active', t.dataset.t === name));
    $$('.flow-panel').forEach(p => p.classList.toggle('active', p.dataset.p === name));
  }

  /* ---------- SAVE SETTINGS ---------- */
  function saveSettings() {
    DELAY.typing = parseInt($('#set-typing').value) || 15;
    DELAY.afterSubmit = parseInt($('#set-submit').value) || 4000;
    DELAY.afterImage = parseInt($('#set-image').value) || 1500;
    alert('✅ Settings saved!');
    log('Settings saved', 's');
  }

  /* ---------- EVENTS ---------- */
  btn.onclick = () => overlay.style.display = 'block';
  $('#flow-close').onclick = () => overlay.style.display = 'none';

  $$('.flow-tab').forEach(t => {
    t.onclick = () => switchTab(t.dataset.t);
  });

  $('#btn-parse').onclick = parseJSON;
  $('#btn-sample').onclick = loadSample;
  $('#btn-clear').onclick = () => {
    $('#flow-json').value = '';
    $('#flow-msg').innerHTML = '';
  };

  $('#btn-start').onclick = runAll;
  
  $('#btn-pause').onclick = () => {
    paused = true;
    $('#btn-pause').style.display = 'none';
    $('#btn-resume').style.display = '';
    log('Paused', 'w');
  };

  $('#btn-resume').onclick = () => {
    paused = false;
    $('#btn-pause').style.display = '';
    $('#btn-resume').style.display = 'none';
    log('Resumed', 'i');
  };

  $('#btn-stop').onclick = () => {
    running = false;
    paused = false;
    log('Stopped', 'w');
  };

  $('#btn-next').onclick = processNext;

  $('#btn-reset').onclick = () => {
    queue.forEach(q => {
      q.done = false;
      q.error = null;
    });
    idx = 0;
    $('#flow-log').innerHTML = '';
    updateUI();
    log('Reset', 'i');
  };

  $('#btn-save-settings').onclick = saveSettings;

  log('Flow Auto loaded!', 's');
})();
