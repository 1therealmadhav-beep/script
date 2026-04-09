(function(){
  "use strict";

  console.log('%c[Image Saver] v5 – Loop‑Safe + IndexedDB', 'color: #06b6d4; font-weight: bold');

  // --- Remove old instances -------------------------------------------------
  ['_img_fab','_img_overlay','_img_toast'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.remove();
  });
  delete window.__IMG_SAVER_INSTALLED__;

  // --- Config --------------------------------------------------------------
  const ACCENT_COLOR = '#06b6d4';
  const DB_NAME = 'ImageSaverDB';
  const STORE_NAME = 'images';
  const DB_VERSION = 1;

  // --- State ---------------------------------------------------------------
  let allImages = [];
  let currentTab = 'all';
  const selected = new Set();
  let db = null;
  let isInternalOperation = false;          // 🔄 Prevents recursion in fetch interceptor
  let refreshScheduled = false;             // 🕒 Debounced UI refresh

  // --- Utilities -----------------------------------------------------------
  const getExt = u => {
    const parts = u.split('?')[0].split('#')[0].split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };
  const fileName = u => {
    try {
      const url = new URL(u, location.href);
      const name = decodeURIComponent(url.pathname.split('/').pop() || '');
      return name || 'image';
    } catch { return 'image'; }
  };
  const generateId = () => Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  // --- Toast ---------------------------------------------------------------
  let toastWrap;
  function toast(msg, color = ACCENT_COLOR){
    if(!toastWrap){
      toastWrap = document.createElement('div');
      toastWrap.id = '_img_toast';
      toastWrap.style.cssText = 'position:fixed;bottom:82px;right:24px;z-index:2147483648;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none;';
      document.body.appendChild(toastWrap);
    }
    const t = document.createElement('div');
    t.style.cssText = `background:#0f0f13;border-left:4px solid ${color};color:#fff;font:600 12px/1.4 'Segoe UI',sans-serif;padding:10px 16px;border-radius:8px;box-shadow:0 8px 20px rgba(0,0,0,0.5);max-width:280px;opacity:0;transform:translateX(10px);transition:all 0.2s;`;
    t.textContent = msg;
    toastWrap.appendChild(t);
    requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateX(0)'; });
    setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(10px)'; setTimeout(()=>t.remove(),300); },3000);
  }

  // --- IndexedDB Helpers ---------------------------------------------------
  async function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };
      request.onupgradeneeded = (ev) => {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async function saveImageToDB(imageData) {
    if (!db) await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(imageData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async function loadAllImagesFromDB() {
    if (!db) await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async function deleteImageFromDB(id) {
    if (!db) await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async function clearAllImagesFromDB() {
    if (!db) await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- Capture image (stores blob in IndexedDB) ----------------------------
  async function captureImage(blob, urlHint = '', mimeType = '', fromUpscale = true) {
    if (!blob) return;

    const id = generateId();
    const url = urlHint || URL.createObjectURL(blob);
    const mime = mimeType || blob.type || 'image/png';
    const ext = getExt(url) || mime.split('/')[1] || 'png';
    const timestamp = Date.now();

    const imageEntry = {
      id,
      url,
      blob,
      mime,
      ext,
      timestamp,
      sessionCapture: fromUpscale
    };

    try {
      await saveImageToDB(imageEntry);
      allImages.push(imageEntry);
      console.log(`[Image Saver] Saved to IndexedDB:`, { id, mime });
      toast(`💾 Image saved to storage`, ACCENT_COLOR);
    } catch (e) {
      console.error('Failed to save:', e);
      toast('❌ Save failed', '#ef4444');
      return;
    }

    // Update badge counter
    document.getElementById('_img_count').textContent = allImages.length;

    // Debounced UI refresh
    scheduleRefresh();
  }

  // --- Debounced refresh to prevent rapid UI updates -----------------------
  function scheduleRefresh() {
    if (refreshScheduled) return;
    refreshScheduled = true;
    requestAnimationFrame(() => {
      refreshScheduled = false;
      softRefresh();
    });
  }

  // --- Scan page for existing images (only called manually) ----------------
  function scanPageImages() {
    // This is optional and not used automatically to avoid loops.
    // You can call it manually via "Rescan" button.
  }

  // --- MutationObserver (skips own UI) -------------------------------------
  const observer = new MutationObserver(muts => {
    // Ignore if panel is closed or we're doing internal operations
    if (isInternalOperation) return;

    muts.forEach(m => m.addedNodes.forEach(async node => {
      if (node.nodeType !== 1) return;

      // 🛡️ Skip our own UI elements
      if (node.id && node.id.startsWith('_img_')) return;
      if (node.closest && node.closest('#_img_overlay')) return;

      // Process IMG elements
      if (node.tagName === 'IMG') {
        const src = node.currentSrc || node.src;
        if (src && (src.startsWith('blob:') || src.startsWith('data:'))) {
          await captureFromSrc(src);
        }
      }
      if (node.querySelectorAll) {
        node.querySelectorAll('img').forEach(async img => {
          if (img.closest('#_img_overlay')) return; // skip our own thumbnails
          const src = img.currentSrc || img.src;
          if (src && (src.startsWith('blob:') || src.startsWith('data:'))) {
            await captureFromSrc(src);
          }
        });
      }
    }));
  });

  async function captureFromSrc(src) {
    if (isInternalOperation) return;
    try {
      isInternalOperation = true;
      const res = await fetch(src);
      const blob = await res.blob();
      if (blob.type.startsWith('image/')) {
        await captureImage(blob, src, blob.type, true);
      }
    } catch (e) {
      // blob revoked or CORS
    } finally {
      isInternalOperation = false;
    }
  }

  observer.observe(document.documentElement, { childList: true, subtree: true });

  // --- 🔴 DOWNLOAD BLOCKING (with recursion guards) ------------------------
  async function blockDownload(blob, url, mimeType, method) {
    if (isInternalOperation) return; // prevent recursion
    console.log(`[Image Saver] Blocked ${method}:`, url || 'blob');
    await captureImage(blob, url, mimeType, true);
    toast(`🚫 Auto‑download blocked – saved`, ACCENT_COLOR);
  }

  // 1. Click on <a download>
  document.addEventListener('click', e => {
    const a = e.target.closest('a[download]');
    if (!a || !a.href) return;
    e.preventDefault();
    e.stopPropagation();

    // Use internal flag to avoid fetch interceptor loop
    isInternalOperation = true;
    fetch(a.href)
      .then(res => res.blob())
      .then(blob => {
        if (blob.type.startsWith('image/')) {
          captureImage(blob, a.href, blob.type, true);
        }
      })
      .catch(() => {})
      .finally(() => { isInternalOperation = false; });
    toast(`🚫 Download link blocked`, ACCENT_COLOR);
  }, true);

  // 2. Intercept fetch responses (skip internal)
  const origFetch = window.fetch;
  window.fetch = function(...args) {
    // Skip if internal operation
    if (isInternalOperation) return origFetch.apply(this, args);

    return origFetch.apply(this, args).then(async resp => {
      const cloned = resp.clone();
      const disp = cloned.headers.get('Content-Disposition') || '';
      const isAttachment = disp.includes('attachment');
      const ctype = cloned.headers.get('Content-Type') || '';
      if (isAttachment && ctype.startsWith('image/')) {
        const blob = await cloned.blob();
        await blockDownload(blob, resp.url, ctype, 'fetch attachment');
        return new Response(null, { status: 204 });
      }
      return resp;
    });
  };

  // 3. Intercept XHR (skip internal)
  const XHR = XMLHttpRequest.prototype;
  const origOpen = XHR.open;
  const origSend = XHR.send;
  XHR.open = function(method, url) {
    this._img_url = url;
    this._img_internal = isInternalOperation;
    return origOpen.apply(this, arguments);
  };
  XHR.send = function() {
    if (this._img_internal) return origSend.apply(this, arguments);
    this.addEventListener('load', function() {
      const disp = this.getResponseHeader('Content-Disposition') || '';
      const ctype = this.getResponseHeader('Content-Type') || '';
      if (disp.includes('attachment') && ctype.startsWith('image/')) {
        const blob = new Blob([this.response], { type: ctype });
        blockDownload(blob, this._img_url, ctype, 'XHR attachment');
        Object.defineProperty(this, 'response', { value: null });
        Object.defineProperty(this, 'responseText', { value: '' });
      }
    });
    return origSend.apply(this, arguments);
  };

  // 4. Override anchor click
  const originalClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function() {
    if (!isInternalOperation && this.href) {
      isInternalOperation = true;
      fetch(this.href).then(res => res.blob()).then(blob => {
        if (blob.type.startsWith('image/')) {
          captureImage(blob, this.href, blob.type, true);
        }
      }).catch(() => {}).finally(() => { isInternalOperation = false; });
      toast(`🚫 Programmatic download blocked`, ACCENT_COLOR);
      return;
    }
    return originalClick.call(this);
  };

  // 5. Override window.open
  const originalOpen = window.open;
  window.open = function(url, ...args) {
    if (!isInternalOperation && url && (url.startsWith('blob:') || url.startsWith('data:'))) {
      isInternalOperation = true;
      fetch(url).then(res => res.blob()).then(blob => {
        if (blob.type.startsWith('image/')) {
          captureImage(blob, url, blob.type, true);
        }
      }).catch(() => {}).finally(() => { isInternalOperation = false; });
      toast(`🚫 window.open blocked`, ACCENT_COLOR);
      return null;
    }
    return originalOpen.call(this, url, ...args);
  };

  // 6. Monitor location.href
  const originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
  if (originalLocationDescriptor?.configurable) {
    Object.defineProperty(window, 'location', {
      get: () => originalLocationDescriptor.get ? originalLocationDescriptor.get.call(window) : location,
      set: function(val) {
        if (!isInternalOperation && typeof val === 'string' && (val.startsWith('blob:') || val.startsWith('data:'))) {
          isInternalOperation = true;
          fetch(val).then(res => res.blob()).then(blob => {
            if (blob.type.startsWith('image/')) {
              captureImage(blob, val, blob.type, true);
            }
          }).catch(() => {}).finally(() => { isInternalOperation = false; });
          toast(`🚫 location.href blocked`, ACCENT_COLOR);
          return;
        }
        if (originalLocationDescriptor.set) {
          originalLocationDescriptor.set.call(this, val);
        } else {
          location.href = val;
        }
      },
      configurable: true
    });
  }

  // --- UI Styles (same as before, omitted for brevity – use full version) ---
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:opsz@14..32&display=swap');
    * { box-sizing: border-box; }

    #_img_fab {
      position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
      background: linear-gradient(145deg, #0b0e14 0%, #1a1f2c 100%);
      border: 1px solid ${ACCENT_COLOR}40;
      color: #fff; padding: 12px 20px; border-radius: 40px;
      cursor: pointer; font: 600 13px 'Inter', sans-serif;
      box-shadow: 0 8px 20px rgba(0,0,0,0.5), 0 0 0 1px ${ACCENT_COLOR}20 inset;
      display: flex; align-items: center; gap: 10px;
      backdrop-filter: blur(8px);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #_img_fab:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 28px #00000060, 0 0 0 1px ${ACCENT_COLOR} inset;
    }
    #_img_fab .dot { width: 8px; height: 8px; background: ${ACCENT_COLOR}; border-radius: 50%; box-shadow: 0 0 10px ${ACCENT_COLOR}; }
    #_img_fab .badge { background: #ffffff18; border-radius: 20px; padding: 3px 10px; font-size: 11px; }

    #_img_overlay {
      position: fixed; inset: 0; z-index: 2147483646;
      background: #000000d9; backdrop-filter: blur(12px);
      display: none; align-items: center; justify-content: center;
    }
    #_img_overlay.open { display: flex; }

    #_img_modal {
      background: #0d0f16; border: 1px solid #ffffff0f;
      width: min(96vw, 1100px); height: min(92vh, 800px);
      border-radius: 24px; display: flex; flex-direction: column;
      overflow: hidden; box-shadow: 0 30px 60px #00000080;
      animation: imgFade 0.25s ease;
      font-family: 'Inter', sans-serif;
    }
    @keyframes imgFade { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

    #_img_top {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid #ffffff0a;
    }
    #_img_top .title { font-size: 18px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
    #_img_top .live { font-size: 10px; background: ${ACCENT_COLOR}20; border: 1px solid ${ACCENT_COLOR}40; color: ${ACCENT_COLOR}; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
    #_img_close { width: 32px; height: 32px; border-radius: 40px; background: #fff0; border: 1px solid #ffffff1a; color: #ffffff99; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.15s; }
    #_img_close:hover { background: #ffffff14; color: #fff; border-color: #ffffff33; }

    #_img_toolbar {
      display: flex; gap: 12px; padding: 14px 24px; border-bottom: 1px solid #ffffff08;
    }
    #_img_search {
      flex: 1; background: #ffffff08; border: 1px solid #ffffff14;
      border-radius: 12px; padding: 10px 16px; color: #fff;
      font-size: 13px; outline: none;
    }
    #_img_search::placeholder { color: #ffffff40; }
    #_img_search:focus { border-color: ${ACCENT_COLOR}80; }

    .btn { padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: opacity 0.15s; }
    .btn-primary { background: ${ACCENT_COLOR}20; border: 1px solid ${ACCENT_COLOR}40; color: ${ACCENT_COLOR}; }
    .btn-secondary { background: #ffffff08; border: 1px solid #ffffff14; color: #ffffffcc; }
    .btn-danger { background: #ef444420; border: 1px solid #ef444440; color: #f87171; }
    .btn-warning { background: #f59e0b20; border: 1px solid #f59e0b40; color: #f59e0b; }
    .btn:hover { opacity: 0.8; }

    #_img_tabs {
      display: flex; gap: 4px; padding: 0 24px; border-bottom: 1px solid #ffffff0a;
    }
    .tab {
      padding: 10px 18px; font-size: 13px; font-weight: 600; cursor: pointer;
      color: #ffffff60; border-bottom: 2px solid transparent; margin-bottom: -1px;
      display: flex; align-items: center; gap: 6px;
    }
    .tab.active { color: #fff; border-bottom-color: ${ACCENT_COLOR}; }
    .tab .count { background: #ffffff0d; border-radius: 30px; padding: 2px 8px; font-size: 11px; }

    #_img_grid {
      flex: 1; overflow-y: auto; padding: 20px 24px;
      display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px; align-content: start;
    }
    #_img_grid::-webkit-scrollbar { width: 4px; }
    #_img_grid::-webkit-scrollbar-thumb { background: #ffffff1a; border-radius: 4px; }

    .empty-state {
      grid-column: 1/-1; text-align: center; padding: 60px 20px;
      color: #ffffff40; font-size: 14px;
    }

    .card {
      background: #131720; border-radius: 16px; border: 1px solid #ffffff0a;
      overflow: hidden; cursor: pointer; transition: all 0.15s;
      position: relative;
    }
    .card.selected { border-color: ${ACCENT_COLOR}; box-shadow: 0 0 0 1px ${ACCENT_COLOR}80; }
    .card:hover { background: #191f2b; border-color: #ffffff1a; }

    .card .thumbnail {
      aspect-ratio: 1/1; background: #0b0e14;
      display: flex; align-items: center; justify-content: center;
      border-bottom: 1px solid #ffffff0a;
    }
    .card .thumbnail img {
      width: 100%; height: 100%; object-fit: cover;
      display: block; background: #0b0e14;
    }

    .card .info {
      padding: 12px;
    }
    .card .filename {
      font-size: 12px; font-weight: 600; color: #fff;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-bottom: 4px;
    }
    .card .meta {
      display: flex; justify-content: space-between; align-items: center;
    }
    .card .ext {
      font-size: 10px; text-transform: uppercase; background: #ffffff0d;
      padding: 2px 8px; border-radius: 6px; color: #ffffff80;
    }
    .card .storage-badge {
      background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b40;
      font-size: 9px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;
    }
    .card .session-badge {
      background: ${ACCENT_COLOR}20; color: ${ACCENT_COLOR}; border: 1px solid ${ACCENT_COLOR}40;
      font-size: 9px; padding: 2px 6px; border-radius: 4px; margin-left: 6px;
    }
    .card .delete-btn {
      background: none; border: 1px solid #ffffff20; color: #ffffff80;
      border-radius: 6px; padding: 4px 8px; font-size: 10px; cursor: pointer;
      margin-left: 6px;
    }
    .card .delete-btn:hover { background: #ef444420; border-color: #ef4444; color: #ef4444; }
    .card .download-btn {
      background: ${ACCENT_COLOR}; color: #000; border: none;
      border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 600;
      cursor: pointer; transition: opacity 0.15s;
    }
    .card .download-btn:hover { opacity: 0.85; }

    .check-indicator {
      position: absolute; top: 8px; left: 8px; width: 22px; height: 22px;
      border-radius: 8px; background: #00000080; backdrop-filter: blur(4px);
      border: 1.5px solid #ffffff30; display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 12px;
    }
    .card.selected .check-indicator { background: ${ACCENT_COLOR}; border-color: ${ACCENT_COLOR}; color: #000; }

    #_img_footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 24px; border-top: 1px solid #ffffff0a;
    }
    #_img_status { font-size: 12px; color: #ffffff60; }
    .action-group { display: flex; gap: 8px; }
  `;
  document.head.appendChild(style);

  // --- Build UI -------------------------------------------------------------
  const fab = document.createElement('div');
  fab.id = '_img_fab';
  fab.innerHTML = `<span class="dot"></span> Image Saver <span class="badge" id="_img_count">0</span>`;
  document.body.appendChild(fab);

  const overlay = document.createElement('div');
  overlay.id = '_img_overlay';
  overlay.innerHTML = `
    <div id="_img_modal">
      <div id="_img_top">
        <div class="title">💾 Image Storage <span class="live">PERSISTENT</span></div>
        <div id="_img_close">✕</div>
      </div>
      <div id="_img_toolbar">
        <input id="_img_search" type="text" placeholder="🔍 Search by name…">
        <button class="btn btn-primary" id="_img_rescan">🔄 Scan Page</button>
        <button class="btn btn-warning" id="_img_clear_storage">🗑️ Clear Storage</button>
      </div>
      <div id="_img_tabs"></div>
      <div id="_img_grid"></div>
      <div id="_img_footer">
        <div id="_img_status">—</div>
        <div class="action-group">
          <button class="btn btn-secondary" id="_img_select_all">☑ All</button>
          <button class="btn btn-danger" id="_img_clear_selection">✕ Clear</button>
          <button class="btn btn-secondary" id="_img_copy">📋 Copy URLs</button>
          <button class="btn btn-primary" id="_img_download">⬇ Download</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // --- Rendering (same logic, but using scheduleRefresh) --------------------
  function filteredImages() {
    let list = currentTab === 'session' 
      ? allImages.filter(item => item.sessionCapture === true)
      : allImages;
    const q = document.getElementById('_img_search')?.value.trim().toLowerCase() || '';
    if (q) {
      list = list.filter(item => 
        (item.url || '').toLowerCase().includes(q) || 
        (item.id || '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  function softRefresh() {
    if (!overlay.classList.contains('open')) return;
    renderTabs();
    renderGrid();
  }

  function renderTabs() {
    const bar = document.getElementById('_img_tabs');
    bar.innerHTML = '';
    const sessionCount = allImages.filter(i => i.sessionCapture).length;
    const totalCount = allImages.length;
    const tabs = [
      { id: 'all', label: '📁 All Stored', count: totalCount },
      { id: 'session', label: '✨ This Session', count: sessionCount }
    ];
    tabs.forEach(t => {
      const tab = document.createElement('div');
      tab.className = 'tab' + (currentTab === t.id ? ' active' : '');
      tab.innerHTML = `${t.label} <span class="count">${t.count}</span>`;
      tab.onclick = () => { currentTab = t.id; renderTabs(); renderGrid(); };
      bar.appendChild(tab);
    });
  }

  function renderGrid() {
    const grid = document.getElementById('_img_grid');
    const files = filteredImages();
    grid.innerHTML = '';
    document.getElementById('_img_status').textContent = selected.size 
      ? `${selected.size} selected` 
      : `${files.length} image${files.length !== 1 ? 's' : ''} stored`;

    if (!files.length) {
      grid.innerHTML = `<div class="empty-state">📭 No images in storage</div>`;
      return;
    }

    files.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card' + (selected.has(item.id) ? ' selected' : '');
      card.onclick = (e) => {
        if (e.target.closest('button')) return;
        selected.has(item.id) ? selected.delete(item.id) : selected.add(item.id);
        card.classList.toggle('selected', selected.has(item.id));
        document.getElementById('_img_status').textContent = selected.size 
          ? `${selected.size} selected` 
          : `${files.length} image${files.length !== 1 ? 's' : ''} stored`;
      };

      const check = document.createElement('div');
      check.className = 'check-indicator';
      check.textContent = selected.has(item.id) ? '✓' : '○';
      card.appendChild(check);

      const thumbDiv = document.createElement('div');
      thumbDiv.className = 'thumbnail';
      const img = document.createElement('img');
      if (item.blob) {
        img.src = URL.createObjectURL(item.blob);
        img.onload = () => URL.revokeObjectURL(img.src);
      } else {
        img.src = item.url || '';
      }
      img.onerror = () => img.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 24 24\' fill=\'%23333\'%3E%3Cpath d=\'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\'/%3E%3C/svg%3E';
      thumbDiv.appendChild(img);
      card.appendChild(thumbDiv);

      const info = document.createElement('div');
      info.className = 'info';
      const fname = fileName(item.url || 'image');
      const extDisplay = item.ext || 'img';
      const sessionBadge = item.sessionCapture ? '<span class="session-badge">NEW</span>' : '';
      const storageBadge = '<span class="storage-badge">💾</span>';
      
      info.innerHTML = `
        <div class="filename" title="${fname}">${fname}${sessionBadge}${storageBadge}</div>
        <div class="meta">
          <span class="ext">${extDisplay}</span>
          <div style="display:flex; gap:4px;">
            <button class="delete-btn" data-id="${item.id}">🗑️</button>
            <button class="download-btn" data-id="${item.id}">⬇ Save</button>
          </div>
        </div>
      `;
      card.appendChild(info);

      card.querySelector('.download-btn').onclick = (e) => {
        e.stopPropagation();
        const blob = item.blob;
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fname;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 100);
        }
      };

      card.querySelector('.delete-btn').onclick = async (e) => {
        e.stopPropagation();
        if (confirm('Delete this image from storage?')) {
          await deleteImageFromDB(item.id);
          allImages = allImages.filter(i => i.id !== item.id);
          selected.delete(item.id);
          scheduleRefresh();
          document.getElementById('_img_count').textContent = allImages.length;
          toast('🗑️ Image deleted', ACCENT_COLOR);
        }
      };

      grid.appendChild(card);
    });
  }

  // --- Panel Controls -------------------------------------------------------
  async function openPanel() {
    // Load fresh data from DB
    const stored = await loadAllImagesFromDB();
    allImages = stored;
    currentTab = 'session';
    document.getElementById('_img_search').value = '';
    renderTabs();
    renderGrid();
    overlay.classList.add('open');
    document.getElementById('_img_count').textContent = allImages.length;
  }

  function closePanel() {
    overlay.classList.remove('open');
  }

  async function rescan() {
    // Manual scan – optional
    toast('Scanning page...', ACCENT_COLOR);
    // You could implement a DOM scan here if desired.
  }

  async function downloadSelected() {
    const selectedIds = selected.size ? [...selected] : filteredImages().map(i => i.id);
    const selectedImages = allImages.filter(i => selectedIds.includes(i.id));
    if (!selectedImages.length) return toast('No images to download', '#ef4444');
    for (const img of selectedImages) {
      if (img.blob) {
        const url = URL.createObjectURL(img.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName(img.url || 'image');
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
        await new Promise(r => setTimeout(r, 200));
      }
    }
    toast(`⬇ Downloaded ${selectedImages.length} image(s)`, ACCENT_COLOR);
  }

  async function copyURLs() {
    const selectedIds = selected.size ? [...selected] : filteredImages().map(i => i.id);
    const selectedImages = allImages.filter(i => selectedIds.includes(i.id));
    const urls = selectedImages.map(i => i.url || '[blob]');
    navigator.clipboard.writeText(urls.join('\n'))
      .then(() => toast(`✓ Copied ${urls.length} URL(s)`, '#22c55e'))
      .catch(() => toast('Copy failed', '#ef4444'));
  }

  async function clearAllStorage() {
    if (confirm('Permanently delete ALL images from browser storage?')) {
      await clearAllImagesFromDB();
      allImages = [];
      selected.clear();
      scheduleRefresh();
      document.getElementById('_img_count').textContent = 0;
      toast('🗑️ All storage cleared', ACCENT_COLOR);
    }
  }

  // --- Event Wiring ---------------------------------------------------------
  fab.onclick = openPanel;
  document.getElementById('_img_close').onclick = closePanel;
  overlay.onclick = e => { if (e.target === overlay) closePanel(); };
  document.getElementById('_img_rescan').onclick = rescan;
  document.getElementById('_img_clear_storage').onclick = clearAllStorage;
  document.getElementById('_img_search').oninput = () => renderGrid();
  document.getElementById('_img_download').onclick = downloadSelected;
  document.getElementById('_img_copy').onclick = copyURLs;
  document.getElementById('_img_select_all').onclick = () => {
    const f = filteredImages().map(i => i.id);
    const allSelected = f.every(id => selected.has(id));
    f.forEach(id => allSelected ? selected.delete(id) : selected.add(id));
    renderGrid();
  };
  document.getElementById('_img_clear_selection').onclick = () => { selected.clear(); renderGrid(); };

  // --- Start Everything -----------------------------------------------------
  window.__IMG_SAVER_INSTALLED__ = true;

  // Initialize DB and load existing images silently
  openDB().then(() => loadAllImagesFromDB()).then(stored => {
    allImages = stored;
    document.getElementById('_img_count').textContent = allImages.length;
    console.log(`[Image Saver] Ready – ${allImages.length} images in storage`);
  }).catch(e => console.warn('Storage init failed:', e));

  // Auto-open panel on first run (optional)
  setTimeout(openPanel, 500);
  toast('💾 Image Saver – Loop‑safe, persistent storage', ACCENT_COLOR);

})();
