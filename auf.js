(function () {
  if (window.__IRV_FILE_ARRAY__) return;
  window.__IRV_FILE_ARRAY__ = true;

  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  //  CONFIGURATION
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const FILE_TYPES = {
    audio:   ['mp3','wav','ogg','flac','aac','m4a','wma','opus','aiff'],
    video:   ['mp4','webm','ogv','mov','avi','mkv','flv','wmv','3gp','m4v'],
    image:   ['jpg','jpeg','png','gif','webp','svg','bmp','ico','tiff','avif'],
    doc:     ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','rtf','csv','json','xml'],
    archive: ['zip','rar','7z','tar','gz','bz2'],
    other:   ['exe','msi','apk','dmg','iso']
  };
  const ALL_EXTENSIONS = new Set(Object.values(FILE_TYPES).flat());

  const TYPE_ICONS  = { audio:'\ud83c\udfb5', video:'\ud83c\udfac', image:'\ud83d\uddbc\ufe0f', doc:'\ud83d\udcc4', archive:'\ud83d\udce6', other:'\u2699\ufe0f' };
  const TYPE_COLORS = { audio:'#f97316', video:'#a855f7', image:'#06b6d4', doc:'#22c55e', archive:'#eab308', other:'#6b7280' };

  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  //  UTILITIES
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const resolveUrl  = u => { try { return new URL(u, location.href).href; } catch { return u; } };
  const getExt      = u => u.split('?')[0].split('#')[0].split('.').pop().toLowerCase();
  const isFileUrl   = u => u && ALL_EXTENSIONS.has(getExt(u));
  const getType     = u => { const e = getExt(u); for (const [t,es] of Object.entries(FILE_TYPES)) if (es.includes(e)) return t; return 'other'; };
  const isAV        = u => ['audio','video'].includes(getType(u));
  const getFileName = u => { try { return decodeURIComponent(u.split('?')[0].split('/').pop()) || u; } catch { return u; } };

  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  //  STATE
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  let allFiles    = [];          // all known file urls (deduped)
  let runtimeAV   = [];          // audio/video caught by XHR/fetch/mutation at runtime
  let currentTab  = 'all';
  const selected  = new Set();
  let activeAudio = null;        // currently playing HTMLAudioElement

  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  //  \u2460 RUNTIME AUDIO DETECT  (XHR + fetch intercept)
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  (function patchNetwork() {
    function onRuntimeUrl(rawUrl) {
      try {
        const url = resolveUrl(rawUrl);
        if (!isFileUrl(url)) return;
        if (allFiles.includes(url) || runtimeAV.includes(url)) return;
        runtimeAV.push(url);
        if (!allFiles.includes(url)) allFiles.push(url);
        showToast(`\ud83d\udd34 Runtime detected: ${getFileName(url)}`, TYPE_COLORS[getType(url)] || '#f97316');
        refreshIfOpen();
      } catch {}
    }

    // Patch XMLHttpRequest
    const _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      try { onRuntimeUrl(url); } catch {}
      return _open.call(this, method, url, ...rest);
    };

    // Patch fetch
    const _fetch = window.fetch;
    window.fetch = function (input, ...rest) {
      try { onRuntimeUrl(typeof input === 'string' ? input : input?.url || ''); } catch {}
      return _fetch.call(this, input, ...rest);
    };

    // Patch Audio constructor
    const _Audio = window.Audio;
    window.Audio = function (src) {
      const a = new _Audio(src);
      if (src) try { onRuntimeUrl(src); } catch {}
      const origSrcDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
      if (origSrcDesc) {
        Object.defineProperty(a, 'src', {
          set(v) { try { onRuntimeUrl(v); } catch {} origSrcDesc.set.call(this, v); },
          get()  { return origSrcDesc.get.call(this); }
        });
      }
      return a;
    };
  })();

  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  //  \u2461 NEW FILE WATCHER  (MutationObserver)
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const observer = new MutationObserver(mutations => {
    let found = [];
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        const check = el => {
          const srcs = [];
          if (el.tagName === 'AUDIO' || el.tagName === 'VIDEO') {
            if (el.src) srcs.push(el.src);
            el.querySelectorAll('source[src]').forEach(s => srcs.push(s.src));
          }
          if (el.tagName === 'A' && el.href && isFileUrl(el.href)) srcs.push(el.href);
          if (el.tagName === 'SOURCE' && el.src && isFileUrl(el.src)) srcs.push(el.src);
          srcs.forEach(raw => {
            const url = resolveUrl(raw);
            if (!isFileUrl(url)) return;
            if (!allFiles.includes(url)) { allFiles.push(url); found.push(url); }
          });
          el.querySelectorAll('audio,video,a[href],source[src]').forEach(check);
        };
        check(node);
      });
    });
    if (found.length) {
      showToast(`\ud83c\udd95 ${found.length} new file${found.length>1?'s':''} detected`, '#22c55e');
      refreshIfOpen();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  //  COLLECT (initial page scan)
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  function collectFileUrls() {
    const urls = new Set(allFiles);

    document.querySelectorAll('img').forEach(img => {
      const src = img.currentSrc || img.src;
      if (src && src !== location.href) urls.add(resolveUrl(src));
    });
    document.querySelectorAll('video,audio').forEach(m => {
      if (m.src) urls.add(resolveUrl(m.src));
      m.querySelectorAll('source').forEach(s => { if (s.src) urls.add(resolveUrl(s.src)); });
    });
    document.querySelectorAll('a[href]').forEach(a => {
      if (a.href && isFileUrl(a.href)) urls.add(resolveUrl(a.href));
    });
    document.querySelectorAll('picture source[srcset]').forEach(s => {
      (s.srcset||'').split(',').map(x=>x.trim().split(' ')[0]).forEach(u => { if(u) urls.add(resolveUrl(u)); });
    });
    document.querySelectorAll('embed[src],object[data]').forEach(el => {
      const u = el.src||el.data; if (u && isFileUrl(u)) urls.add(resolveUrl(u));
    });
    document.querySelectorAll('source[src]').forEach(s => {
      if (s.src && isFileUrl(s.src)) urls.add(resolveUrl(s.src));
    });

    allFiles = [...urls];
    return allFiles;
  }

  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  //  TOAST NOTIFICATIONS
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  let toastContainer;
  function ensureToastContainer() {
    if (!toastContainer) {
      toastContainer = document
