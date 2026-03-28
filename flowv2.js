(function () {
  if (window.__FLOW_AUTOMATION__) return;
  window.__FLOW_AUTOMATION__ = true;

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
      max-width: 900px;
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
      padding-bottom: 15px;
      border-bottom: 1px solid #333;
      margin-bottom: 15px;
    }
    #flow-header h2 {
      margin: 0;
      font-size: 20px;
    }
    #flow-close {
      background: #ff3b30;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }
    #flow-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    .flow-tab {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      background: #2d2d44;
      color: #aaa;
    }
    .flow-tab.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
    .flow-section {
      display: none;
    }
    .flow-section.active {
      display: block;
    }
    #flow-json-input {
      width: 100%;
      height: 250px;
      background: #0d0d1a;
      border: 2px solid #333;
      border-radius: 8px;
      color: #00ff88;
      font-family: monospace;
      font-size: 13px;
      padding: 15px;
      resize: vertical;
    }
    #flow-json-input:focus {
      border-color: #667eea;
      outline: none;
    }
    .flow-template {
      background: #0d0d1a;
      border-radius: 8px;
      padding: 12px;
      margin: 10px 0;
      font-family: monospace;
      font-size: 11px;
      color: #888;
    }
    #flow-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    #flow-actions button {
      padding: 10px 18px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .btn-primary { background: #667eea; color: #fff; }
    .btn-success { background: #34c759; color: #fff; }
    .btn-warning { background: #ff9500; color: #fff; }
    .btn-danger { background: #ff3b30; color: #fff; }
    .btn-secondary { background: #5856d6; color: #fff; }
    .btn-teal { background: #5ac8fa; color: #fff; }
    #flow-status {
      margin-top: 15px;
      padding: 12px;
      background: #0d0d1a;
      border-radius: 8px;
      font-size: 13px;
    }
    .progress-bar {
      height: 8px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s;
    }
    #flow-log {
      max-height: 200px;
      overflow-y: auto;
      background: #0d0d1a;
      padding: 10px;
      border-radius: 8px;
      margin-top: 10px;
      font-family: monospace;
      font-size: 12px;
    }
    .log-entry { padding: 4px 0; border-bottom: 1px solid #222; }
    .log-success { color: #34c759; }
    .log-error { color: #ff3b30; }
    .log-info { color: #5ac8fa; }
    .log-warning { color: #ff9500; }
    .queue-item {
      background: #2d2d44;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .queue-item.completed { opacity: 0.6; background: #1a3d1a; }
    .queue-item.current { border: 2px solid #667eea; }
    .queue-item.error { background: #3d1a1a; }
    .queue-num {
      background: #667eea;
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
    .queue-content { flex: 1; overflow: hidden; }
    .queue-prompt {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
    }
    .queue-refs { font-size: 11px; color: #888; margin-top: 4px; }
    .queue-status { font-size: 20px; }
    .setting-row {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
    }
    .setting-row label {
      flex: 0 0 200px;
      font-size: 13px;
      color: #aaa;
    }
    .setting-row input, .setting-row select {
      flex: 1;
      padding: 8px 12px;
      border: 2px solid #333;
      border-radius: 6px;
      background: #0d0d1a;
      color: #fff;
      font-size: 13px;
    }
    .current-prompt-display {
      background: #2d2d44;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #667eea;
    }
    .current-prompt-display h4 {
      margin: 0 0 10px;
      color: #667eea;
    }
    .current-prompt-display .prompt-text {
      color: #fff;
      font-size: 14px;
      line-height: 1.5;
    }
    .current-prompt-display .ref-images {
      margin-top: 10px;
      font-size: 12px;
      color: #888;
    }
  `;
  document.head.appendChild(style);

  /* ---------- STATE ---------- */
  let queue = [];
  let currentIndex = -1;
  let isRunning = false;
  let isPaused = false;
  let settings = {
    delayBetweenPrompts: 3000,
    delayAfterImage: 1500,
    delayAfterTyping: 500,
    autoSubmit: true
  };

  /* ---------- BUTTON ---------- */
  const btn = document.createElement("div");
  btn.id = "flow-btn";
  btn.textContent = "🚀 Flow Automation";
  document.body.appendChild(btn);

  /* ---------- MODAL ---------- */
  const overlay = document.createElement("div");
  overlay.id = "flow-overlay";
  overlay.innerHTML = `
    <div id="flow-modal">
      <div id="flow-header">
        <h2>🚀 Flow Automation</h2>
        <button id="flow-close">✕ Close</button>
      </div>
      
      <div id="flow-tabs">
        <button class="flow-tab active" data-tab="input">📝 Input</button>
        <button class="flow-tab" data-tab="queue">📋 Queue</button>
        <button class="flow-tab" data-tab="test">🧪 Test</button>
        <button class="flow-tab" data-tab="settings">⚙️ Settings</button>
      </div>
      
      <div id="flow-content">
        <!-- Input Tab -->
        <div class="flow-section active" data-section="input">
          <div class="flow-template">
[{ "image_prompt": "Your prompt text...", "reference_image": ["url1", "url2"] }]
          </div>
          
          <textarea id="flow-json-input" placeholder='Paste JSON array here...'></textarea>
          
          <div id="flow-actions">
            <button id="flow-parse" class="btn-primary">📥 Parse JSON</button>
            <button id="flow-sample" class="btn-secondary">📄 Sample</button>
            <button id="flow-clear-input" class="btn-danger">🗑️ Clear</button>
          </div>
          
          <div id="flow-status"></div>
        </div>
        
        <!-- Queue Tab -->
        <div class="flow-section" data-section="queue">
          <div id="flow-progress" style="display: none;">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%;"></div>
            </div>
            <div class="progress-text">0 / 0</div>
          </div>
          
          <div id="flow-actions">
            <button id="flow-start" class="btn-success">▶️ Start</button>
            <button id="flow-pause" class="btn-warning" style="display: none;">⏸️ Pause</button>
            <button id="flow-resume" class="btn-success" style="display: none;">▶️ Resume</button>
            <button id="flow-stop" class="btn-danger" style="display: none;">⏹️ Stop</button>
            <button id="flow-next" class="btn-teal">⏭️ Next (Manual)</button>
            <button id="flow-reset" class="btn-secondary">🔄 Reset</button>
          </div>
          
          <div id="flow-current-prompt"></div>
          <div id="flow-queue"></div>
          <div id="flow-log"></div>
        </div>
        
        <!-- Test Tab -->
        <div class="flow-section" data-section="test">
          <h3>🧪 Test Prompt Input</h3>
          <p style="color: #888; font-size: 13px;">Test if the automation can set text in the editor</p>
          
          <div class="setting-row">
            <label>Test Prompt:</label>
            <input type="text" id="test-prompt" value="Test prompt text 123" style="flex: 2;">
          </div>
          
          <div id="flow-actions">
            <button id="flow-test-set" class="btn-primary">📝 Set Prompt</button>
            <button id="flow-test-clear" class="btn-warning">🗑️ Clear Editor</button>
            <button id="flow-test-submit" class="btn-success">🚀 Click Submit</button>
            <button id="flow-test-find" class="btn-teal">🔍 Find Elements</button>
          </div>
          
          <div id="flow-test-result" style="margin-top: 15px; padding: 12px; background: #0d0d1a; border-radius: 8px; font-size: 12px; font-family: monospace;"></div>
        </div>
        
        <!-- Settings Tab -->
        <div class="flow-section" data-section="settings">
          <div class="setting-row">
            <label>Delay between prompts (ms):</label>
            <input type="number" id="set-delay-prompts" value="3000" min="1000">
          </div>
          <div class="setting-row">
            <label>Delay after image paste (ms):</label>
            <input type="number" id="set-delay-image" value="1500" min="500">
          </div>
          <div class="setting-row">
            <label>Delay after typing (ms):</label>
            <input type="number" id="set-delay-typing" value="500" min="100">
          </div>
          <div class="setting-row">
            <label>Auto submit:</label>
            <select id="set-auto-submit">
              <option value="true">Yes</option>
              <option value="false">No - Manual submit</option>
            </select>
          </div>
          <div id="flow-actions">
            <button id="flow-save-settings" class="btn-primary">💾 Save</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ---------- UTILITY ---------- */
  function log(message, type = 'info') {
    const logDiv = document.getElementById('flow-log');
    if (logDiv) {
      const entry = document.createElement('div');
      entry.className = `log-entry log-${type}`;
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      logDiv.insertBefore(entry, logDiv.firstChild);
    }
    console.log(`[Flow] ${message}`);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function updateProgress() {
    const completed = queue.filter(q => q.status === 'completed').length;
    const total = queue.length;
    const percent = total > 0 ? (completed / total) * 100 : 0;
    
    const fill = document.querySelector('.progress-fill');
    const text = document.querySelector('.progress-text');
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${completed} / ${total}`;
  }

  function updateQueueUI() {
    const queueDiv = document.getElementById('flow-queue');
    if (!queueDiv) return;
    
    queueDiv.innerHTML = '';
    
    queue.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'queue-item';
      
      if (item.status === 'completed') div.classList.add('completed');
      if (item.status === 'error') div.classList.add('error');
      if (index === currentIndex && isRunning) div.classList.add('current');
      
      const statusIcon = {
        pending: '⏳',
        running: '🔄',
        completed: '✅',
        error: '❌'
      }[item.status] || '⏳';
      
      div.innerHTML = `
        <div class="queue-num">${index + 1}</div>
        <div class="queue-content">
          <div class="queue-prompt">${item.image_prompt.substring(0, 60)}...</div>
          <div class="queue-refs">📎 ${item.reference_image?.length || 0} refs</div>
        </div>
        <div class="queue-status">${statusIcon}</div>
      `;
      
      queueDiv.appendChild(div);
    });
    
    updateProgress();
  }

  function showCurrentPrompt(item) {
    const div = document.getElementById('flow-current-prompt');
    if (!div || !item) {
      if (div) div.innerHTML = '';
      return;
    }
    
    div.innerHTML = `
      <div class="current-prompt-display">
        <h4>📝 Current Prompt</h4>
        <div class="prompt-text">${item.image_prompt}</div>
        <div class="ref-images">
          ${item.reference_image?.length ? `📎 References: ${item.reference_image.join(', ')}` : 'No reference images'}
        </div>
      </div>
    `;
  }

  /* ---------- FIND EDITOR ELEMENTS ---------- */
  function findEditor() {
    // Try multiple selectors
    const selectors = [
      'div[data-slate-editor="true"]',
      'div[role="textbox"][contenteditable="true"]',
      '.sc-84e494b2-5[contenteditable="true"]',
      'div[contenteditable="true"][data-slate-node="value"]'
    ];
    
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function findSubmitButton() {
    // Find button with arrow_forward icon
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const icon = btn.querySelector('i.google-symbols');
      if (icon && icon.textContent.trim() === 'arrow_forward') {
        return btn;
      }
    }
    return null;
  }

  function findClearButton() {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const icon = btn.querySelector('i.google-symbols');
      const span = btn.querySelector('span');
      if (icon && icon.textContent.trim() === 'close') {
        if (span && span.textContent.toLowerCase().includes('clear')) {
          return btn;
        }
      }
    }
    return null;
  }

  /* ---------- CORE FUNCTIONS ---------- */

  // Set text in Slate editor - IMPROVED VERSION
  async function setPromptText(text) {
    const editor = findEditor();
    if (!editor) {
      throw new Error('Editor not found');
    }

    // Method 1: Direct manipulation for Slate.js
    try {
      // Focus
      editor.focus();
      await delay(100);

      // Find the text node or paragraph
      let textTarget = editor.querySelector('span[data-slate-string="true"]');
      if (!textTarget) {
        textTarget = editor.querySelector('span[data-slate-leaf="true"]');
      }
      if (!textTarget) {
        textTarget = editor.querySelector('p[data-slate-node="element"]');
      }

      if (textTarget) {
        // Select all text
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editor);
        selection.removeAllRanges();
        selection.addRange(range);
        await delay(50);
      }

      // Use keyboard simulation
      // First, select all
      document.execCommand('selectAll', false, null);
      await delay(50);

      // Delete existing content
      document.execCommand('delete', false, null);
      await delay(50);

      // Insert text character by character (more reliable for Slate)
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // Create and dispatch keyboard events
        const keydownEvent = new KeyboardEvent('keydown', {
          key: char,
          code: `Key${char.toUpperCase()}`,
          bubbles: true,
          cancelable: true
        });
        editor.dispatchEvent(keydownEvent);

        // Insert the character
        document.execCommand('insertText', false, char);
        
        // Small delay for stability
        if (i % 10 === 0) {
          await delay(10);
        }
      }

      await delay(100);

      // Dispatch input event
      editor.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: text
      }));

      // Also try dispatching on the paragraph
      const p = editor.querySelector('p');
      if (p) {
        p.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          cancelable: true
        }));
      }

      await delay(settings.delayAfterTyping);
      
      // Verify text was set
      const currentText = editor.textContent.trim();
      if (currentText.length < 5) {
        throw new Error('Text may not have been set properly');
      }

      log(`Set prompt: "${text.substring(0, 40)}..."`, 'success');
      return true;

    } catch (err) {
      log(`Method 1 failed: ${err.message}`, 'warning');
    }

    // Method 2: Clipboard paste
    try {
      log('Trying clipboard paste method...', 'info');
      
      await navigator.clipboard.writeText(text);
      
      editor.focus();
      await delay(100);
      
      document.execCommand('selectAll', false, null);
      await delay(50);
      document.execCommand('delete', false, null);
      await delay(50);
      
      document.execCommand('paste', false, null);
      await delay(200);

      // Verify
      const currentText = editor.textContent.trim();
      if (currentText.includes(text.substring(0, 20))) {
        log('Clipboard paste successful', 'success');
        return true;
      }

    } catch (err) {
      log(`Method 2 failed: ${err.message}`, 'warning');
    }

    // Method 3: Direct innerHTML manipulation (last resort)
    try {
      log('Trying direct DOM manipulation...', 'info');
      
      const p = editor.querySelector('p[data-slate-node="element"]');
      if (p) {
        p.innerHTML = `<span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">${text}</span></span></span>`;
        
        // Trigger React/Slate update
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        editor.dispatchEvent(new Event('change', { bubbles: true }));
        
        await delay(200);
        log('Direct DOM manipulation done', 'success');
        return true;
      }

    } catch (err) {
      log(`Method 3 failed: ${err.message}`, 'error');
    }

    throw new Error('All methods failed to set prompt text');
  }

  // Clear editor
  async function clearEditor() {
    try {
      const clearBtn = findClearButton();
      if (clearBtn) {
        clearBtn.click();
        await delay(300);
        log('Cleared via button', 'success');
        return true;
      }
    } catch (e) {}

    try {
      const editor = findEditor();
      if (editor) {
        editor.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        await delay(200);
        log('Cleared via select+delete', 'success');
        return true;
      }
    } catch (e) {}

    return false;
  }

  // Click submit
  async function clickSubmit() {
    const submitBtn = findSubmitButton();
    if (!submitBtn) {
      log('Submit button not found', 'error');
      return false;
    }
    
    submitBtn.click();
    log('Clicked submit', 'success');
    await delay(500);
    return true;
  }

  // Add reference image
  async function addReferenceImage(url) {
    try {
      log(`Fetching image: ${url.substring(0, 50)}...`, 'info');
      
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Convert to PNG
      let pngBlob = blob;
      if (blob.type !== 'image/png') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(blob);
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        
        pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        URL.revokeObjectURL(img.src);
      }
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);
      
      // Focus editor and paste
      const editor = findEditor();
      if (editor) {
        editor.focus();
        await delay(100);
        document.execCommand('paste');
      }
      
      await delay(settings.delayAfterImage);
      log('Added reference image', 'success');
      return true;
      
    } catch (err) {
      log(`Failed to add image: ${err.message}`, 'error');
      return false;
    }
  }

  // Process single item
  async function processItem(index) {
    const item = queue[index];
    item.status = 'running';
    currentIndex = index;
    updateQueueUI();
    showCurrentPrompt(item);
    
    log(`Processing ${index + 1}/${queue.length}`, 'info');
    
    try {
      // 1. Clear
      await clearEditor();
      await delay(300);
      
      // 2. Add reference images
      if (item.reference_image && item.reference_image.length > 0) {
        for (const url of item.reference_image) {
          if (!isRunning || isPaused) break;
          await addReferenceImage(url);
        }
      }
      
      // 3. Set prompt
      await setPromptText(item.image_prompt);
      
      // 4. Submit
      if (settings.autoSubmit) {
        await delay(300);
        await clickSubmit();
        await delay(settings.delayBetweenPrompts);
      }
      
      item.status = 'completed';
      log(`Completed ${index + 1}`, 'success');
      
    } catch (err) {
      item.status = 'error';
      item.error = err.message;
      log(`Error: ${err.message}`, 'error');
    }
    
    updateQueueUI();
  }

  // Run queue
  async function runQueue() {
    if (queue.length === 0) {
      log('Queue empty', 'warning');
      return;
    }
    
    isRunning = true;
    isPaused = false;
    
    document.getElementById('flow-start').style.display = 'none';
    document.getElementById('flow-pause').style.display = 'inline-block';
    document.getElementById('flow-stop').style.display = 'inline-block';
    document.getElementById('flow-progress').style.display = 'block';
    
    log('Starting...', 'info');
    
    for (let i = 0; i < queue.length; i++) {
      if (!isRunning) break;
      
      while (isPaused && isRunning) {
        await delay(500);
      }
      
      if (!isRunning) break;
      if (queue[i].status === 'completed') continue;
      
      await processItem(i);
      
      if (i < queue.length - 1 && isRunning) {
        await delay(1000);
      }
    }
    
    isRunning = false;
    currentIndex = -1;
    
    document.getElementById('flow-start').style.display = 'inline-block';
    document.getElementById('flow-pause').style.display = 'none';
    document.getElementById('flow-resume').style.display = 'none';
    document.getElementById('flow-stop').style.display = 'none';
    
    const completed = queue.filter(q => q.status === 'completed').length;
    log(`Done! ${completed}/${queue.length} completed`, 'success');
    showCurrentPrompt(null);
    updateQueueUI();
  }

  // Process next item manually
  async function processNext() {
    const nextIndex = queue.findIndex(q => q.status === 'pending');
    if (nextIndex === -1) {
      log('No pending items', 'warning');
      return;
    }
    
    isRunning = true;
    await processItem(nextIndex);
    isRunning = false;
  }

  // Parse JSON
  function parseJSON() {
    const input = document.getElementById('flow-json-input').value.trim();
    const statusDiv = document.getElementById('flow-status');
    
    if (!input) {
      statusDiv.innerHTML = '<span style="color: #ff3b30;">⚠️ Enter JSON</span>';
      return;
    }
    
    try {
      const data = JSON.parse(input);
      
      if (!Array.isArray(data)) {
        throw new Error('Must be an array');
      }
      
      queue = data.map((item, i) => {
        if (!item.image_prompt) {
          throw new Error(`Item ${i + 1} missing image_prompt`);
        }
        return {
          image_prompt: item.image_prompt,
          reference_image: item.reference_image || [],
          status: 'pending'
        };
      });
      
      statusDiv.innerHTML = `<span style="color: #34c759;">✅ Loaded ${queue.length} prompts</span>`;
      switchTab('queue');
      updateQueueUI();
      log(`Loaded ${queue.length} prompts`, 'success');
      
    } catch (err) {
      statusDiv.innerHTML = `<span style="color: #ff3b30;">❌ ${err.message}</span>`;
    }
  }

  // Load sample
  function loadSample() {
    const sample = [
      {
        image_prompt: "A beautiful mountain landscape at sunset with golden light",
        reference_image: []
      },
      {
        image_prompt: "Cyberpunk city with neon lights and flying cars",
        reference_image: []
      }
    ];
    document.getElementById('flow-json-input').value = JSON.stringify(sample, null, 2);
  }

  // Switch tab
  function switchTab(tabName) {
    document.querySelectorAll('.flow-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });
    document.querySelectorAll('.flow-section').forEach(s => {
      s.classList.toggle('active', s.dataset.section === tabName);
    });
  }

  // Test functions
  function testFindElements() {
    const result = [];
    
    const editor = findEditor();
    result.push(`Editor: ${editor ? '✅ Found' : '❌ Not found'}`);
    if (editor) {
      result.push(`  - Class: ${editor.className}`);
      result.push(`  - Content: "${editor.textContent.substring(0, 50)}..."`);
    }
    
    const submit = findSubmitButton();
    result.push(`Submit Button: ${submit ? '✅ Found' : '❌ Not found'}`);
    
    const clear = findClearButton();
    result.push(`Clear Button: ${clear ? '✅ Found' : '❌ Not found'}`);
    
    document.getElementById('flow-test-result').innerHTML = result.join('<br>');
  }

  async function testSetPrompt() {
    const text = document.getElementById('test-prompt').value;
    const resultDiv = document.getElementById('flow-test-result');
    
    try {
      resultDiv.innerHTML = '⏳ Setting prompt...';
      await setPromptText(text);
      resultDiv.innerHTML = `<span style="color: #34c759;">✅ Success! Check the editor.</span>`;
    } catch (err) {
      resultDiv.innerHTML = `<span style="color: #ff3b30;">❌ Error: ${err.message}</span>`;
    }
  }

  async function testClear() {
    const resultDiv = document.getElementById('flow-test-result');
    try {
      await clearEditor();
      resultDiv.innerHTML = '<span style="color: #34c759;">✅ Cleared</span>';
    } catch (err) {
      resultDiv.innerHTML = `<span style="color: #ff3b30;">❌ Error: ${err.message}</span>`;
    }
  }

  async function testSubmit() {
    const resultDiv = document.getElementById('flow-test-result');
    try {
      await clickSubmit();
      resultDiv.innerHTML = '<span style="color: #34c759;">✅ Clicked submit</span>';
    } catch (err) {
      resultDiv.innerHTML = `<span style="color: #ff3b30;">❌ Error: ${err.message}</span>`;
    }
  }

  // Save settings
  function saveSettings() {
    settings.delayBetweenPrompts = parseInt(document.getElementById('set-delay-prompts').value) || 3000;
    settings.delayAfterImage = parseInt(document.getElementById('set-delay-image').value) || 1500;
    settings.delayAfterTyping = parseInt(document.getElementById('set-delay-typing').value) || 500;
    settings.autoSubmit = document.getElementById('set-auto-submit').value === 'true';
    alert('✅ Settings saved!');
  }

  /* ---------- EVENTS ---------- */
  btn.onclick = () => overlay.style.display = 'block';
  document.getElementById('flow-close').onclick = () => overlay.style.display = 'none';
  
  document.querySelectorAll('.flow-tab').forEach(tab => {
    tab.onclick = () => switchTab(tab.dataset.tab);
  });
  
  document.getElementById('flow-parse').onclick = parseJSON;
  document.getElementById('flow-sample').onclick = loadSample;
  document.getElementById('flow-clear-input').onclick = () => {
    document.getElementById('flow-json-input').value = '';
  };
  
  document.getElementById('flow-start').onclick = runQueue;
  document.getElementById('flow-pause').onclick = () => {
    isPaused = true;
    document.getElementById('flow-pause').style.display = 'none';
    document.getElementById('flow-resume').style.display = 'inline-block';
  };
  document.getElementById('flow-resume').onclick = () => {
    isPaused = false;
    document.getElementById('flow-pause').style.display = 'inline-block';
    document.getElementById('flow-resume').style.display = 'none';
  };
  document.getElementById('flow-stop').onclick = () => isRunning = false;
  document.getElementById('flow-next').onclick = processNext;
  document.getElementById('flow-reset').onclick = () => {
    queue.forEach(q => { q.status = 'pending'; q.error = null; });
    updateQueueUI();
    document.getElementById('flow-log').innerHTML = '';
  };
  
  document.getElementById('flow-test-find').onclick = testFindElements;
  document.getElementById('flow-test-set').onclick = testSetPrompt;
  document.getElementById('flow-test-clear').onclick = testClear;
  document.getElementById('flow-test-submit').onclick = testSubmit;
  
  document.getElementById('flow-save-settings').onclick = saveSettings;

  log('Flow Automation loaded!', 'success');
})();
