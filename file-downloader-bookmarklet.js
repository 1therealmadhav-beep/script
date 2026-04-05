(function () {
  if (window.__IRV_FILE_ARRAY__) return;
  window.__IRV_FILE_ARRAY__ = true;

  // ---------- CONFIGURATION ----------
  const FILE_TYPES = {
    audio: ['mp3','wav','ogg','flac','aac','m4a','wma','opus','aiff'],
    video: ['mp4','webm','ogv','mov','avi','mkv','flv','wmv','3gp','m4v'],
    image: ['jpg','jpeg','png','gif','webp','svg','bmp','ico','tiff','avif'],
    doc:   ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','rtf','csv','json','xml'],
    archive: ['zip','rar','7z','tar','gz','bz2'],
    other: ['exe','msi','apk','dmg','iso']
  };

  const ALL_EXTENSIONS = new Set(Object.values(FILE_TYPES).flat());

  const TYPE_ICONS = {
    audio: '🎵',
    video: '🎬',
    image: '🖼️',
    doc:   '📄',
    archive: '📦',
    other: '⚙️'
  };

  const TYPE_COLORS = {
    audio:   '#f97316',
    video:   '#a855f7',
    image:   '#06b6d4',
    doc:     '#22c55e',
    archive: '#eab308',
    other:   '#6b7280'
  };

  // ---------- UTILITIES ----------
  function resolveUrl(url) {
    try { return new URL(url, window.location.href).href; } catch { return url; }
  }

  function getExt(url) {
    return url.split('?')[0].split('#')[0].split('.').pop().toLowerCase();
  }

  function getType(url) {
    const ext = getExt(url);
    for (const [type, exts] of Object.entries(FILE_TYPES)) {
      if (exts.includes(ext)) return type;
    }
    return 'other';
  }

  function isFileUrl(url) {
    if (!url) return false;
    return ALL_EXTENSIONS.has(getExt(url));
  }

  function getFileName(url) {
    try {
      return decodeURIComponent(url.split('?')[0].split('/').pop()) || url;
    } catch { return url; }
  }

  function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // ---------- COLLECT ----------
  function collectFileUrls() {
    const urls = new Set();

    document.querySelectorAll('img').forEach(img => {
      let src = img.currentSrc || img.src;
      if (src && src !== window.location.href) urls.add(resolveUrl(src));
    });

    document.querySelectorAll('video, audio').forEach(media => {
      if (media.src) urls.add(resolveUrl(media.src));
      media.querySelectorAll('source').forEach(s => { if (s.src) urls.add(resolveUrl(s.src)); });
    });

    document.querySelectorAll('a[href]').forEach(a => {
      if (a.href && isFileUrl(a.href)) urls.add(resolveUrl(a.href));
    });

    document.querySelectorAll('picture source[srcset]').forEach(source => {
      (source.srcset || '').split(',').map(s => s.trim().split(' ')[0]).forEach(url => {
        if (url) urls.add(resolveUrl(url));
      });
    });

    document.querySelectorAll('embed[src], object[data]').forEach(el => {
      let url = el.src || el.data;
      if (url && isFileUrl(url)) urls.add(resolveUrl(url));
    });

    // XHR/fetch intercepted sources in scripts
    document.querySelectorAll('source[src]').forEach(s => {
      if (s.src && isFileUrl(s.src)) urls.add(resolveUrl(s.src));
    });

    return [...urls];
  }

  // ---------- INJECT STYLES ----------
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

    #_fd_wrap * { box-sizing: border-box; margin: 0; padding: 0; }

    #_fd_fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      background: linear-gradient(135deg, #f97316, #a855f7);
      color: #fff;
      padding: 12px 20px;
      border-radius: 50px;
      cursor: pointer;
      font-family: 'Syne', sans-serif;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 4px 24px rgba(169,85,247,0.5);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
      user-select: none;
      letter-spacing: 0.3px;
    }
    #_fd_fab:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 8px 32px rgba(169,85,247,0.6);
    }
    #_fd_fab .badge {
      background: rgba(255,255,255,0.25);
      border-radius: 20px;
      padding: 2px 8px;
      font-size: 11px;
    }

    #_fd_overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      animation: _fd_fadein 0.2s ease;
    }
    #_fd_overlay.active { display: flex; }

    @keyframes _fd_fadein {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes _fd_slideup {
      from { transform: translateY(30px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    #_fd_modal {
      background: #0f0f13;
      border: 1px solid rgba(255,255,255,0.08);
      width: min(94vw, 960px);
      height: min(90vh, 720px);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(0,0,0,0.7);
      animation: _fd_slideup 0.25s cubic-bezier(0.16,1,0.3,1);
      font-family: 'Syne', sans-serif;
    }

    #_fd_topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    #_fd_topbar .title {
      font-size: 18px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.3px;
    }
    #_fd_topbar .subtitle {
      font-size: 12px;
      color: rgba(255,255,255,0.35);
      font-family: 'DM Mono', monospace;
      margin-top: 2px;
    }
    #_fd_close {
      width: 32px; height: 32px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50%;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px;
      transition: background 0.15s, color 0.15s;
    }
    #_fd_close:hover { background: rgba(255,255,255,0.12); color: #fff; }

    #_fd_tabs {
      display: flex;
      gap: 4px;
      padding: 10px 24px 0;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      overflow-x: auto;
    }
    ._fd_tab {
      padding: 7px 14px;
      border-radius: 8px 8px 0 0;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      color: rgba(255,255,255,0.4);
      transition: color 0.15s, background 0.15s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }
    ._fd_tab:hover { color: rgba(255,255,255,0.7); }
    ._fd_tab.active {
      color: #fff;
      border-bottom-color: currentColor;
    }
    ._fd_tab .count {
      background: rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 1px 6px;
      font-size: 10px;
      font-family: 'DM Mono', monospace;
    }

    #_fd_grid {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #_fd_grid::-webkit-scrollbar { width: 4px; }
    #_fd_grid::-webkit-scrollbar-track { background: transparent; }
    #_fd_grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    ._fd_empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.2);
      font-size: 14px;
      gap: 10px;
      padding: 40px;
    }
    ._fd_empty .icon { font-size: 40px; }

    ._fd_row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.05);
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      position: relative;
    }
    ._fd_row:hover {
      background: rgba(255,255,255,0.06);
      border-color: rgba(255,255,255,0.1);
    }
    ._fd_row.selected {
      background: rgba(255,255,255,0.07);
      border-color: var(--accent);
    }
    ._fd_row.selected::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: var(--accent);
      border-radius: 3px 0 0 3px;
    }

    ._fd_type_badge {
      width: 36px; height: 36px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      background: rgba(255,255,255,0.05);
    }

    ._fd_info {
      flex: 1;
      min-width: 0;
    }
    ._fd_name {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    ._fd_url {
      font-size: 10px;
      color: rgba(255,255,255,0.3);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: 'DM Mono', monospace;
      margin-top: 2px;
    }

    ._fd_ext {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      font-family: 'DM Mono', monospace;
      background: rgba(255,255,255,0.07);
      color: var(--accent);
      flex-shrink: 0;
    }

    ._fd_dl_btn {
      flex-shrink: 0;
      background: var(--accent);
      color: #000;
      border: none;
      border-radius: 7px;
      padding: 7px 13px;
      font-size: 12px;
      font-weight: 700;
      font-family: 'Syne', sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      transition: opacity 0.15s, transform 0.1s;
    }
    ._fd_dl_btn:hover { opacity: 0.85; transform: scale(0.97); }

    ._fd_check {
      width: 18px; height: 18px;
      border-radius: 5px;
      border: 2px solid rgba(255,255,255,0.15);
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, border-color 0.15s;
      font-size: 11px;
    }
    ._fd_row.selected ._fd_check {
      background: var(--accent);
      border-color: var(--accent);
      color: #000;
    }

    ._fd_preview_wrap {
      padding: 0 24px 12px;
      flex-shrink: 0;
      display: none;
    }
    ._fd_preview_wrap.active { display: block; }
    ._fd_preview_inner {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: 12px;
    }
    ._fd_preview_inner audio,
    ._fd_preview_inner video {
      width: 100%;
      border-radius: 8px;
      outline: none;
    }
    ._fd_preview_inner img {
      max-height: 160px;
      border-radius: 8px;
      display: block;
    }

    #_fd_footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      border-top: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
      gap: 10px;
    }
    #_fd_footer .sel_info {
      font-size: 12px;
      color: rgba(255,255,255,0.35);
      font-family: 'DM Mono', monospace;
    }
    #_fd_footer .actions {
      display: flex;
      gap: 8px;
    }
    ._fd_action_btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      font-family: 'Syne', sans-serif;
      cursor: pointer;
      border: none;
      transition: opacity 0.15s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    ._fd_action_btn:hover { opacity: 0.8; }
    ._fd_action_btn.ghost {
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.7);
      border: 1px solid rgba(255,255,255,0.1);
    }
    ._fd_action_btn.primary {
      background: linear-gradient(135deg, #f97316, #a855f7);
      color: #fff;
    }
    ._fd_action_btn.danger {
      background: rgba(239,68,68,0.12);
      color: #f87171;
      border: 1px solid rgba(239,68,68,0.2);
    }
  `;
  document.head.appendChild(style);

  // ---------- STATE ----------
  let allFiles = [];
  let currentTab = 'all';
  let selected = new Set();
  let previewUrl = null;

  // ---------- BUILD UI ----------
  const fab = document.createElement('div');
  fab.id = '_fd_fab';
  fab.innerHTML = `<span>⬇</span> File Downloader <span class="badge" id="_fd_fab_count">0</span>`;
  document.body.appendChild(fab);

  const overlay = document.createElement('div');
  overlay.id = '_fd_overlay';
  overlay.innerHTML = `
    <div id="_fd_modal">
      <div id="_fd_topbar">
        <div>
          <div class="title">📂 File Downloader</div>
          <div class="subtitle" id="_fd_page_host"></div>
        </div>
        <div id="_fd_close">✕</div>
      </div>
      <div id="_fd_tabs"></div>
      <div id="_fd_preview_wrap" class="_fd_preview_wrap">
        <div class="_fd_preview_inner" id="_fd_preview_inner"></div>
      </div>
      <div id="_fd_grid"></div>
      <div id="_fd_footer">
        <div class="sel_info" id="_fd_sel_info">No files selected</div>
        <div class="actions">
          <button class="_fd_action_btn ghost" id="_fd_sel_all">☑ Select All</button>
          <button class="_fd_action_btn danger" id="_fd_clear_sel">✕ Clear</button>
          <button class="_fd_action_btn primary" id="_fd_copy_json">📋 Copy URLs</button>
          <button class="_fd_action_btn primary" id="_fd_dl_all">⬇ Download All</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ---------- HELPERS ----------
  function getTabFiles() {
    if (currentTab === 'all') return allFiles;
    return allFiles.filter(f => getType(f) === currentTab);
  }

  function getAccent(url) {
    return TYPE_COLORS[getType(url)] || '#6b7280';
  }

  function renderTabs() {
    const tabBar = document.getElementById('_fd_tabs');
    tabBar.innerHTML = '';
    const types = ['all', ...Object.keys(FILE_TYPES)];
    types.forEach(type => {
      const count = type === 'all' ? allFiles.length : allFiles.filter(f => getType(f) === type).length;
      if (type !== 'all' && count === 0) return;
      const tab = document.createElement('div');
      tab.className = '_fd_tab' + (currentTab === type ? ' active' : '');
      if (type !== 'all') tab.style.color = TYPE_COLORS[type];
      tab.innerHTML = `
        ${type === 'all' ? '🗂' : TYPE_ICONS[type]}
        ${type.charAt(0).toUpperCase() + type.slice(1)}
        <span class="count">${count}</span>
      `;
      tab.onclick = () => { currentTab = type; renderTabs(); renderGrid(); };
      tabBar.appendChild(tab);
    });
  }

  function renderGrid() {
    const grid = document.getElementById('_fd_grid');
    const files = getTabFiles();
    grid.innerHTML = '';
    updateSelInfo();

    if (!files.length) {
      grid.innerHTML = `
        <div class="_fd_empty">
          <div class="icon">🔍</div>
          <div>No ${currentTab === 'all' ? '' : currentTab + ' '}files found on this page</div>
        </div>
      `;
      return;
    }

    files.forEach(url => {
      const type = getType(url);
      const accent = TYPE_COLORS[type] || '#6b7280';
      const ext = getExt(url);
      const name = getFileName(url);
      const row = document.createElement('div');
      row.className = '_fd_row' + (selected.has(url) ? ' selected' : '');
      row.style.setProperty('--accent', accent);
      row.dataset.url = url;

      row.innerHTML = `
        <div class="_fd_check">${selected.has(url) ? '✓' : ''}</div>
        <div class="_fd_type_badge">${TYPE_ICONS[type] || '📄'}</div>
        <div class="_fd_info">
          <div class="_fd_name" title="${name}">${name}</div>
          <div class="_fd_url" title="${url}">${url}</div>
        </div>
        <span class="_fd_ext" style="--accent:${accent}">${ext}</span>
        <a class="_fd_dl_btn" href="${url}" download="${name}" target="_blank" style="background:${accent}" onclick="event.stopPropagation()">
          ⬇ Save
        </a>
      `;

      row.onclick = (e) => {
        if (e.target.closest('a')) return;
        if (selected.has(url)) selected.delete(url);
        else selected.add(url);
        row.classList.toggle('selected', selected.has(url));
        row.querySelector('._fd_check').textContent = selected.has(url) ? '✓' : '';
        updateSelInfo();
        showPreview(url);
      };

      grid.appendChild(row);
    });
  }

  function showPreview(url) {
    const wrap = document.getElementById('_fd_preview_wrap');
    const inner = document.getElementById('_fd_preview_inner');
    const type = getType(url);
    const ext = getExt(url);
    let html = '';
    if (['mp3','wav','ogg','flac','aac','m4a','wma','opus','aiff'].includes(ext)) {
      html = `<audio controls src="${url}" preload="metadata"></audio>`;
    } else if (['mp4','webm','ogv','mov'].includes(ext)) {
      html = `<video controls src="${url}" preload="metadata" style="max-height:180px;"></video>`;
    } else if (['jpg','jpeg','png','gif','webp','svg','bmp','avif'].includes(ext)) {
      html = `<img src="${url}" alt="preview">`;
    } else {
      wrap.classList.remove('active');
      return;
    }
    inner.innerHTML = html;
    wrap.classList.add('active');
    previewUrl = url;
  }

  function updateSelInfo() {
    const info = document.getElementById('_fd_sel_info');
    const n = selected.size;
    info.textContent = n === 0 ? 'No files selected' : `${n} file${n > 1 ? 's' : ''} selected`;
    document.getElementById('_fd_fab_count').textContent = allFiles.length;
  }

  function downloadAll() {
    const targets = selected.size ? [...selected] : getTabFiles();
    if (!targets.length) { alert('No files to download!'); return; }
    targets.forEach((url, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = url;
        a.download = getFileName(url);
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 300);
    });
  }

  function copyUrls() {
    const targets = selected.size ? [...selected] : getTabFiles();
    if (!targets.length) { alert('No files!'); return; }
    navigator.clipboard.writeText(JSON.stringify(targets, null, 2))
      .then(() => alert(`✓ Copied ${targets.length} URL${targets.length > 1 ? 's' : ''}`))
      .catch(() => alert('Copy failed'));
  }

  // ---------- OPEN ----------
  function openModal() {
    allFiles = collectFileUrls();
    selected.clear();
    currentTab = 'all';
    document.getElementById('_fd_page_host').textContent = window.location.hostname;
    document.getElementById('_fd_fab_count').textContent = allFiles.length;
    document.getElementById('_fd_preview_wrap').classList.remove('active');
    renderTabs();
    renderGrid();
    overlay.classList.add('active');
  }

  // ---------- EVENT HANDLERS ----------
  fab.onclick = openModal;

  document.getElementById('_fd_close').onclick = () => overlay.classList.remove('active');
  overlay.onclick = e => { if (e.target === overlay) overlay.classList.remove('active'); };

  document.getElementById('_fd_copy_json').onclick = copyUrls;
  document.getElementById('_fd_dl_all').onclick = downloadAll;

  document.getElementById('_fd_sel_all').onclick = () => {
    const files = getTabFiles();
    const allSel = files.every(f => selected.has(f));
    if (allSel) files.forEach(f => selected.delete(f));
    else files.forEach(f => selected.add(f));
    renderGrid();
  };

  document.getElementById('_fd_clear_sel').onclick = () => {
    selected.clear();
    renderGrid();
    document.getElementById('_fd_preview_wrap').classList.remove('active');
  };
})();
