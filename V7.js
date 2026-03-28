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
    .flow-tab:hover:not(.active) { background: #3d3d5c; }
    #flow-content { min-height: 400px; }
    .flow-section { display: none; }
    .flow-section.active { display: block; }
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
      box-sizing: border-box;
    }
    #flow-json-input:focus { border-color: #667eea; outline: none; }
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
    #flow-actions, #flow-actions-queue {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    #flow-actions button, #flow-actions-queue button {
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
    .btn-success { background: #34c759; color: #fff; }
    .btn-warning { background: #ff9500; color: #fff; }
    .btn-danger { background: #ff3b30; color: #fff; }
    .btn-secondary { background: #5856d6; color: #fff; }
    #flow-status {
      margin-top: 15px;
      padding: 15px;
      background: #0d0d1a;
      border-radius: 8px;
      font-size: 13px;
    }
    #flow-progress { margin-top: 15px; }
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
    .progress-text { font-size: 12px; color: #888; }
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
    #flow-queue { margin-top: 15px; }
    .queue-item {
      background: #2d2d44;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .queue-item.completed { opacity: 0.5; background: #1a3d1a; }
    .queue-item.current { border: 2px solid #667eea; background: #2d2d5a; }
    .queue-item.error { background: #3d1a1a; border: 2px solid #ff3b30; }
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
    .queue-content { flex: 1; overflow: hidden; }
    .queue-prompt {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
    }
    .queue-refs { font-size: 11px; color: #888; margin-top: 4px; }
    .queue-status { font-size: 20px; }
    #flow-settings { margin-top: 15px; }
    .setting-row {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
    }
    .setting-row label { flex: 0 0 180px; font-size: 13px; color: #aaa; }
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
    .setting-hint { font-size: 11px; color: #666; margin-top: 2px; }
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
        <div class="flow-section active" data-section="input">
          <p style="color: #888; margin-bottom: 10px;">Paste your JSON array of prompts below:</p>
          <div class="flow-json-template">
            <strong>JSON Format:</strong><br>
            [<br>
            &nbsp;&nbsp;{<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"image_prompt": "A beautiful sunset over mountains",<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"reference_image": ["https://example.com/ref1.jpg"]<br>
            &nbsp;&nbsp;}<br>
            ]
          </div>
          <textarea id="flow-json-input" placeholder='Paste JSON here...'></textarea>
          <div id="flow-actions">
            <button id="flow-parse" class="btn-primary">📥 Parse JSON</button>
            <button id="flow-sample" class="btn-secondary">📄 Load Sample</button>
            <button id="flow-clear-input" class="btn-danger">🗑️ Clear</button>
          </div>
          <div id="flow-status"></div>
        </div>
        <div class="flow-section" data-section="queue">
          <div id="flow-progress" style="display: none;">
            <div class="progress-bar"><div class="progress-fill" style="width: 0%;"></div></div>
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
        <div class="flow-section" data-section="settings">
          <div id="flow-settings">
            <div class="setting-row">
              <label>Delay between prompts (ms):</label>
              <input type="number" id="set-delay-prompts" value="5000" min="1000" max="60000">
            </div>
            <div class="setting-hint">Time to wait after each prompt is submitted</div>
            <div class="setting-row">
              <label>Delay after image paste (ms):</label>
              <input type="number" id="set-delay-image" value="2000" min="500" max="10000">
            </div>
            <div class="setting-hint">Time to wait after pasting each reference image</div>
            <div class="setting-row">
              <label>Auto submit:</label>
              <select id="set-auto-submit">
                <option value="true">Yes</option>
                <option value="false">No</option>
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

  /* ---------- SELECTORS ---------- */
  const SELECTORS = {
    promptEditor: 'div[role="textbox"][data-slate-editor="true"]',
    submitButton: 'button i.google-symbols',
    loadingIndicator: '[data-loading="true"], .loading, [aria-busy="true"]'
  };

  /* ---------- UTILITY ---------- */

  function log(message, type = 'info') {
    const logDiv = document.getElementById('flow-log');
    if (!logDiv) return;
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
    const pct = total > 0 ? (completed / total) * 100 : 0;
    const fill = document.querySelector('.progress-fill');
    const text = document.querySelector('.progress-text');
    if (fill) fill.style.width = `${pct}%`;
    if (text) text.textContent = `${completed} / ${total} completed`;
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
      const icon = { pending:'⏳', running:'🔄', completed:'✅', error:'❌', skipped:'⏭️' }[item.status] || '⏳';
      div.innerHTML = `
        <div class="queue-num">${index + 1}</div>
        <div class="queue-content">
          <div class="queue-prompt">${item.image_prompt.substring(0, 80)}${item.image_prompt.length > 80 ? '...' : ''}</div>
          <div class="queue-refs">📎 ${item.reference_image?.length || 0} ref(s)</div>
        </div>
        <div class="queue-status">${icon}</div>
      `;
      queueDiv.appendChild(div);
    });
    updateProgress();
  }

  /* ============================================================
   *  FIX 1 — Get the Slate editor instance via React fiber
   * ============================================================
   *  We walk up the React fiber tree from the DOM node to find
   *  the editor object that Slate stores on the Editable's props.
   * ============================================================ */
  function getReactFiber(dom) {
    const key = Object.keys(dom).find(k =>
      k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
    );
    return key ? dom[key] : null;
  }

  function getSlateEditor(dom) {
    let fiber = getReactFiber(dom);
    let depth = 0;
    while (fiber && depth < 50) {
      // Slate's <Editable> stores the editor on memoizedProps or pendingProps
      const props = fiber.memoizedProps || fiber.pendingProps || {};
      if (props.editor && typeof props.editor.insertText === 'function') {
        return props.editor;
      }
      // Also check stateNode for class components
      if (fiber.stateNode?.editor && typeof fiber.stateNode.editor.insertText === 'function') {
        return fiber.stateNode.editor;
      }
      fiber = fiber.return;
      depth++;
    }
    return null;
  }

  /* ============================================================
   *  FIX 2 — setPromptText with 3-level fallback
   *    1. Slate API  (updates model directly — best)
   *    2. Synthetic paste event  (Slate's onPaste handler)
   *    3. execCommand  (legacy fallback)
   * ============================================================ */
  async function setPromptText(text) {
    const editorDom = document.querySelector(SELECTORS.promptEditor);
    if (!editorDom) throw new Error('Prompt editor not found');

    editorDom.focus();
    await delay(200);

    /* --- Attempt 1: Direct Slate API --- */
    const slateEditor = getSlateEditor(editorDom);
    if (slateEditor) {
      try {
        log('Using Slate API to set text', 'info');

        // Import Slate helpers from the editor instance
        const { Transforms, Editor, Range, Node } =
          window.Slate || {};

        // Select everything and delete
        // Slate editors have select/delete on Transforms,
        // but we can also use editor-level methods.
        if (Transforms) {
          Transforms.select(slateEditor, {
            anchor: Editor.start(slateEditor, []),
            focus: Editor.end(slateEditor, [])
          });
          Transforms.delete(slateEditor);
          Transforms.insertText(slateEditor, text);
        } else {
          // Fallback: many Slate builds expose these on the editor
          slateEditor.select({
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: Infinity }
          });
          slateEditor.deleteFragment();
          slateEditor.insertText(text);
        }

        // Trigger React re-render
        editorDom.dispatchEvent(new Event('input', { bubbles: true }));
        await delay(200);

        log(`✓ Set prompt via Slate API: "${text.substring(0, 50)}..."`, 'success');
        return;
      } catch (e) {
        log(`Slate API attempt failed: ${e.message}, trying paste fallback`, 'warning');
      }
    }

    /* --- Attempt 2: Synthetic ClipboardEvent (paste) --- */
    try {
      log('Using synthetic paste to set text', 'info');

      // Select all existing content
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorDom);
      sel.removeAllRanges();
      sel.addRange(range);
      await delay(100);

      // Delete selection via beforeinput
      editorDom.dispatchEvent(new InputEvent('beforeinput', {
        inputType: 'deleteContentBackward',
        bubbles: true,
        cancelable: true,
        composed: true
      }));
      await delay(150);

      // Build a paste event with text on clipboardData
      const dt = new DataTransfer();
      dt.setData('text/plain', text);

      const pasteEvt = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dt
      });

      editorDom.dispatchEvent(pasteEvt);
      await delay(300);

      // Verify text appeared
      const content = editorDom.textContent || '';
      if (content.includes(text.substring(0, 20))) {
        log(`✓ Set prompt via paste: "${text.substring(0, 50)}..."`, 'success');
        return;
      }
      log('Paste dispatched but text not detected, trying beforeinput', 'warning');
    } catch (e) {
      log(`Paste attempt failed: ${e.message}`, 'warning');
    }

    /* --- Attempt 3: beforeinput insertText --- */
    try {
      log('Using beforeinput to set text', 'info');

      // Re-select all
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorDom);
      sel.removeAllRanges();
      sel.addRange(range);
      await delay(100);

      // Delete
      editorDom.dispatchEvent(new InputEvent('beforeinput', {
        inputType: 'deleteByCut',
        bubbles: true,
        cancelable: true,
        composed: true
      }));
      await delay(150);

      // Insert
      editorDom.dispatchEvent(new InputEvent('beforeinput', {
        inputType: 'insertText',
        data: text,
        bubbles: true,
        cancelable: true,
        composed: true
      }));
      await delay(200);

      editorDom.dispatchEvent(new Event('input', { bubbles: true }));
      await delay(200);

      log(`✓ Set prompt via beforeinput: "${text.substring(0, 50)}..."`, 'success');
      return;
    } catch (e) {
      log(`beforeinput attempt failed: ${e.message}`, 'warning');
    }

    /* --- Attempt 4: legacy execCommand (least likely to work) --- */
    log('Falling back to execCommand', 'warning');
    document.execCommand('selectAll', false, null);
    await delay(50);
    document.execCommand('insertText', false, text);
    await delay(200);
    editorDom.dispatchEvent(new Event('input', { bubbles: true }));
    await delay(200);
    log(`Set prompt via execCommand (may not persist): "${text.substring(0, 50)}..."`, 'warning');
  }

  /* ============================================================
   *  FIX 3 — clearPrompt that also resets Slate
   * ============================================================ */
  async function clearPrompt() {
    const editorDom = document.querySelector(SELECTORS.promptEditor);
    if (!editorDom) return false;

    editorDom.focus();
    await delay(100);

    // Try Slate API first
    const slateEditor = getSlateEditor(editorDom);
    if (slateEditor) {
      try {
        const children = [...(slateEditor.children || [])];
        if (children.length) {
          // Select all and delete
          slateEditor.select({
            anchor: { path: [0, 0], offset: 0 },
            focus:  { path: [children.length - 1, 0], offset: Infinity }
          });
          slateEditor.deleteFragment();
        }
        log('Cleared via Slate API', 'info');
        return true;
      } catch (e) {
        // Fall through
      }
    }

    // Fallback: select all + delete
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editorDom);
    sel.removeAllRanges();
    sel.addRange(range);
    await delay(50);

    editorDom.dispatchEvent(new InputEvent('beforeinput', {
      inputType: 'deleteContentBackward',
      bubbles: true,
      cancelable: true,
      composed: true
    }));
    await delay(200);

    // Also try execCommand
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    await delay(200);

    log('Cleared prompt', 'info');
    return true;
  }

  /* ============================================================
   *  FIX 4 — Reference image via drop event + File constructor
   *  (clipboard.write requires user gesture, so we simulate
   *   a drag-and-drop or file-input instead)
   * ============================================================ */
  async function fetchImageAsBlob(url) {
    // Try direct fetch, then proxy via cors-anywhere as fallback
    try {
      const r = await fetch(url, { mode: 'cors' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.blob();
    } catch (e1) {
      log(`Direct fetch failed (${e1.message}), trying no-cors`, 'warning');
      // Attempt with no-cors — blob will be opaque but some apps accept it
      try {
        const r2 = await fetch(url, { mode: 'no-cors' });
        return await r2.blob();
      } catch (e2) {
        throw new Error(`Cannot fetch image: ${e2.message}`);
      }
    }
  }

  async function blobToPng(blob) {
    if (blob.type === 'image/png') return blob;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        c.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = URL.createObjectURL(blob);
    });
  }

  async function addReferenceImage(url) {
    log(`Adding reference: ${url.substring(0, 60)}...`, 'info');

    try {
      const blob = await fetchImageAsBlob(url);
      const pngBlob = await blobToPng(blob);

      const file = new File([pngBlob], 'reference.png', { type: 'image/png' });

      const editorDom = document.querySelector(SELECTORS.promptEditor);
      const target = editorDom || document.body;

      /* Strategy A: Simulate a drop event with the file */
      const dt = new DataTransfer();
      dt.items.add(file);

      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      target.dispatchEvent(dropEvent);
      await delay(settings.delayAfterImage);

      /* Strategy B: Find a hidden <input type="file"> and set its files */
      const fileInputs = document.querySelectorAll('input[type="file"]');
      if (fileInputs.length > 0) {
        const fi = fileInputs[fileInputs.length - 1]; // usually the last one
        const dt2 = new DataTransfer();
        dt2.items.add(file);
        fi.files = dt2.files;
        fi.dispatchEvent(new Event('change', { bubbles: true }));
        await delay(settings.delayAfterImage);
        log('Set file via input[type=file]', 'success');
      }

      /* Strategy C: Synthetic paste with image on clipboardData */
      try {
        const dt3 = new DataTransfer();
        dt3.items.add(file);

        const pasteEvt = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt3
        });
        (editorDom || document).dispatchEvent(pasteEvt);
        await delay(settings.delayAfterImage);
      } catch (_) { /* ignore */ }

      log('Reference image dispatched', 'success');
      return true;

    } catch (err) {
      log(`Reference image failed: ${err.message}`, 'error');
      return false;
    }
  }

  /* ============================================================
   *  FIX 5 — clickSubmit with broader button detection
   * ============================================================ */
  async function clickSubmit() {
    // Strategy 1: icon text match
    const allBtns = document.querySelectorAll('button');
    for (const b of allBtns) {
      const icon = b.querySelector('i.google-symbols, i.material-icons, i.material-symbols-outlined');
      if (icon) {
        const t = icon.textContent.trim().toLowerCase();
        if (t === 'arrow_forward' || t === 'send' || t === 'play_arrow') {
          b.click();
          log('Clicked submit button (icon match)', 'success');
          await delay(500);
          return true;
        }
      }
    }

    // Strategy 2: aria-label or title
    for (const b of allBtns) {
      const label = (b.getAttribute('aria-label') || b.title || '').toLowerCase();
      if (label.includes('submit') || label.includes('generate') || label.includes('send') || label.includes('create')) {
        b.click();
        log('Clicked submit button (aria-label match)', 'success');
        await delay(500);
        return true;
      }
    }

    // Strategy 3: data-testid
    for (const b of allBtns) {
      const tid = (b.dataset.testid || '').toLowerCase();
      if (tid.includes('submit') || tid.includes('generate') || tid.includes('send')) {
        b.click();
        log('Clicked submit button (data-testid)', 'success');
        await delay(500);
        return true;
      }
    }

    log('Submit button not found — please click manually', 'warning');
    return false;
  }

  /* ---------- PROCESS QUEUE ---------- */

  async function processQueueItem(index) {
    const item = queue[index];
    item.status = 'running';
    updateQueueUI();
    log(`Processing ${index + 1}/${queue.length}: "${item.image_prompt.substring(0, 40)}..."`, 'info');

    let retries = 0;

    while (retries <= settings.maxRetries) {
      try {
        // 1. Clear
        await clearPrompt();
        await delay(400);

        // 2. Reference images
        if (item.reference_image?.length) {
          for (const refUrl of item.reference_image) {
            if (!isRunning || isPaused) break;
            await addReferenceImage(refUrl);
            await delay(600);
          }
        }

        // 3. Set prompt text  ★ KEY FIX ★
        await setPromptText(item.image_prompt);
        await delay(600);

        // 4. Submit
        if (settings.autoSubmit) {
          const submitted = await clickSubmit();
          if (!submitted) {
            log('Manual submit required for item ' + (index + 1), 'warning');
          }
          if (settings.waitForComplete) {
            await delay(settings.delayBetweenPrompts);
          }
        }

        item.status = 'completed';
        log(`✅ Completed item ${index + 1}`, 'success');
        break;   // success — exit retry loop

      } catch (err) {
        retries++;
        if (retries > settings.maxRetries) {
          item.status = 'error';
          item.error = err.message;
          log(`❌ Failed item ${index + 1} after ${settings.maxRetries} retries: ${err.message}`, 'error');
        } else {
          log(`⚠️ Retry ${retries}/${settings.maxRetries} for item ${index + 1}: ${err.message}`, 'warning');
          await delay(2000);
        }
      }
    }

    updateQueueUI();
  }

  async function runQueue() {
    if (!queue.length) { log('Queue is empty', 'warning'); return; }

    isRunning = true;
    isPaused = false;

    document.getElementById('flow-start').style.display = 'none';
    document.getElementById('flow-pause').style.display = 'inline-block';
    document.getElementById('flow-stop').style.display = 'inline-block';
    document.getElementById('flow-progress').style.display = 'block';

    log('▶ Starting queue…', 'info');

    for (let i = 0; i < queue.length; i++) {
      if (!isRunning) break;
      while (isPaused && isRunning) await delay(500);
      if (!isRunning) break;
      if (queue[i].status === 'completed' || queue[i].status === 'skipped') continue;

      currentIndex = i;
      await processQueueItem(i);

      if (i < queue.length - 1 && isRunning) await delay(settings.delayBetweenPrompts);
    }

    isRunning = false;
    currentIndex = -1;

    document.getElementById('flow-start').style.display = 'inline-block';
    document.getElementById('flow-pause').style.display = 'none';
    document.getElementById('flow-resume').style.display = 'none';
    document.getElementById('flow-stop').style.display = 'none';

    const done = queue.filter(q => q.status === 'completed').length;
    log(`🏁 Queue finished. ${done}/${queue.length} completed.`, 'success');
    updateQueueUI();
  }

  /* ---------- PARSE JSON ---------- */
  function parseJSON() {
    const input = document.getElementById('flow-json-input').value.trim();
    const statusDiv = document.getElementById('flow-status');
    if (!input) { statusDiv.innerHTML = '<span style="color:#ff3b30;">⚠️ Enter JSON data</span>'; return; }

    try {
      const data = JSON.parse(input);
      if (!Array.isArray(data)) throw new Error('JSON must be an array');

      queue = data.map((item, i) => {
        if (!item.image_prompt) throw new Error(`Item ${i + 1} missing "image_prompt"`);
        return { image_prompt: item.image_prompt, reference_image: item.reference_image || [], status: 'pending', error: null };
      });

      statusDiv.innerHTML = `<span style="color:#34c759;">✅ Parsed ${queue.length} prompts</span>`;
      switchTab('queue');
      updateQueueUI();
      log(`Loaded ${queue.length} prompts`, 'success');
    } catch (err) {
      statusDiv.innerHTML = `<span style="color:#ff3b30;">❌ ${err.message}</span>`;
      log(`Parse error: ${err.message}`, 'error');
    }
  }

  function loadSample() {
    document.getElementById('flow-json-input').value = JSON.stringify([
      { image_prompt: "A majestic mountain landscape at sunset with golden light rays", reference_image: [] },
      { image_prompt: "Cyberpunk cityscape with neon lights and flying cars", reference_image: [] },
      { image_prompt: "Cute anime girl with blue hair in a flower garden", reference_image: [] }
    ], null, 2);
    log('Loaded sample data', 'info');
  }

  function switchTab(name) {
    document.querySelectorAll('.flow-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.flow-section').forEach(s => s.classList.toggle('active', s.dataset.section === name));
  }

  function saveSettings() {
    settings.delayBetweenPrompts = parseInt(document.getElementById('set-delay-prompts').value) || 5000;
    settings.delayAfterImage = parseInt(document.getElementById('set-delay-image').value) || 2000;
    settings.autoSubmit = document.getElementById('set-auto-submit').value === 'true';
    settings.maxRetries = parseInt(document.getElementById('set-max-retries').value) || 2;
    log('Settings saved', 'success');
    alert('✅ Settings saved!');
  }

  /* ---------- EVENTS ---------- */
  btn.onclick = () => { overlay.style.display = 'block'; };
  document.getElementById('flow-close').onclick = () => { overlay.style.display = 'none'; };
  document.querySelectorAll('.flow-tab').forEach(t => { t.onclick = () => switchTab(t.dataset.tab); });
  document.getElementById('flow-parse').onclick = parseJSON;
  document.getElementById('flow-sample').onclick = loadSample;
  document.getElementById('flow-clear-input').onclick = () => { document.getElementById('flow-json-input').value = ''; };
  document.getElementById('flow-start').onclick = runQueue;
  document.getElementById('flow-pause').onclick = () => {
    isPaused = true;
    document.getElementById('flow-pause').style.display = 'none';
    document.getElementById('flow-resume').style.display = 'inline-block';
    log('⏸ Paused', 'warning');
  };
  document.getElementById('flow-resume').onclick = () => {
    isPaused = false;
    document.getElementById('flow-pause').style.display = 'inline-block';
    document.getElementById('flow-resume').style.display = 'none';
    log('▶ Resumed', 'info');
  };
  document.getElementById('flow-stop').onclick = () => { isRunning = false; isPaused = false; log('⏹ Stopped', 'warning'); };
  document.getElementById('flow-reset').onclick = () => {
    queue.forEach(q => { q.status = 'pending'; q.error = null; });
    currentIndex = -1;
    updateQueueUI();
    document.getElementById('flow-log').innerHTML = '';
    log('🔄 Queue reset', 'info');
  };
  document.getElementById('flow-save-settings').onclick = saveSettings;
  document.getElementById('flow-export-settings').onclick = () => {
    const cfg = { settings, queue: queue.map(q => ({ image_prompt: q.image_prompt, reference_image: q.reference_image })) };
    navigator.clipboard.writeText(JSON.stringify(cfg, null, 2));
    alert('✅ Copied to clipboard');
  };
  document.getElementById('flow-import-settings').onclick = () => {
    const raw = prompt('Paste config JSON:');
    if (!raw) return;
    try {
      const cfg = JSON.parse(raw);
      if (cfg.settings) {
        Object.assign(settings, cfg.settings);
        document.getElementById('set-delay-prompts').value = settings.delayBetweenPrompts;
        document.getElementById('set-delay-image').value = settings.delayAfterImage;
        document.getElementById('set-auto-submit').value = String(settings.autoSubmit);
        document.getElementById('set-max-retries').value = settings.maxRetries;
      }
      if (cfg.queue) document.getElementById('flow-json-input').value = JSON.stringify(cfg.queue, null, 2);
      alert('✅ Imported');
    } catch (e) { alert('❌ ' + e.message); }
  };

  log('Flow Automation loaded ✓', 'success');
})();
