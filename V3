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
    .flow-section { display: none; }
    .flow-section.active { display: block; }
    #flow-json-input {
      width: 100%;
      height: 200px;
      background: #0d0d1a;
      border: 2px solid #333;
      border-radius: 8px;
      color: #00ff88;
      font-family: monospace;
      font-size: 13px;
      padding: 15px;
      resize: vertical;
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
    .btn-pink { background: #ff2d55; color: #fff; }
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
      max-height: 150px;
      overflow-y: auto;
      background: #0d0d1a;
      padding: 10px;
      border-radius: 8px;
      margin-top: 10px;
      font-family: monospace;
      font-size: 12px;
    }
    .log-entry { padding: 3px 0; border-bottom: 1px solid #222; }
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
      min-width: 28px;
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
    .current-prompt-box {
      background: #2d2d44;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #667eea;
    }
    .current-prompt-box h4 {
      margin: 0 0 10px;
      color: #667eea;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .current-prompt-box .prompt-text {
      background: #0d0d1a;
      padding: 15px;
      border-radius: 6px;
      font-size: 14px;
      line-height: 1.6;
      color: #00ff88;
      font-family: monospace;
      word-break: break-word;
      user-select: all;
    }
    .current-prompt-box .ref-images {
      margin-top: 10px;
      font-size: 12px;
      color: #888;
    }
    .copy-btn {
      background: #34c759;
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .copy-btn:hover { background: #2db84d; }
    .copy-btn.copied {
      background: #667eea;
    }
    .semi-auto-instructions {
      background: #2d2d5a;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      border: 1px dashed #667eea;
    }
    .semi-auto-instructions h4 {
      margin: 0 0 10px;
      color: #fff;
    }
    .semi-auto-instructions ol {
      margin: 0;
      padding-left: 20px;
      color: #aaa;
    }
    .semi-auto-instructions li {
      margin: 5px 0;
    }
    .ref-image-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      background: #1a1a2e;
      border-radius: 6px;
      margin-top: 8px;
    }
    .ref-image-item img {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
    }
    .ref-image-item .url {
      flex: 1;
      font-size: 11px;
      color: #888;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);

  /* ---------- STATE ---------- */
  let queue = [];
  let currentIndex = -1;
  let settings = {
    autoNext: false,
    delayBetween: 2000
  };

  /* ---------- BUTTON ---------- */
  const btn = document.createElement("div");
  btn.id = "flow-btn";
  btn.textContent = "🚀 Flow";
  document.body.appendChild(btn);

  /* ---------- MODAL ---------- */
  const overlay = document.createElement("div");
  overlay.id = "flow-overlay";
  overlay.innerHTML = `
    <div id="flow-modal">
      <div id="flow-header">
        <h2 style="margin:0;">🚀 Flow Automation (Semi-Auto)</h2>
        <button id="flow-close">✕ Close</button>
      </div>
      
      <div id="flow-tabs">
        <button class="flow-tab active" data-tab="input">📝 Input</button>
        <button class="flow-tab" data-tab="run">▶️ Run</button>
      </div>
      
      <div id="flow-content">
        <!-- Input Tab -->
        <div class="flow-section active" data-section="input">
          <p style="color: #888; margin-bottom: 10px;">Paste JSON array:</p>
          <textarea id="flow-json-input" placeholder='[
  {
    "image_prompt": "Your prompt here",
    "reference_image": ["url1", "url2"]
  }
]'></textarea>
          
          <div id="flow-actions">
            <button id="flow-parse" class="btn-primary">📥 Parse & Start</button>
            <button id="flow-sample" class="btn-secondary">📄 Sample</button>
            <button id="flow-clear-input" class="btn-danger">🗑️ Clear</button>
          </div>
          
          <div id="flow-status"></div>
        </div>
        
        <!-- Run Tab -->
        <div class="flow-section" data-section="run">
          <div class="semi-auto-instructions">
            <h4>📋 How to Use (Semi-Automatic)</h4>
            <ol>
              <li>Click <strong>"📋 Copy Prompt"</strong> to copy the current prompt</li>
              <li>Click in the editor and press <strong>Ctrl+V</strong> to paste</li>
              <li>If there are reference images, click <strong>"📋 Copy Image"</strong> and paste</li>
              <li>Click the submit button on the page</li>
              <li>Click <strong>"⏭️ Next"</strong> to go to next prompt</li>
            </ol>
          </div>
          
          <div id="flow-progress" style="display: none;">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%;"></div>
            </div>
            <div class="progress-text">0 / 0</div>
          </div>
          
          <div id="flow-current-prompt"></div>
          
          <div id="flow-actions">
            <button id="flow-prev" class="btn-secondary">⏮️ Prev</button>
            <button id="flow-next" class="btn-primary">⏭️ Next</button>
            <button id="flow-mark-done" class="btn-success">✅ Mark Done</button>
            <button id="flow-skip" class="btn-warning">⏭️ Skip</button>
            <button id="flow-reset" class="btn-danger">🔄 Reset All</button>
          </div>
          
          <div id="flow-queue" style="margin-top: 15px;"></div>
          <div id="flow-log"></div>
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
      
      // Keep only last 20 entries
      while (logDiv.children.length > 20) {
        logDiv.removeChild(logDiv.lastChild);
      }
    }
    console.log(`[Flow] ${message}`);
  }

  function updateProgress() {
    const completed = queue.filter(q => q.status === 'completed').length;
    const total = queue.length;
    const percent = total > 0 ? (completed / total) * 100 : 0;
    
    const fill = document.querySelector('.progress-fill');
    const text = document.querySelector('.progress-text');
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${completed} / ${total} completed`;
  }

  function updateQueueUI() {
    const queueDiv = document.getElementById('flow-queue');
    if (!queueDiv) return;
    
    queueDiv.innerHTML = '<h4 style="margin: 0 0 10px; color: #888;">Queue:</h4>';
    
    queue.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'queue-item';
      
      if (item.status === 'completed') div.classList.add('completed');
      if (item.status === 'error') div.classList.add('error');
      if (index === currentIndex) div.classList.add('current');
      
      const statusIcon = {
        pending: '⏳',
        current: '👉',
        completed: '✅',
        skipped: '⏭️',
        error: '❌'
      }[item.status] || '⏳';
      
      div.innerHTML = `
        <div class="queue-num">${index + 1}</div>
        <div class="queue-content">
          <div class="queue-prompt">${item.image_prompt.substring(0, 50)}...</div>
          <div class="queue-refs">📎 ${item.reference_image?.length || 0} refs</div>
        </div>
        <div class="queue-status">${statusIcon}</div>
      `;
      
      // Click to jump to this item
      div.onclick = () => goToIndex(index);
      div.style.cursor = 'pointer';
      
      queueDiv.appendChild(div);
    });
    
    updateProgress();
  }

  function showCurrentPrompt() {
    const div = document.getElementById('flow-current-prompt');
    if (!div) return;
    
    if (currentIndex < 0 || currentIndex >= queue.length) {
      div.innerHTML = '<p style="color: #888; text-align: center;">No prompt selected</p>';
      return;
    }
    
    const item = queue[currentIndex];
    
    let refImagesHTML = '';
    if (item.reference_image && item.reference_image.length > 0) {
      refImagesHTML = `
        <div style="margin-top: 15px;">
          <strong style="color: #ff9500;">📎 Reference Images (${item.reference_image.length}):</strong>
          ${item.reference_image.map((url, i) => `
            <div class="ref-image-item">
              <img src="${url}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><rect fill=%22%23333%22 width=%2250%22 height=%2250%22/><text x=%2225%22 y=%2230%22 fill=%22%23888%22 text-anchor=%22middle%22>?</text></svg>'">
              <div class="url">${url}</div>
              <button class="copy-btn" onclick="window.__copyRefImage(${i})">📋 Copy Image</button>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    div.innerHTML = `
      <div class="current-prompt-box">
        <h4>
          <span>📝 Prompt ${currentIndex + 1} of ${queue.length}</span>
          <button class="copy-btn" id="copy-prompt-btn">📋 Copy Prompt</button>
        </h4>
        <div class="prompt-text" id="current-prompt-text">${item.image_prompt}</div>
        ${refImagesHTML}
      </div>
    `;
    
    // Copy prompt button
    document.getElementById('copy-prompt-btn').onclick = async () => {
      try {
        await navigator.clipboard.writeText(item.image_prompt);
        const btn = document.getElementById('copy-prompt-btn');
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        log('Prompt copied to clipboard', 'success');
        
        setTimeout(() => {
          btn.textContent = '📋 Copy Prompt';
          btn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        log('Failed to copy: ' + err.message, 'error');
      }
    };
  }

  // Global function to copy reference image
  window.__copyRefImage = async function(index) {
    if (currentIndex < 0 || currentIndex >= queue.length) return;
    
    const item = queue[currentIndex];
    const url = item.reference_image[index];
    
    if (!url) return;
    
    try {
      log(`Fetching image: ${url.substring(0, 40)}...`, 'info');
      
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Convert to PNG
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
      
      const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      URL.revokeObjectURL(img.src);
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);
      
      log('Image copied! Paste with Ctrl+V', 'success');
      alert('✅ Image copied! Now click in the editor and press Ctrl+V to paste.');
      
    } catch (err) {
      log('Failed to copy image: ' + err.message, 'error');
      
      // Fallback: copy URL
      try {
        await navigator.clipboard.writeText(url);
        alert('⚠️ Could not copy image (CORS). URL copied instead.');
      } catch (e) {
        alert('❌ Failed to copy. Please copy the URL manually.');
      }
    }
  };

  function goToIndex(index) {
    if (index < 0) index = 0;
    if (index >= queue.length) index = queue.length - 1;
    
    currentIndex = index;
    
    // Update current item status
    if (queue[currentIndex].status === 'pending') {
      queue[currentIndex].status = 'current';
    }
    
    showCurrentPrompt();
    updateQueueUI();
    log(`Showing prompt ${index + 1}`, 'info');
  }

  function goNext() {
    if (currentIndex < queue.length - 1) {
      goToIndex(currentIndex + 1);
    } else {
      log('Reached end of queue', 'warning');
      alert('🎉 You have reached the end of the queue!');
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      goToIndex(currentIndex - 1);
    } else {
      log('Already at first prompt', 'warning');
    }
  }

  function markDone() {
    if (currentIndex < 0 || currentIndex >= queue.length) return;
    
    queue[currentIndex].status = 'completed';
    log(`Marked prompt ${currentIndex + 1} as done`, 'success');
    updateQueueUI();
    
    // Auto go to next
    if (currentIndex < queue.length - 1) {
      setTimeout(() => goNext(), 500);
    }
  }

  function skipCurrent() {
    if (currentIndex < 0 || currentIndex >= queue.length) return;
    
    queue[currentIndex].status = 'skipped';
    log(`Skipped prompt ${currentIndex + 1}`, 'warning');
    updateQueueUI();
    
    if (currentIndex < queue.length - 1) {
      setTimeout(() => goNext(), 300);
    }
  }

  function resetAll() {
    if (!confirm('Reset all progress?')) return;
    
    queue.forEach(q => {
      q.status = 'pending';
    });
    currentIndex = 0;
    
    if (queue.length > 0) {
      queue[0].status = 'current';
    }
    
    showCurrentPrompt();
    updateQueueUI();
    document.getElementById('flow-log').innerHTML = '';
    log('Reset all', 'info');
  }

  // Parse JSON
  function parseJSON() {
    const input = document.getElementById('flow-json-input').value.trim();
    const statusDiv = document.getElementById('flow-status');
    
    if (!input) {
      statusDiv.innerHTML = '<span style="color: #ff3b30;">⚠️ Please enter JSON</span>';
      return;
    }
    
    try {
      const data = JSON.parse(input);
      
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array');
      }
      
      if (data.length === 0) {
        throw new Error('Array is empty');
      }
      
      queue = data.map((item, i) => {
        if (!item.image_prompt) {
          throw new Error(`Item ${i + 1} missing "image_prompt"`);
        }
        return {
          image_prompt: String(item.image_prompt),
          reference_image: Array.isArray(item.reference_image) ? item.reference_image : [],
          status: 'pending'
        };
      });
      
      // Set first item as current
      queue[0].status = 'current';
      currentIndex = 0;
      
      statusDiv.innerHTML = `<span style="color: #34c759;">✅ Loaded ${queue.length} prompts!</span>`;
      
      // Switch to run tab
      switchTab('run');
      document.getElementById('flow-progress').style.display = 'block';
      showCurrentPrompt();
      updateQueueUI();
      
      log(`Loaded ${queue.length} prompts`, 'success');
      
    } catch (err) {
      statusDiv.innerHTML = `<span style="color: #ff3b30;">❌ Error: ${err.message}</span>`;
      log('Parse error: ' + err.message, 'error');
    }
  }

  // Load sample
  function loadSample() {
    const sample = [
      {
        image_prompt: "A majestic mountain landscape at golden hour, dramatic clouds, cinematic lighting, 8k ultra detailed",
        reference_image: []
      },
      {
        image_prompt: "Cyberpunk cityscape at night, neon lights, rain reflections, blade runner style, highly detailed",
        reference_image: []
      },
      {
        image_prompt: "Cute anime girl with blue hair, cherry blossom background, studio ghibli style",
        reference_image: [
          "https://picsum.photos/400/400"
        ]
      }
    ];
    document.getElementById('flow-json-input').value = JSON.stringify(sample, null, 2);
    log('Sample loaded', 'info');
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
    document.getElementById('flow-status').innerHTML = '';
  };
  
  document.getElementById('flow-prev').onclick = goPrev;
  document.getElementById('flow-next').onclick = goNext;
  document.getElementById('flow-mark-done').onclick = markDone;
  document.getElementById('flow-skip').onclick = skipCurrent;
  document.getElementById('flow-reset').onclick = resetAll;

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (overlay.style.display !== 'block') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.key === 'ArrowRight' || e.key === 'n') {
      goNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'p') {
      goPrev();
    } else if (e.key === 'd' || e.key === 'Enter') {
      markDone();
    } else if (e.key === 's') {
      skipCurrent();
    }
  });

  log('Flow Automation loaded!', 'success');
})();
