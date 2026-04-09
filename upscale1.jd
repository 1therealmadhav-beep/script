(function(){
  "use strict";

  // --- Remove old instances -------------------------------------------------
  ['_img_fab','_img_overlay','_img_toast'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.remove();
  });
  delete window.__IMG_SAVER_INSTALLED__;

  console.log('%c[Image Saver] Active – intercepting downloads', 'color: #06b6d4; font-weight: bold');

  // --- Config --------------------------------------------------------------
  const IMAGE_EXTS = new Set(['jpg','jpeg','png','gif','webp','bmp','ico','svg','avif','tiff','tif']);
  const ACCENT_COLOR = '#06b6d4';

  // --- State ---------------------------------------------------------------
  let allImages = [];
  let upscaledSet = new Set();
  let currentTab = 'upscaled';
  const selected = new Set();

  // --- Utilities -----------------------------------------------------------
  const resolveURL = u => { try{ return new URL(u, location.href).href; }catch{ return u; } };
  const getExt = u => u.split('?')[0].split('#')[0].split('.').pop().toLowerCase();
  const isImage = u => u && IMAGE_EXTS.has(getExt(u));
  const fileName = u => { try{ return decodeURIComponent(u.split('?')[0].split('/').pop()) || 'image'; }catch{ return 'image'; } };

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

  // --- Add image to collection ----------------------------------------------
  function captureImageURL(url, fromUpscale = false){
    url = resolveURL(url);
    if(!isImage(url)) return;
    if(!allImages.includes(url)){
      allImages.push(url);
      if(fromUpscale) upscaledSet.add(url);
      softRefresh();
    } else if(fromUpscale && !upscaledSet.has(url)){
      upscaledSet.add(url);
      softRefresh();
    }
  }

  // --- Scan page for existing images ---------------------------------------
  function scanPageImages(){
    const seen = new Set(allImages);
    document.querySelectorAll('img').forEach(img => {
      const src = img.currentSrc || img.src;
      if(src && src !== location.href) seen.add(resolveURL(src));
    });
    document.querySelectorAll('source[srcset]').forEach(s => {
      (s.srcset || '').split(',').forEach(v => {
        const url = v.trim().split(' ')[0];
        if(url && isImage(url)) seen.add(resolveURL(url));
      });
    });
    allImages = [...seen];
  }

  // --- MutationObserver for new images -------------------------------------
  const observer = new MutationObserver(muts => {
    let added = 0;
    muts.forEach(m => m.addedNodes.forEach(node => {
      if(node.nodeType !== 1) return;
      if(node.tagName === 'IMG'){
        const src = node.currentSrc || node.src;
        if(src && isImage(src) && !allImages.includes(resolveURL(src))){
          captureImageURL(src, true);
          added++;
        }
      }
      if(node.querySelectorAll){
        node.querySelectorAll('img').forEach(img => {
          const src = img.currentSrc || img.src;
          if(src && isImage(src) && !allImages.includes(resolveURL(src))){
            captureImageURL(src, true);
            added++;
          }
        });
      }
    }));
    if(added) toast(`✨ ${added} new image${added>1?'s':''} detected`, ACCENT_COLOR);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // --- 🔴 ENHANCED DOWNLOAD BLOCKING ---------------------------------------
  function blockDownload(url, method = 'unknown'){
    if(!isImage(url)) return false;
    captureImageURL(url, true);
    toast(`🚫 Auto‑download blocked (${method}) – image saved`, ACCENT_COLOR);
    return true;
  }

  // 1. Click on <a download>
  document.addEventListener('click', e => {
    const a = e.target.closest('a[download]');
    if(!a || !a.href) return;
    if(blockDownload(a.href, 'download link')){
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // 2. Intercept fetch with Content-Disposition: attachment
  const origFetch = window.fetch;
  window.fetch = function(...args){
    return origFetch.apply(this, args).then(async resp => {
      const cloned = resp.clone();
      const disp = cloned.headers.get('Content-Disposition') || '';
      const isAttachment = disp.includes('attachment');
      const ctype = cloned.headers.get('Content-Type') || '';
      if(isAttachment && ctype.startsWith('image/')){
        const blob = await cloned.blob();
        const url = URL.createObjectURL(blob);
        blockDownload(url, 'fetch attachment');
        return new Response(null, { status: 204 });
      }
      return resp;
    });
  };

  // 3. Intercept XHR
  const XHR = XMLHttpRequest.prototype;
  const origOpen = XHR.open;
  const origSend = XHR.send;
  XHR.open = function(method, url){
    this._img_url = resolveURL(url);
    return origOpen.apply(this, arguments);
  };
  XHR.send = function(){
    this.addEventListener('load', function(){
      const disp = this.getResponseHeader('Content-Disposition') || '';
      const ctype = this.getResponseHeader('Content-Type') || '';
      if(disp.includes('attachment') && ctype.startsWith('image/')){
        const blob = new Blob([this.response], { type: ctype });
        const url = URL.createObjectURL(blob);
        blockDownload(url, 'XHR attachment');
        Object.defineProperty(this, 'response', { value: null });
        Object.defineProperty(this, 'responseText', { value: '' });
      }
    });
    return origSend.apply(this, arguments);
  };

  // 4. Override HTMLAnchorElement.prototype.click (programmatic clicks)
  const originalClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function(){
    if(this.href && isImage(this.href)){
      if(blockDownload(this.href, 'programmatic link click')){
        return; // do not proceed with original click
      }
    }
    return originalClick.call(this);
  };

  // 5. Override window.open
  const originalOpen = window.open;
  window.open = function(url, ...args){
    if(url && isImage(url)){
      blockDownload(url, 'window.open');
      return null;
    }
    return originalOpen.call(this, url, ...args);
  };

  // 6. Monitor location.href assignments (blob/data URLs)
  const originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
  if(originalLocationDescriptor?.configurable){
    Object.defineProperty(window, 'location', {
      get: () => originalLocationDescriptor.get ? originalLocationDescriptor.get.call(window) : location,
      set: function(val){
        if(typeof val === 'string' && isImage(val)){
          blockDownload(val, 'location.href');
          return;
        }
        if(originalLocationDescriptor.set){
          originalLocationDescriptor.set.call(this, val);
        } else {
          location.href = val;
        }
      },
      configurable: true
    });
  }

  // 7. Prevent <a> creation with blob/download intent (extra safety)
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName, options){
    const el = originalCreateElement(tagName, options);
    if(tagName.toLowerCase() === 'a'){
      const originalSetAttribute = el.setAttribute;
      el.setAttribute = function(name, value){
        if(name === 'href' && isImage(value)){
          blockDownload(value, 'dynamic anchor href set');
        }
        return originalSetAttribute.call(this, name, value);
      };
      // Also watch direct property assignment
      let hrefValue = el.href;
      Object.defineProperty(el, 'href', {
        get: () => hrefValue,
        set: function(v){
          if(isImage(v)){
            blockDownload(v, 'anchor.href = ...');
          }
          hrefValue = v;
        },
        configurable: true
      });
    }
    return el;
  };

  // --- UI Injection (same as before) ---------------------------------------
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

  // Build UI (same as before) ------------------------------------------------
  const fab = document.createElement('div');
  fab.id = '_img_fab';
  fab.innerHTML = `<span class="dot"></span> Image Saver <span class="badge" id="_img_count">0</span>`;
  document.body.appendChild(fab);

  const overlay = document.createElement('div');
  overlay.id = '_img_overlay';
  overlay.innerHTML = `
    <div id="_img_modal">
      <div id="_img_top">
        <div class="title">🖼️ Image Saver <span class="live">LIVE</span></div>
        <div id="_img_close">✕</div>
      </div>
      <div id="_img_toolbar">
        <input id="_img_search" type="text" placeholder="🔍 Search by name or URL…">
        <button class="btn btn-primary" id="_img_rescan">🔄 Rescan</button>
      </div>
      <div id="_img_tabs"></div>
      <div id="_img_grid"></div>
      <div id="_img_footer">
        <div id="_img_status">—</div>
        <div class="action-group">
          <button class="btn btn-secondary" id="_img_select_all">☑ All</button>
          <button class="btn btn-danger" id="_img_clear">✕ Clear</button>
          <button class="btn btn-secondary" id="_img_copy">📋 Copy URLs</button>
          <button class="btn btn-primary" id="_img_download">⬇ Download</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // --- Rendering ------------------------------------------------------------
  function filteredImages(){
    let list = currentTab === 'upscaled' ? [...upscaledSet] : allImages;
    const q = document.getElementById('_img_search')?.value.trim().toLowerCase() || '';
    if(q) list = list.filter(u => u.toLowerCase().includes(q) || fileName(u).toLowerCase().includes(q));
    return list;
  }

  function softRefresh(){
    if(!overlay.classList.contains('open')) return;
    renderTabs();
    renderGrid();
    document.getElementById('_img_count').textContent = allImages.length;
  }

  function renderTabs(){
    const bar = document.getElementById('_img_tabs');
    bar.innerHTML = '';
    const tabs = [
      { id: 'upscaled', label: '✨ Upscaled', count: upscaledSet.size },
      { id: 'all', label: 'All Images', count: allImages.length }
    ];
    tabs.forEach(t => {
      const tab = document.createElement('div');
      tab.className = 'tab' + (currentTab === t.id ? ' active' : '');
      tab.innerHTML = `${t.label} <span class="count">${t.count}</span>`;
      tab.onclick = () => { currentTab = t.id; renderTabs(); renderGrid(); };
      bar.appendChild(tab);
    });
  }

  function renderGrid(){
    const grid = document.getElementById('_img_grid');
    const files = filteredImages();
    grid.innerHTML = '';
    document.getElementById('_img_status').textContent = selected.size ? `${selected.size} selected` : `${files.length} image${files.length!==1?'s':''}`;

    if(!files.length){
      grid.innerHTML = `<div class="empty-state">📭 No images ${currentTab==='upscaled'?'upscaled yet':''}</div>`;
      return;
    }

    files.forEach(url => {
      const card = document.createElement('div');
      card.className = 'card' + (selected.has(url) ? ' selected' : '');
      card.onclick = (e) => {
        if(e.target.closest('.download-btn')) return;
        selected.has(url) ? selected.delete(url) : selected.add(url);
        card.classList.toggle('selected', selected.has(url));
        document.getElementById('_img_status').textContent = selected.size ? `${selected.size} selected` : `${files.length} image${files.length!==1?'s':''}`;
      };

      const check = document.createElement('div');
      check.className = 'check-indicator';
      check.textContent = selected.has(url) ? '✓' : '○';
      card.appendChild(check);

      const thumbDiv = document.createElement('div');
      thumbDiv.className = 'thumbnail';
      const img = document.createElement('img');
      img.src = url;
      img.loading = 'lazy';
      img.onerror = () => img.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 24 24\' fill=\'%23333\'%3E%3Cpath d=\'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\'/%3E%3C/svg%3E';
      thumbDiv.appendChild(img);
      card.appendChild(thumbDiv);

      const info = document.createElement('div');
      info.className = 'info';
      info.innerHTML = `
        <div class="filename" title="${fileName(url)}">${fileName(url)}</div>
        <div class="meta">
          <span class="ext">${getExt(url) || 'img'}</span>
          <button class="download-btn" data-url="${url}">⬇ Save</button>
        </div>
      `;
      card.appendChild(info);

      card.querySelector('.download-btn').onclick = (e) => {
        e.stopPropagation();
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName(url);
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      grid.appendChild(card);
    });
  }

  // --- Panel Controls -------------------------------------------------------
  function openPanel(){
    scanPageImages();
    selected.clear();
    currentTab = 'upscaled';
    document.getElementById('_img_search').value = '';
    renderTabs();
    renderGrid();
    overlay.classList.add('open');
  }

  function closePanel(){ overlay.classList.remove('open'); }

  function rescan(){
    const before = allImages.length;
    scanPageImages();
    const added = allImages.length - before;
    toast(added ? `🔄 +${added} new image${added>1?'s':''}` : '🔄 No new images', added ? '#22c55e' : '#6b7280');
    softRefresh();
  }

  function downloadSelected(){
    const targets = selected.size ? [...selected] : filteredImages();
    if(!targets.length) return toast('No images to download', '#ef4444');
    targets.forEach((url, i) => setTimeout(() => {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName(url);
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, i * 250));
    toast(`⬇ Downloading ${targets.length} image${targets.length>1?'s':''}…`, ACCENT_COLOR);
  }

  function copyURLs(){
    const targets = selected.size ? [...selected] : filteredImages();
    if(!targets.length) return toast('No images to copy', '#ef4444');
    navigator.clipboard.writeText(targets.join('\n'))
      .then(() => toast(`✓ Copied ${targets.length} URL${targets.length>1?'s':''}`, '#22c55e'))
      .catch(() => toast('Copy failed', '#ef4444'));
  }

  // --- Event Wiring ---------------------------------------------------------
  fab.onclick = openPanel;
  document.getElementById('_img_close').onclick = closePanel;
  overlay.onclick = e => { if(e.target === overlay) closePanel(); };
  document.getElementById('_img_rescan').onclick = rescan;
  document.getElementById('_img_search').oninput = () => renderGrid();
  document.getElementById('_img_download').onclick = downloadSelected;
  document.getElementById('_img_copy').onclick = copyURLs;
  document.getElementById('_img_select_all').onclick = () => {
    const f = filteredImages();
    const allSelected = f.every(u => selected.has(u));
    f.forEach(u => allSelected ? selected.delete(u) : selected.add(u));
    renderGrid();
  };
  document.getElementById('_img_clear').onclick = () => { selected.clear(); renderGrid(); };

  // --- Start Everything -----------------------------------------------------
  window.__IMG_SAVER_INSTALLED__ = true;
  scanPageImages();
  openPanel();
  toast('🖼️ Image Saver ready – auto‑download blocked', ACCENT_COLOR);

})();
