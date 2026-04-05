(function(){
  // ---------- CONFIG ----------
  const FILE_TYPES = {
    audio:   ['mp3','wav','ogg','flac','aac','m4a','wma','opus','aiff'],
    video:   ['mp4','webm','ogv','mov','avi','mkv','flv','wmv','3gp','m4v'],
    image:   ['jpg','jpeg','png','gif','webp','svg','bmp','ico','tiff','avif'],
    doc:     ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','rtf','csv','json','xml'],
    archive: ['zip','rar','7z','tar','gz','bz2'],
    other:   ['exe','msi','apk','dmg','iso']
  };
  const ALL_EXT = new Set(Object.values(FILE_TYPES).flat());
  const TYPE_ICONS = { audio:'🎵', video:'🎬', image:'🖼️', doc:'📄', archive:'📦', other:'⚙️' };
  const TYPE_CLR   = { audio:'#f97316', video:'#a855f7', image:'#06b6d4', doc:'#22c55e', archive:'#eab308', other:'#6b7280' };

  // Helper: detect file type (blob URLs always count as files)
  const resolve = u => { try{ return new URL(u, location.href).href; }catch{ return u; } };
  const ext = u => { try{ return u.split('?')[0].split('#')[0].split('.').pop().toLowerCase(); }catch{ return ''; } };
  const isFile = u => {
    if (!u) return false;
    if (u.startsWith('blob:')) return true;           // ← blob: URLs are valid files
    return ALL_EXT.has(ext(u));
  };
  const typeOf = u => {
    if (u.startsWith('blob:')) return 'audio';        // assume blob is audio/video (most common)
    const e = ext(u);
    for(const [t, es] of Object.entries(FILE_TYPES)) if(es.includes(e)) return t;
    return 'other';
  };
  const isAV = u => ['audio','video'].includes(typeOf(u));
  const fname = u => {
    if (u.startsWith('blob:')) return `audio_${Date.now()}.mp3`;
    try{ return decodeURIComponent(u.split('?')[0].split('/').pop())||'file'; }catch{ return 'file'; }
  };

  // ---------- STATE ----------
  let allFiles = [], runtimeAV = [], currentTab = 'all', currentPlayBtn = null;
  const sel = new Set();

  // ---------- NETWORK LOG (new) ----------
  let networkLogs = [];   // each entry: { url, method, timestamp, type }
  function addNetworkLog(url, method, type='xhr/fetch') {
    networkLogs.unshift({ url: resolve(url), method, timestamp: new Date().toLocaleTimeString(), type });
    if (networkLogs.length > 200) networkLogs.pop();
    if (document.getElementById('_fd_netlog')) renderNetworkLogs();
  }

  // ---------- RUNTIME DETECTION (XHR + fetch + Audio) ----------
  if (!window.__IRV_PATCHED__) {
    window.__IRV_PATCHED__ = true;

    const _xhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      try{ if (url && typeof url === 'string') { addNetworkLog(url, method, 'XHR'); catchUrl(url); } }catch(e){}
      return _xhrOpen.call(this, method, url, ...rest);
    };

    const _fetch = window.fetch;
    window.fetch = function(input, ...rest) {
      let url = typeof input === 'string' ? input : (input && input.url);
      if (url) { addNetworkLog(url, 'FETCH', 'fetch'); catchUrl(url); }
      return _fetch.call(this, input, ...rest);
    };

    const _Audio = window.Audio;
    window.Audio = function(src) {
      if (src) { addNetworkLog(src, 'Audio', 'Audio'); catchUrl(src); }
      return new _Audio(src);
    };
  }

  function catchUrl(raw) {
    const url = resolve(raw);
    if (!isFile(url) || allFiles.includes(url)) return;
    allFiles.push(url);
    if (isAV(url) && !runtimeAV.includes(url)) runtimeAV.push(url);
    toast('🔴 Runtime: '+fname(url), TYPE_CLR[typeOf(url)]||'#f97316');
    softRefresh();
  }

  // ---------- MUTATION OBSERVER (new DOM elements) ----------
  new MutationObserver(muts => {
    let found = 0;
    muts.forEach(m => m.addedNodes.forEach(node => {
      if(node.nodeType !== 1) return;
      const scan = el => {
        const srcs = [];
        if(/^(AUDIO|VIDEO)$/.test(el.tagName)){
          if(el.src) srcs.push(el.src);
          el.querySelectorAll('source[src]').forEach(s=>srcs.push(s.src));
        }
        if(el.tagName==='A' && el.href && isFile(el.href)) srcs.push(el.href);
        if(el.tagName==='SOURCE' && el.src && isFile(el.src)) srcs.push(el.src);
        srcs.forEach(raw=>{
          const url=resolve(raw);
          if(isFile(url) && !allFiles.includes(url)){ allFiles.push(url); found++; }
        });
        el.querySelectorAll('audio,video,a[href],source[src]').forEach(scan);
      };
      scan(node);
    }));
    if(found){ toast(`🆕 ${found} new file${found>1?'s':''} detected`,'#22c55e'); softRefresh(); }
  }).observe(document.documentElement,{childList:true,subtree:true});

  // ---------- COLLECT (full page scan) ----------
  function collect(){
    const s = new Set(allFiles);
    document.querySelectorAll('img').forEach(i=>{ const u=i.currentSrc||i.src; if(u && u!==location.href && isFile(u)) s.add(resolve(u)); });
    document.querySelectorAll('video,audio').forEach(m=>{
      if(m.src && isFile(m.src)) s.add(resolve(m.src));
      m.querySelectorAll('source').forEach(x=>{ if(x.src && isFile(x.src)) s.add(resolve(x.src)); });
    });
    document.querySelectorAll('a[href]').forEach(a=>{ if(a.href && isFile(a.href)) s.add(resolve(a.href)); });
    document.querySelectorAll('picture source[srcset]').forEach(x=>{
      (x.srcset||'').split(',').map(v=>v.trim().split(' ')[0]).forEach(u=>{ if(u && isFile(u)) s.add(resolve(u)); });
    });
    document.querySelectorAll('embed[src],object[data]').forEach(el=>{ const u=el.src||el.data; if(u && isFile(u)) s.add(resolve(u)); });
    document.querySelectorAll('source[src]').forEach(x=>{ if(x.src && isFile(x.src)) s.add(resolve(x.src)); });
    allFiles = [...s];
  }

  // ---------- TOAST NOTIFICATIONS ----------
  let tWrap;
  function toast(msg, color='#f97316'){
    if(!tWrap){
      tWrap=document.createElement('div');
      tWrap.id='_fd_toast_wrap';
      tWrap.style.cssText='position:fixed;bottom:82px;right:24px;z-index:2147483648;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none;';
      document.body.appendChild(tWrap);
    }
    const t=document.createElement('div');
    t.style.cssText=`background:#111118;border:1px solid ${color}44;border-left:3px solid ${color};color:#fff;font:600 12px/1.4 'Syne',sans-serif;padding:8px 14px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.6);max-width:260px;opacity:0;transform:translateX(10px);transition:opacity .25s,transform .25s;`;
    t.textContent=msg;
    tWrap.appendChild(t);
    requestAnimationFrame(()=>{ t.style.opacity='1'; t.style.transform='translateX(0)'; });
    setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateX(10px)'; setTimeout(()=>t.remove(),300); },2800);
  }

  // ---------- INJECT CSS (same as before + network log styles) ----------
  const css = document.createElement('style');
  css.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');
    @keyframes _fd_su { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
    @keyframes _fd_pu { 0%,100%{opacity:1}50%{opacity:.35} }

    #_fd_fab {
      position:fixed;bottom:24px;right:24px;z-index:2147483647;
      background:linear-gradient(135deg,#f97316 0%,#a855f7 100%);
      color:#fff;padding:11px 18px;border-radius:50px;cursor:pointer;
      font:700 13px/1 'Syne',sans-serif;
      box-shadow:0 4px 20px #a855f777;
      display:flex;align-items:center;gap:8px;
      transition:transform .2s,box-shadow .2s;user-select:none;
    }
    #_fd_fab:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 8px 28px #a855f799;}
    #_fd_fab .fdot{width:7px;height:7px;background:#22c55e;border-radius:50%;animation:_fd_pu 1.4s infinite;}
    #_fd_fab .fbadge{background:rgba(255,255,255,.22);border-radius:20px;padding:2px 8px;font-size:11px;}

    #_fd_overlay {
      position:fixed !important;
      inset:0 !important;
      z-index:2147483646 !important;
      background:rgba(0,0,0,.82) !important;
      backdrop-filter:blur(10px);
      display:none !important;
      align-items:center !important;
      justify-content:center !important;
    }
    #_fd_overlay.open { display:flex !important; }

    #_fd_modal {
      background:#0d0d11;
      border:1px solid rgba(255,255,255,.09);
      width:min(96vw,980px);
      height:min(92vh,740px);
      border-radius:18px;
      display:flex;
      flex-direction:column;
      overflow:hidden;
      box-shadow:0 40px 90px rgba(0,0,0,.8);
      animation:_fd_su .25s cubic-bezier(.16,1,.3,1);
      font-family:'Syne',sans-serif;
    }

    /* Top bar */
    #_fd_top{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;}
    #_fd_top .ttl{font-size:16px;font-weight:800;color:#fff;display:flex;align-items:center;gap:8px;}
    #_fd_top .sub{font-size:10px;color:rgba(255,255,255,.28);font-family:'DM Mono',monospace;margin-top:2px;}
    .livebadge{font-size:9px;font-weight:800;background:#22c55e14;border:1px solid #22c55e44;color:#22c55e;padding:2px 7px;border-radius:20px;letter-spacing:.8px;}
    #_fd_x{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;transition:background .15s;}
    #_fd_x:hover{background:rgba(255,255,255,.14);color:#fff;}

    /* Toolbar */
    #_fd_tb{display:flex;align-items:center;gap:8px;padding:10px 20px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;flex-wrap:wrap;}
    #_fd_q{flex:1;min-width:130px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;font-family:'DM Mono',monospace;font-size:12px;padding:7px 12px;outline:none;}
    #_fd_q::placeholder{color:rgba(255,255,255,.2);}
    #_fd_q:focus{border-color:#f9731666;}
    .tbbtn{padding:6px 13px;border-radius:8px;font-size:11px;font-weight:700;font-family:'Syne',sans-serif;cursor:pointer;border:none;display:flex;align-items:center;gap:5px;white-space:nowrap;transition:opacity .15s;}
    .tbbtn:hover{opacity:.75;}
    .tbbtn.green{background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.22);}
    .tbbtn.orange{background:rgba(249,115,22,.1);color:#f97316;border:1px solid rgba(249,115,22,.22);}
    .tbbtn.dim{background:rgba(255,255,255,.04);color:rgba(255,255,255,.28);border:1px solid rgba(255,255,255,.08);}

    /* Tabs (now includes Network Logs) */
    #_fd_tabs{display:flex;gap:2px;padding:8px 20px 0;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,.06);overflow-x:auto;}
    .fdtab{padding:6px 12px;border-radius:8px 8px 0 0;font-size:11px;font-weight:700;cursor:pointer;color:rgba(255,255,255,.3);transition:color .15s;white-space:nowrap;display:flex;align-items:center;gap:5px;border-bottom:2px solid transparent;margin-bottom:-1px;}
    .fdtab:hover{color:rgba(255,255,255,.6);}
    .fdtab.on{color:#fff;border-bottom-color:var(--tc,#fff);}
    .fdtab .cnt{background:rgba(255,255,255,.07);border-radius:20px;padding:1px 5px;font-size:9px;font-family:'DM Mono',monospace;}
    .fdtab .nd{width:5px;height:5px;background:#22c55e;border-radius:50%;animation:_fd_pu 1.5s infinite;}

    /* Mini player */
    #_fd_mp{flex-shrink:0;padding:0 20px 10px;display:none;}
    #_fd_mp.on{display:block;}
    #_fd_mpi{background:rgba(249,115,22,.07);border:1px solid rgba(249,115,22,.18);border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:12px;}
    #_fd_mpi audio{flex:1;height:34px;outline:none;border-radius:6px;}
    #_fd_mlbl{font-size:11px;font-weight:700;color:#f97316;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;flex-shrink:0;}
    #_fd_mx{width:22px;height:22px;border-radius:50%;flex-shrink:0;background:rgba(255,255,255,.07);border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;}
    #_fd_mx:hover{color:#fff;}

    /* File grid / Network log */
    #_fd_grid{flex:1;overflow-y:auto;padding:12px 20px;display:flex;flex-direction:column;gap:5px;}
    #_fd_grid::-webkit-scrollbar{width:3px;}
    #_fd_grid::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:4px;}

    .fdempty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,.14);font-size:13px;gap:10px;padding:40px;text-align:center;}
    .fdrow{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:10px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);cursor:pointer;transition:all .12s;}
    .fdrow:hover{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.09);}
    .fdck{width:16px;height:16px;border-radius:4px;border:2px solid rgba(255,255,255,.13);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;}
    .fdrow.on .fdck{background:var(--ac);border-color:var(--ac);color:#000;}
    .fdbadge{width:32px;height:32px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;background:rgba(255,255,255,.05);}
    .fdinfo{flex:1;min-width:0;}
    .fdname{font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .fdurl{font-size:9px;color:rgba(255,255,255,.2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'DM Mono',monospace;margin-top:2px;}
    .fdext{font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;text-transform:uppercase;font-family:'DM Mono',monospace;background:rgba(255,255,255,.06);color:var(--ac);flex-shrink:0;}
    .fdlive{font-size:8px;font-weight:800;letter-spacing:.8px;background:#22c55e14;color:#22c55e;border:1px solid #22c55e33;padding:1px 5px;border-radius:4px;font-family:'DM Mono',monospace;flex-shrink:0;}
    .fdplay{width:30px;height:30px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;background:var(--ac);color:#000;opacity:.85;transition:transform .15s,opacity .15s;flex-shrink:0;}
    .fdplay:hover{transform:scale(1.12);opacity:1;}
    .fddl{flex-shrink:0;background:var(--ac);color:#000;border:none;border-radius:7px;padding:6px 11px;font-size:11px;font-weight:700;font-family:'Syne',sans-serif;cursor:pointer;display:flex;align-items:center;gap:4px;text-decoration:none;transition:opacity .12s,transform .1s;}
    .fddl:hover{opacity:.78;transform:scale(0.97);}

    /* Network log row */
    .netrow{display:flex;align-items:center;gap:12px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.05);font-family:'DM Mono',monospace;font-size:11px;color:#ccc;}
    .nettime{color:#6b7280;width:70px;flex-shrink:0;}
    .netmethod{background:rgba(255,255,255,.08);padding:2px 6px;border-radius:4px;width:60px;flex-shrink:0;}
    .neturl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;color:#9ca3af;}

    /* Footer */
    #_fd_foot{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0;gap:8px;flex-wrap:wrap;}
    .fdsi{font-size:11px;color:rgba(255,255,255,.26);font-family:'DM Mono',monospace;}
    .fdacts{display:flex;gap:6px;flex-wrap:wrap;}
    .fdbtn{padding:7px 13px;border-radius:8px;font-size:11px;font-weight:700;font-family:'Syne',sans-serif;cursor:pointer;border:none;display:flex;align-items:center;gap:5px;transition:opacity .15s;}
    .fdbtn:hover{opacity:.76;}
    .fdbtn.g{background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.09);}
    .fdbtn.p{background:linear-gradient(135deg,#f97316,#a855f7);color:#fff;}
    .fdbtn.r{background:rgba(239,68,68,.09);color:#f87171;border:1px solid rgba(239,68,68,.18);}
  `;
  document.head.appendChild(css);

  // ---------- CREATE FAB & OVERLAY ----------
  const fab = document.createElement('div');
  fab.id = '_fd_fab';
  fab.innerHTML = `<span class="fdot"></span> File Downloader <span class="fbadge" id="_fd_cnt">0</span>`;
  document.body.appendChild(fab);

  const ov = document.createElement('div');
  ov.id = '_fd_overlay';
  ov.innerHTML = `
    <div id="_fd_modal">
      <div id="_fd_top">
        <div>
          <div class="ttl">📂 File Downloader <span class="livebadge">● LIVE</span></div>
          <div class="sub" id="_fd_host"></div>
        </div>
        <div id="_fd_x">✕</div>
      </div>
      <div id="_fd_tb">
        <input id="_fd_q" type="text" placeholder="🔍  Search by name or URL…">
        <button class="tbbtn green" id="_fd_rescan">🔄 Rescan</button>
        <button class="tbbtn orange" id="_fd_rtbtn">🔴 Runtime: ON</button>
      </div>
      <div id="_fd_tabs"></div>
      <div id="_fd_mp">
        <div id="_fd_mpi">
          <span id="_fd_mlbl">—</span>
          <audio id="_fd_maud" controls preload="none"></audio>
          <button id="_fd_mx">✕</button>
        </div>
      </div>
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
  document.body.appendChild(ov);

  // ---------- MINI PLAYER ----------
  const mpDiv = document.getElementById('_fd_mp');
  const maud = document.getElementById('_fd_maud');
  const mlbl = document.getElementById('_fd_mlbl');
  function play(url, btn){
    if(currentPlayBtn && currentPlayBtn!==btn){
      currentPlayBtn.textContent='▶';
      currentPlayBtn.classList.remove('going');
    }
    if(maud.src===url && !maud.paused){
      maud.pause();
      btn.textContent='▶'; btn.classList.remove('going');
      currentPlayBtn=null; return;
    }
    maud.src=url; maud.play().catch(()=>{});
    mlbl.textContent=fname(url); mlbl.title=url;
    mpDiv.classList.add('on');
    btn.textContent='⏸'; btn.classList.add('going');
    currentPlayBtn=btn;
    maud.onended=()=>{ btn.textContent='▶'; btn.classList.remove('going'); currentPlayBtn=null; };
  }
  document.getElementById('_fd_mx').onclick = () => {
    maud.pause(); maud.src=''; mpDiv.classList.remove('on');
    if(currentPlayBtn){ currentPlayBtn.textContent='▶'; currentPlayBtn.classList.remove('going'); currentPlayBtn=null; }
  };

  // ---------- RENDER FUNCTIONS (files + network logs) ----------
  function filtered(){
    if (currentTab === 'all') return allFiles;
    if (currentTab === 'network') return [];   // network tab handled separately
    return allFiles.filter(u=>typeOf(u)===currentTab);
  }
  function renderNetworkLogs(){
    const grid = document.getElementById('_fd_grid');
    if (currentTab !== 'network') return;
    if (!networkLogs.length) {
      grid.innerHTML = '<div class="fdempty"><span>🌐</span>No network requests captured yet</div>';
      return;
    }
    grid.innerHTML = networkLogs.map(log => `
      <div class="netrow">
        <span class="nettime">${log.timestamp}</span>
        <span class="netmethod">${log.method}</span>
        <span class="neturl" title="${log.url}">${log.url}</span>
      </div>
    `).join('');
  }

  function renderTabs(){
    const bar = document.getElementById('_fd_tabs');
    bar.innerHTML = '';
    const tabs = ['all', ...Object.keys(FILE_TYPES), 'network'];
    for (let t of tabs) {
      if (t === 'network') {
        const tab = document.createElement('div');
        tab.className = 'fdtab' + (currentTab === 'network' ? ' on' : '');
        tab.style.setProperty('--tc', '#8b5cf6');
        tab.innerHTML = `🌐 Network Logs <span class="cnt">${networkLogs.length}</span>`;
        tab.onclick = () => { currentTab = 'network'; renderTabs(); renderNetworkLogs(); updateInfo(); };
        bar.appendChild(tab);
        continue;
      }
      const files = t === 'all' ? allFiles : allFiles.filter(u=>typeOf(u)===t);
      if (t !== 'all' && !files.length) continue;
      const hasRT = files.some(u=>runtimeAV.includes(u));
      const clr = TYPE_CLR[t] || '#fff';
      const tab = document.createElement('div');
      tab.className = 'fdtab' + (currentTab === t ? ' on' : '');
      tab.style.setProperty('--tc', clr);
      if (t !== 'all' && currentTab !== t) tab.style.color = clr+'77';
      tab.innerHTML = `${t==='all'?'🗂':TYPE_ICONS[t]} ${t[0].toUpperCase()+t.slice(1)} <span class="cnt">${files.length}</span>${hasRT?'<span class="nd"></span>':''}`;
      tab.onclick = () => { currentTab = t; renderTabs(); renderGrid(); updateInfo(); };
      bar.appendChild(tab);
    }
  }

  function renderGrid(){
    if (currentTab === 'network') { renderNetworkLogs(); return; }
    const grid = document.getElementById('_fd_grid');
    const files = filtered();
    grid.innerHTML = '';
    updateInfo();
    if(!files.length){
      grid.innerHTML='<div class="fdempty"><span>🔍</span>No files found on this page</div>';
      return;
    }
    files.forEach(url => {
      const t = typeOf(url);
      const ac = TYPE_CLR[t]||'#6b7280';
      const e = ext(url);
      const n = fname(url);
      const av = isAV(url);
      const rt = runtimeAV.includes(url);
      const row = document.createElement('div');
      row.className='fdrow'+(sel.has(url)?' on':'');
      row.style.setProperty('--ac',ac);
      const ck = document.createElement('div');
      ck.className='fdck'; ck.textContent=sel.has(url)?'✓':'';
      const bd = document.createElement('div');
      bd.className='fdbadge'; bd.textContent=TYPE_ICONS[t]||'📄';
      const info = document.createElement('div');
      info.className='fdinfo';
      info.innerHTML=`<div class="fdname" title="${n}">${n}</div><div class="fdurl" title="${url}">${url}</div>`;
      const extEl = document.createElement('span');
      extEl.className='fdext'; extEl.textContent=e;
      const dlEl = document.createElement('a');
      dlEl.className='fddl'; dlEl.href=url; dlEl.download=n; dlEl.target='_blank';
      dlEl.style.background=ac; dlEl.innerHTML='⬇ Save';
      dlEl.onclick=ev=>ev.stopPropagation();
      row.appendChild(ck); row.appendChild(bd); row.appendChild(info);
      if(rt){ const lt=document.createElement('span'); lt.className='fdlive'; lt.textContent='LIVE'; row.appendChild(lt); }
      row.appendChild(extEl);
      if(av){
        const pb=document.createElement('button');
        pb.className='fdplay'; pb.style.setProperty('--ac',ac);
        pb.title='Play / Pause'; pb.textContent='▶';
        pb.onclick=ev=>{ ev.stopPropagation(); play(url,pb); };
        row.appendChild(pb);
      }
      row.appendChild(dlEl);
      row.onclick=ev=>{
        if(ev.target.closest('a,button')) return;
        sel.has(url)?sel.delete(url):sel.add(url);
        row.classList.toggle('on',sel.has(url));
        ck.textContent=sel.has(url)?'✓':'';
        updateInfo();
      };
      grid.appendChild(row);
    });
  }

  function updateInfo(){
    const n = sel.size;
    document.getElementById('_fd_si').textContent = currentTab === 'network' ? `${networkLogs.length} network requests` : (n ? `${n} selected` : `${allFiles.length} file${allFiles.length!==1?'s':''} found`);
    document.getElementById('_fd_cnt').textContent = allFiles.length;
  }

  function softRefresh(){
    if(!ov.classList.contains('open')) return;
    renderTabs(); 
    if (currentTab === 'network') renderNetworkLogs(); else renderGrid();
    document.getElementById('_fd_cnt').textContent = allFiles.length;
  }

  // ---------- ACTIONS ----------
  function open(){ collect(); sel.clear(); currentTab='all'; document.getElementById('_fd_q').value=''; document.getElementById('_fd_host').textContent=location.hostname; renderTabs(); renderGrid(); ov.classList.add('open'); }
  function close(){ ov.classList.remove('open'); }
  function rescan(){ const before=allFiles.length; collect(); const added=allFiles.length-before; toast(added>0?`🔄 +${added} new file${added>1?'s':''}`:'🔄 No new files found', added>0?'#22c55e':'#6b7280'); renderTabs(); if(currentTab!=='network') renderGrid(); else renderNetworkLogs(); }
  function doDownload(){ const targets=sel.size?[...sel]:filtered(); if(!targets.length){ toast('No files!','#ef4444'); return; } targets.forEach((url,i)=>setTimeout(()=>{ const a=document.createElement('a'); a.href=url; a.download=fname(url); a.target='_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a); },i*300)); toast(`⬇ Downloading ${targets.length} file${targets.length>1?'s':''}…`,'#a855f7'); }
  function doCopy(){ const targets=sel.size?[...sel]:filtered(); if(!targets.length){ toast('No files!','#ef4444'); return; } navigator.clipboard.writeText(JSON.stringify(targets,null,2)).then(()=>toast(`✓ Copied ${targets.length} URL${targets.length>1?'s':''}`,'#22c55e')).catch(()=>toast('Copy failed','#ef4444')); }

  // ---------- WIRE EVENTS ----------
  fab.onclick = open;
  document.getElementById('_fd_x').onclick = close;
  ov.onclick = ev=>{ if(ev.target===ov) close(); };
  document.getElementById('_fd_rescan').onclick = rescan;
  document.getElementById('_fd_q').oninput = () => { if(currentTab!=='network') renderGrid(); };
  document.getElementById('_fd_cp').onclick = doCopy;
  document.getElementById('_fd_dl').onclick = doDownload;
  let rtOn=true;
  document.getElementById('_fd_rtbtn').onclick = function(){ rtOn=!rtOn; this.textContent=`🔴 Runtime: ${rtOn?'ON':'OFF'}`; this.className='tbbtn '+(rtOn?'orange':'dim'); };
  document.getElementById('_fd_sall').onclick = ()=>{ if(currentTab!=='network'){ const f=filtered(); f.every(u=>sel.has(u))?f.forEach(u=>sel.delete(u)):f.forEach(u=>sel.add(u)); renderGrid(); } };
  document.getElementById('_fd_clr').onclick = ()=>{ sel.clear(); if(currentTab!=='network') renderGrid(); };

  // Auto-open to show it works
  open();
})();
