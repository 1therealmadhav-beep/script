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
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #flow-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    #flow-close {
      background: #ff3b30;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
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
      transition: all 0.2s;
    }
    .flow-tab.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
    .flow-tab:hover:not(.active) {
      background: #3d3d5c;
    }
    #flow-content {
      min-height: 400px;
    }
    .flow-section {
      display: none;
    }
    .flow-section.active {
      display: block;
    }
    #flow-json-input {
      width: 100%;
      height: 300px;
      background: #0d0d1a;
      border: 2px solid #333;
      border-radius: 8px;
      color: #00ff88;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 13px;
      padding: 15px;
      resize: vertical;
    }
    #flow-json-input:focus {
      border-color: #667eea;
      outline: none;
    }
    .flow-json-template {
      background: #0d0d1a;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 0;
      font-family: monospace;
      font-size: 12px;
      color: #888;
      overflow-x: auto;
    }
    #flow-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    #flow-actions button {
      padding: 12px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
    .btn-success {
      background: #34c759;
      color: #fff;
    }
    .btn-warning {
      background: #ff9500;
      color: #fff;
    }
    .btn-danger {
      background: #ff3b30;
      color: #fff;
    }
    .btn-secondary {
      background: #5856d6;
      color: #fff;
    }
    #flow-status {
      margin-top: 15px;
      padding: 15px;
      background: #0d0d1a;
      border-radius: 8px;
      font-size: 13px;
    }
    #flow-progress {
      margin-top: 15px;
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
    .progress-text {
      font-size: 12px;
      color: #888;
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
    .log-entry {
      padding: 4px 0;
      border-bottom: 1px solid #222;
    }
    .log-success { color: #34c759; }
    .log-error { color: #ff3b30; }
    .log-info { color: #5ac8fa; }
    .log-warning { color: #ff9500; }
    #flow-queue {
      margin-top: 15px;
    }
    .queue-item {
      background: #2d2d44;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .queue-item.completed {
      opacity: 0.5;
      background: #1a3d1a;
    }
    .queue-item.current {
      border: 2px solid #667eea;
      background: #2d2d5a;
    }
    .queue-item.error {
      background: #3d1a1a;
      border: 2px solid #ff3b30;
    }
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
      flex-shrink: 0;
    }
    .queue-content {
      flex: 1;
      overflow: hidden;
    }
    .queue-prompt {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
    }
    .queue-refs {
      font-size: 11px;
      color: #888;
      margin-top: 4px;
    }
    .queue-status {
      font-size: 20px;
    }
    #flow-settings {
      margin-top: 15px;
    }
    .setting-row {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
    }
    .setting-row label {
      flex: 0 0 180px;
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
    .setting-row input:focus, .setting-row select:focus {
      border-color: #667eea;
      outline: none;
    }
    .setting-hint {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }
  `;
  document.head.appendChild(style);

  /* ---------- STATE ---------- */
  let queue = [];
  let currentIndex = -1;
  let isRunning = false;
  let isPaused = false;
  let settings = {
    delayBetweenPrompts: 5000,
    delayAfterImage: 2000,
    autoSubmit: true,
    waitForComplete: true,
    maxRetries: 2
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
        <h2>🚀 Flow Automation - Batch Prompt Processor</h2>
        <button id="flow-close">✕ Close</button>
      </div>
      
      <div id="flow-tabs">
        <button class="flow-tab active" data-tab="input">📝 Input JSON</button>
        <button class="flow-tab" data-tab="queue">📋 Queue</button>
        <button class="flow-tab" data-tab="settings">⚙️ Settings</button>
      </div>
      
      <div id="flow-content">
        <!-- Input Tab -->
        <div class="flow-section active" data-section="input">
          <p style="color: #888; margin-bottom: 10px;">Paste your JSON array of prompts below:</p>
          
          <div class="flow-json-template">
            <strong>JSON Format:</strong><br>
            [<br>
            &nbsp;&nbsp;{<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"image_prompt": "A beautiful sunset over mountains",<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"reference_image": ["https://example.com/ref1.jpg", "https://example.com/ref2.jpg"]<br>
            &nbsp;&nbsp;},<br>
            &nbsp;&nbsp;{<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"image_prompt": "Cyberpunk city at night",<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"reference_image": []<br>
            &nbsp;&nbsp;}<br>
            ]
          </div>
          
          <textarea id="flow-json-input" placeholder='[
  {
    "image_prompt": "Your prompt here...",
    "reference_image": ["url1", "url2"]
  }
]'></textarea>
          
          <div id="flow-actions">
            <button id="flow-parse" class="btn-primary">📥 Parse JSON</button>
            <button id="flow-sample" class="btn-secondary">📄 Load Sample</button>
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
            <div class="progress-text">0 / 0 completed</div>
          </div>
          
          <div id="flow-actions-queue">
            <button id="flow-start" class="btn-success">▶️ Start</button>
            <button id="flow-pause" class="btn-warning" style="display: none;">⏸️ Pause</button>
            <button id="flow-resume" class="btn-success" style="display: none;">▶️ Resume</button>
            <button id="flow-stop" class="btn-danger" style="display: none;">⏹️ Stop</button>
            <button id="flow-reset" class="btn-secondary">🔄 Reset</button>
          </div>
          
          <div id="flow-queue"></div>
          
          <div id="flow-log"></div>
        </div>
        
        <!-- Settings Tab -->
        <div class="flow-section" data-section="settings">
          <div id="flow-settings">
            <div class="setting-row">
              <label>Delay between prompts (ms):</label>
              <input type="number" id="set-delay-prompts" value="5000" min="1000" max="60000">
            </div>
            <div class="setting-hint">Time to wait after each prompt is submitted (default: 5000ms)</div>
            
            <div class="setting-row">
              <label>Delay after image paste (ms):</label>
              <input type="number" id="set-delay-image" value="2000" min="500" max="10000">
            </div>
            <div class="setting-hint">Time to wait after pasting each reference image (default: 2000ms)</div>
            
            <div class="setting-row">
              <label>Auto submit:</label>
              <select id="set-auto-submit">
                <option value="true">Yes - Automatically click submit</option>
                <option value="false">No - Manual submit</option>
              </select>
            </div>
            
            <div class="setting-row">
              <label>Max retries on error:</label>
              <input type="number" id="set-max-retries" value="2" min="0" max="5">
            </div>
            
            <div id="flow-actions" style="margin-top: 20px;">
              <button id="flow-save-settings" class="btn-primary">💾 Save Settings</button>
              <button id="flow-export-settings" class="btn-secondary">📤 Export Config</button>
              <button id="flow-import-settings" class="btn-secondary">📥 Import Config</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ---------- SELECTORS (Adjust these based on actual DOM) ---------- */
  const SELECTORS = {
    // Prompt text editor (Slate.js)
    promptEditor: 'div[role="textbox"][data-slate-editor="true"]',
    // Submit button (arrow_forward icon)
    submitButton: 'button i.google-symbols:not([style*="display: none"])',
    // Clear button
    clearButton: 'button i.google-symbols',
    // Add reference image button
    addImageButton: 'button[aria-controls*="radix"]',
    // Reference image container
    refImageContainer: '.sc-5496b68c-0',
    // Loading indicator (customize based on actual loading state)
    loadingIndicator: '[data-loading="true"], .loading, [aria-busy="true"]'
  };

  /* ---------- UTILITY FUNCTIONS ---------- */
  
  function log(message, type = 'info') {
    const logDiv = document.getElementById('flow-log');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.insertBefore(entry, logDiv.firstChild);
    console.log(`[Flow] ${message}`);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function updateProgress() {
    const completed = queue.filter(q => q.status === 'completed').length;
    const total = queue.length;
    const percent = total > 0 ? (completed / total) * 100 : 0;
    
    document.querySelector('.progress-fill').style.width = `${percent}%`;
    document.querySelector('.progress-text').textContent = `${completed} / ${total} completed`;
  }

  function updateQueueUI() {
    const queueDiv = document.getElementById('flow-queue');
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
        error: '❌',
        skipped: '⏭️'
      }[item.status] || '⏳';
      
      div.innerHTML = `
        <div class="queue-num">${index + 1}</div>
        <div class="queue-content">
          <div class="queue-prompt">${item.image_prompt.substring(0, 80)}${item.image_prompt.length > 80 ? '...' : ''}</div>
          <div class="queue-refs">📎 ${item.reference_image?.length || 0} reference image(s)</div>
        </div>
        <div class="queue-status">${statusIcon}</div>
      `;
      
      queueDiv.appendChild(div);
    });
    
    updateProgress();
  }

  /* ---------- CORE AUTOMATION FUNCTIONS ---------- */

  // Set text in Slate.js editor
  async function setPromptText(text) {
    const editor = document.querySelector(SELECTORS.promptEditor);
    if (!editor) {
      throw new Error('Prompt editor not found');
    }
    
    // Focus editor
    editor.focus();
    await delay(100);
    
    // Clear existing content
    document.execCommand('selectAll', false, null);
    await delay(50);
    
    // Insert new text
    document.execCommand('insertText', false, text);
    await delay(100);
    
    // Dispatch input event for React/Slate
    editor.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text
    }));
    
    log(`Set prompt: "${text.substring(0, 50)}..."`, 'success');
  }

  // Clear current prompt
  async function clearPrompt() {
    try {
      // Try to find and click clear button
      const clearButtons = document.querySelectorAll('button');
      for (const btn of clearButtons) {
        const icon = btn.querySelector('i.google-symbols');
        if (icon && icon.textContent.trim() === 'close') {
          const ariaLabel = btn.querySelector('span')?.textContent || '';
          if (ariaLabel.toLowerCase().includes('clear')) {
            btn.click();
            await delay(300);
            log('Cleared prompt', 'info');
            return true;
          }
        }
      }
      
      // Fallback: Select all and delete
      const editor = document.querySelector(SELECTORS.promptEditor);
      if (editor) {
        editor.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        await delay(200);
        log('Cleared prompt (fallback)', 'info');
        return true;
      }
    } catch (err) {
      log(`Clear failed: ${err.message}`, 'warning');
    }
    return false;
  }

  // Fetch image as blob
  async function fetchImageAsBlob(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.blob();
    } catch (err) {
      log(`Failed to fetch image: ${url}`, 'error');
      throw err;
    }
  }

  // Paste image blob to clipboard and trigger paste
  async function pasteImage(blob) {
    try {
      // Create clipboard item
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      
      // Find and focus the editor/paste area
      const editor = document.querySelector(SELECTORS.promptEditor);
      if (editor) {
        editor.focus();
      }
      
      // Simulate paste event
      document.execCommand('paste');
      
      await delay(settings.delayAfterImage);
      log('Pasted reference image', 'success');
      return true;
    } catch (err) {
      log(`Paste failed: ${err.message}`, 'error');
      
      // Try alternative method - dispatch paste event
      try {
        const pasteEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: new DataTransfer()
        });
        document.dispatchEvent(pasteEvent);
      } catch (e) {
        // Ignore
      }
      
      return false;
    }
  }

  // Add reference image by URL
  async function addReferenceImage(url) {
    try {
      log(`Adding reference: ${url.substring(0, 50)}...`, 'info');
      
      // Fetch image
      const blob = await fetchImageAsBlob(url);
      
      // Convert to PNG if needed
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
        
        pngBlob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png');
        });
        
        URL.revokeObjectURL(img.src);
      }
      
      // Paste the image
      await pasteImage(pngBlob);
      
      return true;
    } catch (err) {
      log(`Failed to add reference: ${err.message}`, 'error');
      return false;
    }
  }

  // Click submit button
  async function clickSubmit() {
    try {
      // Find submit button (with arrow_forward icon)
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const icon = btn.querySelector('i.google-symbols');
        if (icon && icon.textContent.trim() === 'arrow_forward') {
          btn.click();
          log('Clicked submit button', 'success');
          await delay(500);
          return true;
        }
      }
      
      log('Submit button not found', 'warning');
      return false;
    } catch (err) {
      log(`Submit failed: ${err.message}`, 'error');
      return false;
    }
  }

  // Wait for generation to complete
  async function waitForCompletion(timeout = 120000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      // Check if still loading
      const loading = document.querySelector(SELECTORS.loadingIndicator);
      if (!loading) {
        await delay(1000);
        return true;
      }
      await delay(1000);
    }
    
    log('Timeout waiting for completion', 'warning');
    return false;
  }

  // Process single queue item
  async function processQueueItem(index) {
    const item = queue[index];
    item.status = 'running';
    updateQueueUI();
    
    log(`Processing item ${index + 1}: "${item.image_prompt.substring(0, 30)}..."`, 'info');
    
    try {
      // 1. Clear existing prompt
      await clearPrompt();
      await delay(300);
      
      // 2. Add reference images first
      if (item.reference_image && item.reference_image.length > 0) {
        for (const refUrl of item.reference_image) {
          if (!isRunning || isPaused) break;
          await addReferenceImage(refUrl);
          await delay(500);
        }
      }
      
      // 3. Set prompt text
      await setPromptText(item.image_prompt);
      await delay(500);
      
      // 4. Submit if auto-submit enabled
      if (settings.autoSubmit) {
        await clickSubmit();
        
        // Wait for completion
        if (settings.waitForComplete) {
          await delay(settings.delayBetweenPrompts);
        }
      }
      
      item.status = 'completed';
      log(`Completed item ${index + 1}`, 'success');
      
    } catch (err) {
      item.status = 'error';
      item.error = err.message;
      log(`Error on item ${index + 1}: ${err.message}`, 'error');
    }
    
    updateQueueUI();
  }

  // Run the queue
  async function runQueue() {
    if (queue.length === 0) {
      log('Queue is empty', 'warning');
      return;
    }
    
    isRunning = true;
    isPaused = false;
    
    document.getElementById('flow-start').style.display = 'none';
    document.getElementById('flow-pause').style.display = 'inline-block';
    document.getElementById('flow-stop').style.display = 'inline-block';
    document.getElementById('flow-progress').style.display = 'block';
    
    log('Starting queue processing...', 'info');
    
    for (let i = 0; i < queue.length; i++) {
      if (!isRunning) break;
      
      while (isPaused && isRunning) {
        await delay(500);
      }
      
      if (!isRunning) break;
      
      if (queue[i].status === 'completed' || queue[i].status === 'skipped') {
        continue;
      }
      
      currentIndex = i;
      await processQueueItem(i);
      
      // Delay before next item
      if (i < queue.length - 1 && isRunning) {
        await delay(settings.delayBetweenPrompts);
      }
    }
    
    isRunning = false;
    currentIndex = -1;
    
    document.getElementById('flow-start').style.display = 'inline-block';
    document.getElementById('flow-pause').style.display = 'none';
    document.getElementById('flow-resume').style.display = 'none';
    document.getElementById('flow-stop').style.display = 'none';
    
    const completed = queue.filter(q => q.status === 'completed').length;
    log(`Queue finished. ${completed}/${queue.length} completed.`, 'success');
    
    updateQueueUI();
  }

  /* ---------- PARSE JSON ---------- */
  function parseJSON() {
    const input = document.getElementById('flow-json-input').value.trim();
    const statusDiv = document.getElementById('flow-status');
    
    if (!input) {
      statusDiv.innerHTML = '<span style="color: #ff3b30;">⚠️ Please enter JSON data</span>';
      return;
    }
    
    try {
      const data = JSON.parse(input);
      
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array');
      }
      
      queue = data.map((item, index) => {
        if (!item.image_prompt) {
          throw new Error(`Item ${index + 1} is missing "image_prompt"`);
        }
        
        return {
          image_prompt: item.image_prompt,
          reference_image: item.reference_image || [],
          status: 'pending',
          error: null
        };
      });
      
      statusDiv.innerHTML = `<span style="color: #34c759;">✅ Parsed ${queue.length} prompts successfully!</span>`;
      
      // Switch to queue tab
      switchTab('queue');
      updateQueueUI();
      
      log(`Loaded ${queue.length} prompts`, 'success');
      
    } catch (err) {
      statusDiv.innerHTML = `<span style="color: #ff3b30;">❌ Parse error: ${err.message}</span>`;
      log(`Parse error: ${err.message}`, 'error');
    }
  }

  /* ---------- SAMPLE DATA ---------- */
  function loadSample() {
    const sample = [
      {
        image_prompt: "A majestic mountain landscape at sunset with golden light rays",
        reference_image: []
      },
      {
        image_prompt: "Cyberpunk cityscape with neon lights and flying cars",
        reference_image: []
      },
      {
        image_prompt: "Cute anime girl with blue hair in a flower garden",
        reference_image: []
      }
    ];
    
    document.getElementById('flow-json-input').value = JSON.stringify(sample, null, 2);
    log('Loaded sample data', 'info');
  }

  /* ---------- TAB SWITCHING ---------- */
  function switchTab(tabName) {
    document.querySelectorAll('.flow-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.flow-section').forEach(section => {
      section.classList.toggle('active', section.dataset.section === tabName);
    });
  }

  /* ---------- SAVE SETTINGS ---------- */
  function saveSettings() {
    settings.delayBetweenPrompts = parseInt(document.getElementById('set-delay-prompts').value) || 5000;
    settings.delayAfterImage = parseInt(document.getElementById('set-delay-image').value) || 2000;
    settings.autoSubmit = document.getElementById('set-auto-submit').value === 'true';
    settings.maxRetries = parseInt(document.getElementById('set-max-retries').value) || 2;
    
    log('Settings saved', 'success');
    alert('✅ Settings saved!');
  }

  /* ---------- EVENTS ---------- */
  
  btn.onclick = () => {
    overlay.style.display = 'block';
  };
  
  document.getElementById('flow-close').onclick = () => {
    overlay.style.display = 'none';
  };
  
  // Tab switching
  document.querySelectorAll('.flow-tab').forEach(tab => {
    tab.onclick = () => switchTab(tab.dataset.tab);
  });
  
  // Input tab actions
  document.getElementById('flow-parse').onclick = parseJSON;
  document.getElementById('flow-sample').onclick = loadSample;
  document.getElementById('flow-clear-input').onclick = () => {
    document.getElementById('flow-json-input').value = '';
  };
  
  // Queue tab actions
  document.getElementById('flow-start').onclick = runQueue;
  
  document.getElementById('flow-pause').onclick = () => {
    isPaused = true;
    document.getElementById('flow-pause').style.display = 'none';
    document.getElementById('flow-resume').style.display = 'inline-block';
    log('Paused', 'warning');
  };
  
  document.getElementById('flow-resume').onclick = () => {
    isPaused = false;
    document.getElementById('flow-pause').style.display = 'inline-block';
    document.getElementById('flow-resume').style.display = 'none';
    log('Resumed', 'info');
  };
  
  document.getElementById('flow-stop').onclick = () => {
    isRunning = false;
    isPaused = false;
    log('Stopped', 'warning');
  };
  
  document.getElementById('flow-reset').onclick = () => {
    queue.forEach(item => {
      item.status = 'pending';
      item.error = null;
    });
    currentIndex = -1;
    updateQueueUI();
    document.getElementById('flow-log').innerHTML = '';
    log('Queue reset', 'info');
  };
  
  // Settings
  document.getElementById('flow-save-settings').onclick = saveSettings;
  
  document.getElementById('flow-export-settings').onclick = () => {
    const config = {
      settings,
      queue: queue.map(q => ({
        image_prompt: q.image_prompt,
        reference_image: q.reference_image
      }))
    };
    
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    alert('✅ Config copied to clipboard!');
  };
  
  document.getElementById('flow-import-settings').onclick = () => {
    const input = prompt('Paste config JSON:');
    if (!input) return;
    
    try {
      const config = JSON.parse(input);
      if (config.settings) {
        Object.assign(settings, config.settings);
        document.getElementById('set-delay-prompts').value = settings.delayBetweenPrompts;
        document.getElementById('set-delay-image').value = settings.delayAfterImage;
        document.getElementById('set-auto-submit').value = settings.autoSubmit.toString();
        document.getElementById('set-max-retries').value = settings.maxRetries;
      }
      if (config.queue) {
        document.getElementById('flow-json-input').value = JSON.stringify(config.queue, null, 2);
      }
      alert('✅ Config imported!');
    } catch (err) {
      alert('❌ Invalid config: ' + err.message);
    }
  };

  log('Flow Automation loaded', 'success');
})();
