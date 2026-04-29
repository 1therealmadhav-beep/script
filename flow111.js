/**
 * Flow Automation v2.0
 * Server-Driven AI Image Generation with Character References
 * API: https://flow-auto.mdvdev.store/
 */

(function () {
  if (window.__FLOW_AUTOMATION_V2__) return;
  window.__FLOW_AUTOMATION_V2__ = true;

  /* ============================================================
   *  SERVER CONFIGURATION
   * ============================================================ */
  const SERVER_API = {
    base: 'https://flow-auto.mdvdev.store/api',
    promptsEndpoint:  '/prompts',
    markDoneEndpoint: '/prompts/done',
    statsEndpoint:    '/stats',
    pollInterval: 8000,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_SECRET_KEY_HERE', // ← CHANGE THIS
    }
  };

  /* ============================================================
   *  CHARACTER REGISTRY
   * ============================================================ */
  const CHARACTER_REGISTRY = {
    jagannath: {
      id: 'fe_id_c095ec5c-b3be-4230-a11c-48de5a241d3a',
      displayName: 'Lord Jagannath',
      emoji: '🙏'
    },
    indra_swami: {
      id: 'fe_id_40ae8ac3-e27a-4544-a281-2614cdfc61ba',
      displayName: 'Indra Swami',
      emoji: '🧙'
    },
    bhairav: {
      id: 'fe_id_24ee5e2a-86bb-4f2c-9eed-7a57b5f13822',
      displayName: 'Lord Bhairav',
      emoji: '⚡'
    }
  };

  /* ============================================================
   *  INJECT TAILWIND CSS
   * ============================================================ */
  if (!document.getElementById('flow-tw-cdn')) {
    const tw = document.createElement('script');
    tw.id = 'flow-tw-cdn';
    tw.src = 'https://cdn.tailwindcss.com';
    tw.onload = () => {
      window.tailwind?.config({
        darkMode: 'class',
        theme: {
          extend: {
            animation: {
              'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
            },
            keyframes: {
              pulseGlow: {
                '0%,100%': { boxShadow: '0 0 5px rgba(102,126,234,.3)' },
                '50%':     { boxShadow: '0 0 20px rgba(102,126,234,.7)' },
              },
            },
          },
        },
      });
      initUI();
    };
    document.head.appendChild(tw);
  } else {
    initUI();
  }

  /* ============================================================
   *  CUSTOM STYLES
   * ============================================================ */
  if (!document.getElementById('flow-custom-style')) {
    const style = document.createElement('style');
    style.id = 'flow-custom-style';
    style.textContent = `
      #flow-root * { box-sizing: border-box; font-family: system-ui, sans-serif; }
      #flow-root ::-webkit-scrollbar { width: 4px; }
      #flow-root ::-webkit-scrollbar-track { background: #1e1e3a; }
      #flow-root ::-webkit-scrollbar-thumb { background: #667eea; border-radius: 2px; }
      .flow-grad-text {
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .flow-pulse { animation: pulseGlow 2s ease-in-out infinite; }
      @keyframes pulseGlow {
        0%,100%{ box-shadow: 0 0 5px rgba(102,126,234,.3); }
        50%{ box-shadow: 0 0 20px rgba(102,126,234,.7); }
      }
      .flow-fade-in { animation: fadeIn .2s ease; }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    `;
    document.head.appendChild(style);
  }

  /* ============================================================
   *  STATE
   * ============================================================ */
  let queue = [];
  let currentIndex = -1;
  let isRunning = false;
  let isPaused = false;
  let serverPolling = false;
  let serverPollTimer = null;
  let serverStatus = 'disconnected';
  let stats = { pending: 0, running: 0, completed: 0, error: 0 };

  let settings = {
    serverEnabled: true,
    autoStartOnServerPrompt: true,
    delayBetweenPrompts: 6000,
    delayAfterRefImage: 2500,
    autoSubmit: true,
    maxRetries: 2,
    defaultCharacters: []
  };

  /* ============================================================
   *  UTILITY
   * ============================================================ */
  function log(msg, type = 'info') {
    const colors = {
      info:    '#5ac8fa',
      success: '#34c759',
      error:   '#ff3b30',
      warning: '#ff9500',
      server:  '#bf5af2',
    };
    console.log(
      `%c[Flow] ${msg}`,
      `color: ${colors[type] || colors.info}; font-weight: bold;`
    );
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ============================================================
   *  SERVER API
   * ============================================================ */
  async function fetchServerPrompts() {
    setServerStatus('checking', 'Checking server…');
    try {
      const resp = await fetch(
        `${SERVER_API.base}${SERVER_API.promptsEndpoint}?limit=5`,
        { method: 'GET', headers: SERVER_API.headers }
      );

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();

      if (!data.success) throw new Error(data.error || 'API error');

      if (data.data === null || (Array.isArray(data.data) && data.data.length === 0)) {
        setServerStatus('null-queue', '✅ Connected — Queue empty, waiting…');
        log('Server returned null/empty', 'server');
        return [];
      }

      const prompts = Array.isArray(data.data) ? data.data : [data.data];
      setServerStatus('connected', `✅ Connected — ${prompts.length} prompt(s) received`);
      log(`📡 Server: ${prompts.length} prompt(s)`, 'server');
      return prompts;

    } catch (err) {
      setServerStatus('disconnected', `❌ Error: ${err.message}`);
      log(`Server error: ${err.message}`, 'error');
      return [];
    }
  }

  async function markServerPromptDone(item) {
    if (!item.server_id) return;
    try {
      await fetch(`${SERVER_API.base}${SERVER_API.markDoneEndpoint}`, {
        method: 'POST',
        headers: SERVER_API.headers,
        body: JSON.stringify({ id: item.server_id, status: 'completed' })
      });
      log(`Marked ${item.server_id} as done`, 'server');
    } catch (err) {
      log(`Failed to mark done: ${err.message}`, 'warning');
    }
  }

  function serverPromptsToQueueItems(serverPrompts) {
    return serverPrompts.map(p => {
      const charKeys = p.characters || settings.defaultCharacters;
      const refIds = p.reference_ids || charKeys
        .map(k => CHARACTER_REGISTRY[k]?.id)
        .filter(Boolean);

      return {
        image_prompt: p.image_prompt || p.prompt || String(p),
        characters: charKeys,
        reference_ids: refIds,
        reference_image: p.reference_image || [],
        status: 'pending',
        source: 'server',
        server_id: p.id || null,
        error: null
      };
    });
  }

  async function pollServer() {
    if (!serverPolling) return;
    const prompts = await fetchServerPrompts();
    if (prompts.length > 0) {
      const newItems = serverPromptsToQueueItems(prompts);
      newItems.forEach(ni => {
        const exists = ni.server_id && queue.some(q => q.server_id === ni.server_id);
        if (!exists) {
          queue.push(ni);
          log(`Queued: "${ni.image_prompt.substring(0, 50)}…"`, 'server');
        }
      });
      updateUI();
      if (settings.autoStartOnServerPrompt && !isRunning) {
        log('Auto-starting queue…', 'server');
        await delay(1000);
        runQueue();
      }
    }
    if (serverPolling) {
      serverPollTimer = setTimeout(pollServer, SERVER_API.pollInterval);
    }
  }

  function setServerStatus(status, msg) {
    serverStatus = status;
    updateUI();
  }

  /* ============================================================
   *  DOM MANIPULATION HELPERS (Slate Editor)
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
      const props = fiber.memoizedProps || fiber.pendingProps || {};
      if (props.editor && typeof props.editor.insertText === 'function')
        return props.editor;
      if (fiber.stateNode?.editor && typeof fiber.stateNode.editor.insertText === 'function')
        return fiber.stateNode.editor;
      fiber = fiber.return;
      depth++;
    }
    return null;
  }

  async function clearPrompt() {
    const ed = document.querySelector('div[role="textbox"][data-slate-editor="true"]');
    if (!ed) return;
    ed.focus();
    await delay(150);

    const slateEd = getSlateEditor(ed);
    if (slateEd) {
      try {
        slateEd.select({ anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: Infinity } });
        slateEd.deleteFragment();
        log('Cleared via Slate API', 'info');
        return;
      } catch (_) {}
    }

    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(ed);
    sel.removeAllRanges();
    sel.addRange(r);
    await delay(80);
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    ed.dispatchEvent(new Event('input', { bubbles: true }));
    await delay(200);
    log('Cleared prompt', 'info');
  }

  async function setPromptText(text) {
    const ed = document.querySelector('div[role="textbox"][data-slate-editor="true"]');
    if (!ed) throw new Error('Prompt editor not found');
    ed.focus();
    await delay(200);

    const slateEd = getSlateEditor(ed);
    if (slateEd) {
      try {
        slateEd.select({ anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: Infinity } });
        slateEd.deleteFragment();
        slateEd.insertText(text);
        ed.dispatchEvent(new Event('input', { bubbles: true }));
        await delay(300);
        log('Set text via Slate API ✓', 'success');
        return;
      } catch (e) {
        log('Slate API failed: ' + e.message, 'warning');
      }
    }

    const dt = new DataTransfer();
    dt.setData('text/plain', text);
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(ed);
    sel.removeAllRanges();
    sel.addRange(r);
    ed.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
    await delay(400);
    log('Set text via paste ✓', 'success');
  }

  async function injectInternalReferenceId(feId) {
    log(`Injecting reference: ${feId.substring(0, 30)}…`, 'info');

    const allElements = document.querySelectorAll('[data-image-id], [data-fe-id], [data-id]');
    for (const el of allElements) {
      const elId = el.dataset.imageId || el.dataset.feId || el.dataset.id;
      if (elId === feId) {
        el.click();
        await delay(800);
        log('Reused reference chip ✓', 'success');
        return true;
      }
    }

    try {
      const evt = new CustomEvent('add-reference-image', {
        bubbles: true,
        detail: { imageId: feId, source: 'REUSE_PROMPT' }
      });
      document.dispatchEvent(evt);
      await delay(600);
    } catch (_) {}

    try {
      window.postMessage({ type: 'ADD_REFERENCE_INGREDIENT', imageId: feId, source: 'REUSE_PROMPT' }, '*');
      await delay(600);
    } catch (_) {}

    log(`Reference dispatched (${feId.substring(0, 20)}…)`, 'warning');
    return true;
  }

  async function injectExternalImageUrl(url) {
    log(`Fetching: ${url.substring(0, 50)}…`, 'info');
    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      let blob = await resp.blob();

      if (blob.type !== 'image/png') {
        blob = await new Promise((res, rej) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext('2d').drawImage(img, 0, 0);
            c.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png');
            URL.revokeObjectURL(img.src);
          };
          img.onerror = () => rej(new Error('decode failed'));
          img.src = URL.createObjectURL(blob);
        });
      }

      const file = new File([blob], 'ref.png', { type: 'image/png' });
      const ed = document.querySelector('div[role="textbox"][data-slate-editor="true"]');

      const dt = new DataTransfer();
      dt.items.add(file);
      const dropTarget = ed || document.body;
      dropTarget.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
      await delay(settings.delayAfterRefImage);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        const dt2 = new DataTransfer();
        dt2.items.add(file);
        fileInput.files = dt2.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        await delay(settings.delayAfterRefImage);
      }

      log('External image injected ✓', 'success');
      return true;
    } catch (err) {
      log(`External image failed: ${err.message}`, 'error');
      return false;
    }
  }

  async function clickSubmit() {
    for (const b of document.querySelectorAll('button')) {
      const icon = b.querySelector('i.google-symbols,i.material-icons,i.material-symbols-outlined');
      if (icon) {
        const t = icon.textContent.trim().toLowerCase();
        if (['arrow_forward', 'send', 'play_arrow', 'create', 'generate'].includes(t)) {
          b.click();
          log('Submit ✓ (icon)', 'success');
          await delay(500);
          return true;
        }
      }
      const label = (b.getAttribute('aria-label') || b.title || '').toLowerCase();
      if (['submit', 'generate', 'send', 'create', 'run', 'go'].some(w => label.includes(w))) {
        b.click();
        log('Submit ✓ (aria)', 'success');
        await delay(500);
        return true;
      }
    }
    log('Submit button not found — click manually', 'warning');
    return false;
  }

  /* ============================================================
   *  PROCESS QUEUE
   * ============================================================ */
  async function processItem(index) {
    const item = queue[index];
    item.status = 'running';
    updateUI();
    log(`[${index + 1}/${queue.length}] Processing: "${item.image_prompt.substring(0, 50)}…"`, 'info');

    let retries = 0;
    while (retries <= settings.maxRetries) {
      try {
        await clearPrompt();
        await delay(400);

        const refIds = item.reference_ids || [];
        for (const rid of refIds) {
          if (!isRunning || isPaused) break;
          await injectInternalReferenceId(rid);
          await delay(settings.delayAfterRefImage);
        }

        const refUrls = item.reference_image || [];
        for (const rurl of refUrls) {
          if (!isRunning || isPaused) break;
          await injectExternalImageUrl(rurl);
          await delay(settings.delayAfterRefImage);
        }

        await setPromptText(item.image_prompt);
        await delay(600);

        if (settings.autoSubmit) {
          await clickSubmit();
          await delay(settings.delayBetweenPrompts);
        }

        if (item.source === 'server') {
          await markServerPromptDone(item);
        }

        item.status = 'completed';
        log(`✅ Done [${index + 1}]`, 'success');
        break;

      } catch (err) {
        retries++;
        if (retries > settings.maxRetries) {
          item.status = 'error';
          item.error = err.message;
          log(`❌ Failed [${index + 1}]: ${err.message}`, 'error');
        } else {
          log(`⚠️ Retry ${retries} for [${index + 1}]: ${err.message}`, 'warning');
          await delay(3000);
        }
      }
    }
    updateUI();
  }

  async function runQueue() {
    if (!queue.length) {
      log('Queue is empty', 'warning');
      return;
    }
    if (isRunning) {
      log('Already running', 'warning');
      return;
    }

    isRunning = true;
    isPaused = false;
    log('▶ Queue started', 'info');
    updateUI();

    for (let i = 0; i < queue.length; i++) {
      if (!isRunning) break;
      while (isPaused && isRunning) await delay(500);
      if (!isRunning) break;
      if (['completed', 'skipped'].includes(queue[i].status)) continue;
      currentIndex = i;
      await processItem(i);
      if (i < queue.length - 1 && isRunning) await delay(settings.delayBetweenPrompts);
    }

    isRunning = false;
    currentIndex = -1;
    const done = queue.filter(q => q.status === 'completed').length;
    log(`🏁 Finished. ${done}/${queue.length} completed.`, 'success');
    updateUI();
  }

  /* ============================================================
   *  UI RENDERING
   * ============================================================ */
  function initUI() {
    if (document.getElementById('flow-fab')) return;

    const fab = document.createElement('div');
    fab.id = 'flow-fab';
    fab.className = `
      fixed bottom-5 right-5 z-[999999] w-14 h-14 rounded-2xl cursor-pointer
      flex items-center justify-center text-2xl select-none
      bg-gradient-to-br from-indigo-500 to-purple-600
      shadow-lg shadow-indigo-500/40 hover:scale-110 hover:shadow-indigo-500/60
      transition-all duration-200
    `;
    fab.innerHTML = '🚀';
    fab.title = 'Flow Automation';
    document.body.appendChild(fab);

    const root = document.createElement('div');
    root.id = 'flow-root';
    root.className = 'fixed inset-0 z-[999998] hidden items-end justify-end p-4 bg-black/80';
    document.body.appendChild(root);

    fab.onclick = () => {
      const open = root.style.display === 'flex';
      root.style.display = open ? 'none' : 'flex';
      if (!open) updateUI();
    };

    root.onclick = e => {
      if (e.target === root) root.style.display = 'none';
    };

    updateUI();
  }

  function updateUI() {
    const root = document.getElementById('flow-root');
    if (!root || root.style.display === 'none') return;

    const statusColors = {
      disconnected: 'text-red-400 bg-red-900/20 border-red-900/40',
      checking: 'text-yellow-400 bg-yellow-900/20 border-yellow-900/40',
      connected: 'text-green-400 bg-green-900/20 border-green-900/40',
      'null-queue': 'text-blue-400 bg-blue-900/20 border-blue-900/40',
    };

    const pending = queue.filter(q => q.status === 'pending').length;
    const running = queue.filter(q => q.status === 'running').length;
    const completed = queue.filter(q => q.status === 'completed').length;
    const error = queue.filter(q => q.status === 'error').length;

    root.innerHTML = `
      <div class="relative w-full max-w-md h-[92vh] max-h-[700px]
        bg-gray-950 rounded-2xl shadow-2xl shadow-black/60
        border border-gray-800/60 flex flex-col overflow-hidden flow-fade-in">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
          <div class="flex items-center gap-2">
            <span class="text-xl">🚀</span>
            <div>
              <h1 class="text-sm font-bold flow-grad-text">Flow Automation</h1>
              <p class="text-[10px] text-gray-500">${queue.length} in queue</p>
            </div>
          </div>
          <button id="flow-close"
            class="w-7 h-7 rounded-lg bg-gray-800 text-gray-400
              hover:bg-red-900/50 hover:text-red-400 flex items-center
              justify-center text-sm font-bold transition">
            ✕
          </button>
        </div>

        <!-- Server Status -->
        <div class="px-4 py-2 border-b border-gray-800/60">
          <div class="text-xs ${statusColors[serverStatus] || statusColors.disconnected}
            px-3 py-2 rounded-lg border flex items-center gap-2">
            <div class="w-2 h-2 rounded-full ${
              serverStatus === 'connected' || serverStatus === 'null-queue'
                ? 'bg-green-400'
                : serverStatus === 'checking'
                ? 'bg-yellow-400 animate-pulse'
                : 'bg-red-400'
            }"></div>
            <span class="flex-1">${
              serverStatus === 'connected' ? '✅ Server connected' :
              serverStatus === 'null-queue' ? '⏳ Queue empty' :
              serverStatus === 'checking' ? '🔄 Checking…' :
              '❌ Not connected'
            }</span>
            ${!serverPolling ? `
              <button id="flow-start-poll"
                class="text-[10px] bg-indigo-900/50 text-indigo-300
                  px-2 py-1 rounded hover:bg-indigo-900/70 transition">
                Start
              </button>
            ` : `
              <button id="flow-stop-poll"
                class="text-[10px] bg-red-900/50 text-red-300
                  px-2 py-1 rounded hover:bg-red-900/70 transition">
                Stop
              </button>
            `}
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-4 gap-2 px-4 py-3 border-b border-gray-800/60">
          ${[
            { label: 'Pending', value: pending, color: 'yellow' },
            { label: 'Running', value: running, color: 'indigo' },
            { label: 'Done', value: completed, color: 'green' },
            { label: 'Error', value: error, color: 'red' },
          ].map(s => `
            <div class="bg-gray-900/50 rounded-lg p-2 border border-gray-800/60 text-center">
              <div class="text-lg font-bold text-${s.color}-400">${s.value}</div>
              <div class="text-[9px] text-gray-500">${s.label}</div>
            </div>
          `).join('')}
        </div>

        <!-- Controls -->
        <div class="px-4 py-2 border-b border-gray-800/60 flex gap-2">
          ${!isRunning ? `
            <button id="flow-run"
              class="flex-1 py-2 rounded-lg text-xs font-semibold
                bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                hover:opacity-90 transition">
              ▶️ Run Queue
            </button>
          ` : `
            ${!isPaused ? `
              <button id="flow-pause"
                class="flex-1 py-2 rounded-lg text-xs font-semibold
                  bg-yellow-900/50 text-yellow-400 border border-yellow-800/50
                  hover:bg-yellow-900/70 transition">
                ⏸️ Pause
              </button>
            ` : `
              <button id="flow-resume"
                class="flex-1 py-2 rounded-lg text-xs font-semibold
                  bg-green-900/50 text-green-400 border border-green-800/50
                  hover:bg-green-900/70 transition">
                ▶️ Resume
              </button>
            `}
            <button id="flow-stop"
              class="flex-1 py-2 rounded-lg text-xs font-semibold
                bg-red-900/50 text-red-400 border border-red-800/50
                hover:bg-red-900/70 transition">
              ⏹ Stop
            </button>
          `}
          <button id="flow-clear"
            class="px-3 py-2 rounded-lg text-xs font-semibold
              bg-gray-800 text-gray-400 hover:bg-gray-700 transition">
            🗑️
          </button>
        </div>

        <!-- Queue List -->
        <div class="flex-1 overflow-y-auto px-4 py-2">
          ${queue.length === 0 ? `
            <div class="flex flex-col items-center justify-center h-full text-gray-600">
              <div class="text-4xl mb-3 opacity-30">🔖</div>
              <p class="text-sm">Queue is empty</p>
              <p class="text-xs mt-1">Server will auto-populate</p>
            </div>
          ` : queue.map((item, i) => {
            const statusIcons = {
              pending: '⏳', running: '🔄', completed: '✅', error: '❌'
            };
            const statusColors = {
              pending: 'border-yellow-900/40 bg-yellow-900/10',
              running: 'border-indigo-500/60 bg-indigo-900/20 flow-pulse',
              completed: 'border-green-900/40 bg-green-900/10 opacity-60',
              error: 'border-red-900/40 bg-red-900/10',
            };
            return `
              <div class="rounded-xl p-3 mb-2 border ${statusColors[item.status] || statusColors.pending}">
                <div class="flex gap-2">
                  <div class="text-lg flex-shrink-0">${statusIcons[item.status] || '⏳'}</div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-200 line-clamp-2">${item.image_prompt.substring(0, 80)}${item.image_prompt.length > 80 ? '…' : ''}</p>
                    ${item.characters?.length ? `
                      <div class="flex flex-wrap gap-1 mt-1">
                        ${item.characters.map(k => `
                          <span class="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/40 text-indigo-300">
                            ${CHARACTER_REGISTRY[k]?.emoji || '🎭'} ${CHARACTER_REGISTRY[k]?.displayName || k}
                          </span>
                        `).join('')}
                      </div>
                    ` : ''}
                    <div class="flex items-center gap-2 mt-1 text-[9px] text-gray-600">
                      <span>${item.status.toUpperCase()}</span>
                      ${item.source === 'server' ? '<span class="text-blue-400">🌐 SERVER</span>' : ''}
                      ${item.error ? `<span class="text-red-400">⚠️ ${item.error}</span>` : ''}
                    </div>
                  </div>
                  <div class="text-xs font-bold text-gray-500">#${i + 1}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer -->
        <div class="px-4 py-2 border-t border-gray-800/60 text-center text-[9px] text-gray-700">
          Flow Automation v2.0 · API: ${SERVER_API.base}
        </div>
      </div>
    `;

    document.getElementById('flow-close')?.addEventListener('click', () => {
      root.style.display = 'none';
    });

    document.getElementById('flow-start-poll')?.addEventListener('click', () => {
      serverPolling = true;
      log('🌐 Server polling started', 'server');
      pollServer();
      updateUI();
    });

    document.getElementById('flow-stop-poll')?.addEventListener('click', () => {
      serverPolling = false;
      clearTimeout(serverPollTimer);
      setServerStatus('disconnected', 'Polling stopped');
      log('Server polling stopped', 'warning');
      updateUI();
    });

    document.getElementById('flow-run')?.addEventListener('click', runQueue);

    document.getElementById('flow-pause')?.addEventListener('click', () => {
      isPaused = true;
      log('⏸ Paused', 'warning');
      updateUI();
    });

    document.getElementById('flow-resume')?.addEventListener('click', () => {
      isPaused = false;
      log('▶ Resumed', 'info');
      updateUI();
    });

    document.getElementById('flow-stop')?.addEventListener('click', () => {
      isRunning = false;
      isPaused = false;
      log('⏹ Stopped', 'warning');
      updateUI();
    });

    document.getElementById('flow-clear')?.addEventListener('click', () => {
      if (!confirm('Clear all queue items?')) return;
      queue = [];
      log('Queue cleared', 'warning');
      updateUI();
    });
  }

  /* ============================================================
   *  INIT
   * ============================================================ */
  log('Flow Automation v2.0 loaded ✓', 'success');
  log(`API: ${SERVER_API.base}`, 'info');
  log('Characters: ' + Object.keys(CHARACTER_REGISTRY).join(', '), 'info');

})();
