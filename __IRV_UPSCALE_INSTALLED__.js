(function(){
  "use strict";

  // ─── Remove old instance ─────────────────────────────────────────────
  ['_fd_fab','_fd_overlay','_fd_toast_wrap'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.remove();
  });
  delete window.__IRV_UPSCALE_INSTALLED__;

  // ─── Configuration ───────────────────────────────────────────────────
  const IMAGE_EXTS = new Set(['jpg','jpeg','png','gif','webp','bmp','ico','svg','avif']);
  const TYPE_ICON  = '🖼️';
  const TYPE_COLOR = '#06b6d4';

  // ─── State ───────────────────────────────────────────────────────────
  let allImages    = [];          // all detected images (including upscaled)
  let upscaledOnly = new Set();   // URLs of images detected after panel open
  let currentTab   = 'upscaled';  // 'upscaled' or 'all'
  const selected   = new Set();

  // ─── Utility functions ───────────────────────────────────────────────
  const resolveURL = u => { try{ return new URL(u, location.href).href; }catch{ return u; } };
  const getExt     = u => u.split('?')[0].split('#')[0].split('.').pop().toLowerCase();
  const isImage    = u => u && IMAGE_EXTS.has(getExt(u));
  const fileName   = u => { try{ return decodeURIComponent(u.split('?')[0].split('/').pop()) || u; }catch{ return u; } };

  // ─── Toast (reused) ──────────────────────────────────────────────────
  let toastWrap;
  function toast(msg, color = TYPE_COLOR){
    if(!toastWrap){
      toastWrap = document.createElement('div');
      toastWrap.id = '_fd_toast_wrap';
      toastWrap.style.cssText = 'position:fixed;bottom:82px;right:24px;z-index:2147483648;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none;';
      document.body.appendChild(toastWrap);
    }
    const t = document.createElement('div');
    t.style.cssText = `background:#111118;border:1px solid ${color}44;border-left:3px solid ${color};color:#fff;font:600 12px/1.4 'Syne',sans-serif;padding:8px 14px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.6);max-width:260px;opacity:0;transform:translateX(10px);transition:opacity .25s,transform .25s;`;
    t.textContent = msg;
    toastWrap.appendChild(t);
    requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateX(0)'; });
    setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(10px)'; setTimeout(()=>t.remove(),300); },2800);
  }

  // ─── 🔴 Block auto‑download & capture upscaled images ─────────────────
  function interceptAutoDownload(){
    // 1. Prevent <a download> clicks that would trigger an auto‑download
    document.addEventListener('click', e => {
      const a = e.target.closest('a[download]');
      if(!a) return;
      const href = a.href;
      if(!href || !isImage(href)) return;
      e.preventDefault();
      e.stopPropagation();
      captureImageURL(href, true); // true = from upscale
    }, true);

    // 2. Intercept fetch / XHR responses that are images and force download
    const origFetch = window.fetch;
    window.fetch = function(...args){
      return origFetch.apply(this, args).then(async resp => {
        const cloned = resp.clone();
        const disp = cloned.headers.get('Content-Disposition') || '';
        const isAttachment = disp.includes('attachment');
        const contentType = cloned.headers.get('Content-Type') || '';
        if(isAttachment && contentType.startsWith('image/')){
          const blob = await cloned.blob();
          const url = URL.createObjectURL(blob);
          captureImageURL(url, true);
          // Block the actual download by returning a dummy response
          return new Response(null, { status: 204 });
        }
        return resp;
      });
    };

    const XHR = XMLHttpRequest.prototype;
    const origOpen = XHR.open;
    const origSend = XHR.send;
    XHR.open = function(method, url){
      this._fd_url = resolveURL(url);
      return origOpen.apply(this, arguments);
    };
    XHR.send = function(){
      this.addEventListener('load', function(){
        const disp = this.getResponseHeader('Content-Disposition') || '';
        const ctype = this.getResponseHeader('Content-Type') || '';
        if(disp.includes('attachment') && ctype.startsWith('image/')){
          const blob = new Blob([this.response], { type: ctype });
          const url = URL.createObjectURL(blob);
          captureImageURL(url, true);
          // Prevent further processing by clearing response
          Object.defineProperty(this, 'response', { value: null });
          Object.defineProperty(this, 'responseText', { value: '' });
        }
      });
      return origSend.apply(this, arguments);
    };
  }

  // Add an image URL to the list (and mark as upscaled if applicable)
  function captureImageURL(url, fromUpscale = false){
    url = resolveURL(url);
    if(!isImage(url)) return;
    if(!allImages.includes(url)){
      allImages.push(url);
      if(fromUpscale){
        upscaledOnly.add(url);
        toast(`✨ Upscaled: ${fileName(url)}`, TYPE_COLOR);
      }
      softRefresh();
    } else if(fromUpscale && !upscaledOnly.has(url)){
      upscaledOnly.add(url);
      softRefresh();
    }
  }

  // ─── Scan page for existing images ───────────────────────────────────
  function scanPageImages(){
    const seen = new Set(allImages);
    document.querySelectorAll('img').forEach(img => {
      const src = img.currentSrc || img.src;
      if(src && src !== location.href) seen.add(resolveURL(src));
    });
    // Also check background images? (optional)
    allImages = [...seen];
  }

  // ─── MutationObserver – catch dynamically added images ───────────────
  const observer = new MutationObserver(mutations => {
    let added = 0;
    mutations.forEach(m => m.addedNodes.forEach(node => {
      if(node.nodeType !== 1) return;
      if(node.tagName === 'IMG'){
        const src = node.currentSrc || node.src;
        if(src && isImage(src) && !allImages.includes(resolveURL(src))){
          captureImageURL(src, true);
          added++;
        }
      }
      node.querySelectorAll?.('img').forEach(img => {
        const src = img.currentSrc || img.src;
        if(src && isImage(src) && !allImages.includes(resolveURL(src))){
          captureImageURL(src, true);
          added++;
        }
      });
    }));
    if(added) softRefresh();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // ─── UI Elements & Rendering ─────────────────────────────────────────
  // (CSS is identical to original, only added thumbnail styles)

  const fab = document.createElement('div');
  fab.id = '_fd_fab';
  fab.innerHTML = `<span class="fdot"></span> Upscale Saver <span class="fbadge" id="_fd_cnt">0</span>`;
  document.body.appendChild(fab);

  const overlay = document.createElement('div');
  overlay.id = '_fd_overlay';
  overlay.innerHTML = `
    <div id="_fd_modal">
      <div id="_fd_top">
        <div>
          <div class="ttl">🖼️ Upscale Image Saver <span class="livebadge">LIVE</span></div>
          <div class="sub" id="_fd_host"></div>
        </div>
        <div id="_fd_x">✕</div>
      </div>
      <div id="_fd_tb">
        <input id="_fd_q" type="text" placeholder="🔍 Search…">
        <button class="tbbtn green" id="_fd_rescan">🔄 Rescan</button>
      </div>
      <div id="_fd_tabs"></div>
      <div id="_fd_grid"></div>
      <div id="_fd_foot">
        <div class="fdsi" id="_fd_si">—</div>
        <div class="fdacts">
          <button class="fdbtn g" id="_fd_sall">☑ All</button>
          <button class="fdbtn r" id="_fd_clr">✕ Clear</button>
          <button class="fdbtn g" id="_fd_cp">📋 Copy URLs</button>
          <button class="fdbtn p" id="_fd_dl">⬇ Download</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Add thumbnail‑specific CSS
  const style = document.createElement('style');
  style.textContent = `
    .fdthumb{ width: 48px; height: 48px; border-radius: 6px; object-fit: cover; background: #1a1a24; flex-shrink: 0; }
    .fdrow{ gap: 12px; }
  `;
  document.head.appendChild(style);

  // ─── Render functions ─────────────────────────────────────────────────
  function filteredImages(){
    let list = currentTab === 'upscaled' ? [...upscaledOnly] : allImages;
    const q = document.getElementById('_fd_q')?.value.trim().toLowerCase() || '';
    if(q) list = list.filter(u => u.toLowerCase().includes(q) || fileName(u).toLowerCase().includes(q));
    return list;
  }

  function softRefresh(){
    if(!overlay.classList.contains('open')) return;
    renderTabs();
    renderGrid();
    document.getElementById('_fd_cnt').textContent = allImages.length;
  }

  function renderTabs(){
    const bar = document.getElementById('_fd_tabs');
    bar.innerHTML = '';
    const tabs = [
      { id: 'upscaled', label: '✨ Upscaled', count: upscaledOnly.size, icon: '🆕' },
      { id: 'all', label: 'All Images', count: allImages.length, icon: '🖼️' }
    ];
    tabs.forEach(t => {
      const tab = document.createElement('div');
      tab.className = 'fdtab' + (currentTab === t.id ? ' on' : '');
      tab.style.setProperty('--tc', TYPE_COLOR);
      tab.innerHTML = `${t.icon} ${t.label} <span class="cnt">${t.count}</span>`;
      tab.onclick = () => { currentTab = t.id; renderTabs(); renderGrid(); };
      bar.appendChild(tab);
    });
  }

  function renderGrid(){
    const grid = document.getElementById('_fd_grid');
    const files = filteredImages();
    grid.innerHTML = '';
    document.getElementById('_fd_si').textContent = selected.size ? `${selected.size} selected` : `${files.length} image${files.length!==1?'s':''}`;

    if(!files.length){
      grid.innerHTML = `<div class="fdempty"><span>🔍</span>No images ${currentTab==='upscaled'?'upscaled yet':''}</div>`;
      return;
    }

    files.forEach(url => {
      const row = document.createElement('div');
      row.className = 'fdrow' + (selected.has(url) ? ' on' : '');
      row.style.setProperty('--ac', TYPE_COLOR);

      // Thumbnail
      const thumb = document.createElement('img');
      thumb.className = 'fdthumb';
      thumb.src = url;
      thumb.onerror = () => thumb.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' viewBox=\'0 0 24 24\' fill=\'%23333\'%3E%3Cpath d=\'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\'/%3E%3C/svg%3E';

      // Info
      const info = document.createElement('div');
      info.className = 'fdinfo';
      info.innerHTML = `<div class="fdname" title="${fileName(url)}">${fileName(url)}</div>
                        <div class="fdurl" title="${url}">${url}</div>`;

      // Download button
      const dl = document.createElement('a');
      dl.className = 'fddl';
      dl.href = url;
      dl.download = fileName(url);
      dl.target = '_blank';
      dl.style.background = TYPE_COLOR;
      dl.innerHTML = '⬇ Save';
      dl.onclick = e => e.stopPropagation();

      // Select checkbox
      const ck = document.createElement('div');
      ck.className = 'fdck';
      ck.textContent = selected.has(url) ? '✓' : '';

      row.appendChild(ck);
      row.appendChild(thumb);
      row.appendChild(info);
      row.appendChild(dl);

      row.onclick = e => {
        if(e.target.closest('a')) return;
        selected.has(url) ? selected.delete(url) : selected.add(url);
        row.classList.toggle('on', selected.has(url));
        ck.textContent = selected.has(url) ? '✓' : '';
        document.getElementById('_fd_si').textContent = selected.size ? `${selected.size} selected` : `${files.length} image${files.length!==1?'s':''}`;
      };

      grid.appendChild(row);
    });
  }

  // ─── Open / Close / Actions ──────────────────────────────────────────
  function openPanel(){
    scanPageImages();
    selected.clear();
    currentTab = 'upscaled';
    document.getElementById('_fd_q').value = '';
    document.getElementById('_fd_host').textContent = location.hostname;
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
    if(!targets.length) return toast('No images!', '#ef4444');
    targets.forEach((url, i) => setTimeout(() => {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName(url);
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, i * 300));
    toast(`⬇ Downloading ${targets.length} image${targets.length>1?'s':''}…`, TYPE_COLOR);
  }

  function copyURLs(){
    const targets = selected.size ? [...selected] : filteredImages();
    if(!targets.length) return toast('No images!', '#ef4444');
    navigator.clipboard.writeText(JSON.stringify(targets, null, 2))
      .then(() => toast(`✓ Copied ${targets.length} URL${targets.length>1?'s':''}`, '#22c55e'))
      .catch(() => toast('Copy failed', '#ef4444'));
  }

  // ─── Wire events ─────────────────────────────────────────────────────
  fab.onclick = openPanel;
  document.getElementById('_fd_x').onclick = closePanel;
  overlay.onclick = e => { if(e.target === overlay) closePanel(); };
  document.getElementById('_fd_rescan').onclick = rescan;
  document.getElementById('_fd_q').oninput = () => renderGrid();
  document.getElementById('_fd_cp').onclick = copyURLs;
  document.getElementById('_fd_dl').onclick = downloadSelected;
  document.getElementById('_fd_sall').onclick = () => {
    const f = filteredImages();
    f.every(u => selected.has(u)) ? f.forEach(u => selected.delete(u)) : f.forEach(u => selected.add(u));
    renderGrid();
  };
  document.getElementById('_fd_clr').onclick = () => { selected.clear(); renderGrid(); };

  // ─── Start interception and auto‑open ────────────────────────────────
  interceptAutoDownload();
  window.__IRV_UPSCALE_INSTALLED__ = true;

  // Initial scan
  scanPageImages();
  // Auto‑open on first run (optional)
  openPanel();

})();
