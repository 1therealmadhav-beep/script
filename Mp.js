(function () {
  if (window.__IRV_FILE_ARRAY__) return;
  window.__IRV_FILE_ARRAY__ = true;

  // ---------- CONFIGURATION ----------
  const FILE_EXTENSIONS = new Set([
    // images
    'jpg','jpeg','png','gif','webp','svg','bmp','ico',
    // audio
    'mp3','wav','ogg','flac','aac','m4a',
    // video
    'mp4','webm','ogv','mov','avi','mkv','flv',
    // documents
    'pdf','doc','docx','xls','xlsx','ppt','pptx','txt','rtf',
    // archives
    'zip','rar','7z','tar','gz',
    // others
    'json','xml','csv','exe','msi','apk'
  ]);

  // ---------- UTILITIES ----------
  function resolveUrl(url) {
    try {
      return new URL(url, window.location.href).href;
    } catch {
      return url;
    }
  }

  function getFileExtension(url) {
    let path = url.split('?')[0].split('#')[0]; // remove query/hash
    let ext = path.split('.').pop().toLowerCase();
    return ext;
  }

  function isFileUrl(url) {
    if (!url) return false;
    let ext = getFileExtension(url);
    return FILE_EXTENSIONS.has(ext);
  }

  // ---------- COLLECT ALL FILE URLS ----------
  function collectFileUrls() {
    const urls = new Set();

    // 1. <img> src / srcset
    document.querySelectorAll('img').forEach(img => {
      let src = img.currentSrc || img.src;
      if (src && src !== window.location.href) urls.add(resolveUrl(src));
    });

    // 2. <video> and <audio> (src attribute + <source> children)
    document.querySelectorAll('video, audio').forEach(media => {
      if (media.src) urls.add(resolveUrl(media.src));
      media.querySelectorAll('source').forEach(source => {
        if (source.src) urls.add(resolveUrl(source.src));
      });
    });

    // 3. CSS background images (optional, can be disabled)
    document.querySelectorAll('*').forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (!bg || bg === 'none') return;
      const matches = bg.match(/url\(["']?([^"')]+)["']?\)/g);
      if (matches) {
        matches.forEach(m => {
          let url = m.replace(/url\(|\)|'|"/g, '');
          if (url) urls.add(resolveUrl(url));
        });
      }
    });

    // 4. <a> links that point to files
    document.querySelectorAll('a[href]').forEach(a => {
      let url = a.href;
      if (url && isFileUrl(url)) urls.add(resolveUrl(url));
    });

    // 5. <source> inside <picture> (mostly images)
    document.querySelectorAll('picture source[srcset]').forEach(source => {
      let srcset = source.srcset;
      if (srcset) {
        let urlsFromSrcset = srcset.split(',').map(s => s.trim().split(' ')[0]);
        urlsFromSrcset.forEach(url => {
          if (url) urls.add(resolveUrl(url));
        });
      }
    });

    // 6. <embed> and <object> (if they point to a file)
    document.querySelectorAll('embed[src], object[data]').forEach(el => {
      let url = el.src || el.data;
      if (url && isFileUrl(url)) urls.add(resolveUrl(url));
    });

    return [...urls];
  }

  // ---------- RENDER GRID (with previews/icons) ----------
  function getFileIconHtml(url) {
    let ext = getFileExtension(url);
    if (['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext)) {
      // image preview
      return `<img src="${url}" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (['mp4','webm','ogv','mov','avi'].includes(ext)) {
      // video placeholder – better not autoplay, show first frame
      return `<video src="${url}" style="width:100%;height:100%;object-fit:cover;" preload="metadata"></video>`;
    } else if (['mp3','wav','ogg','flac','aac','m4a'].includes(ext)) {
      // audio player (small)
      return `<audio controls style="width:100%;height:40px;margin-top:20px;"><source src="${url}"></audio>`;
    } else {
      // generic file icon
      return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f0f0f0;font-size:32px;">📄</div>`;
    }
  }

  function renderGrid(urls) {
    const grid = document.getElementById('irv-grid');
    grid.innerHTML = '';
    if (!urls.length) {
      grid.innerHTML = '<div style="padding:20px;text-align:center;">No files found on this page.</div>';
      return;
    }
    urls.forEach(url => {
      const item = document.createElement('div');
      item.className = 'irv-item';
      item.dataset.url = url;

      const previewDiv = document.createElement('div');
      previewDiv.style.width = '100%';
      previewDiv.style.height = '120px';
      previewDiv.style.overflow = 'hidden';
      previewDiv.style.position = 'relative';
      previewDiv.innerHTML = getFileIconHtml(url);

      const label = document.createElement('div');
      label.textContent = url.split('/').pop() || url;
      label.style.fontSize = '10px';
      label.style.padding = '4px';
      label.style.whiteSpace = 'nowrap';
      label.style.overflow = 'hidden';
      label.style.textOverflow = 'ellipsis';
      label.title = url;

      item.appendChild(previewDiv);
      item.appendChild(label);
      item.onclick = (e) => {
        e.stopPropagation();
        item.classList.toggle('selected');
      };
      grid.appendChild(item);
    });
  }

  // ---------- COPY SELECTED URLs AS JSON ----------
  function copySelected() {
    const selected = [...document.querySelectorAll('.irv-item.selected')]
      .map(el => el.dataset.url);
    if (!selected.length) {
      alert('No files selected');
      return;
    }
    const json = JSON.stringify(selected, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert(`Copied ${selected.length} file URLs as JSON`);
    }).catch(() => alert('Failed to copy'));
  }

  // ---------- CREATE UI ----------
  const style = document.createElement('style');
  style.textContent = `
    #irv-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      background: #000;
      color: #fff;
      padding: 10px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-family: sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    #irv-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      z-index: 999998;
      display: none;
    }
    #irv-modal {
      background: #fff;
      width: 95%;
      height: 90%;
      margin: 2% auto;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      padding: 10px;
      font-family: sans-serif;
    }
    #irv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid #ccc;
    }
    #irv-grid {
      flex: 1;
      margin-top: 10px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      overflow: auto;
      padding: 4px;
    }
    .irv-item {
      border: 2px solid transparent;
      cursor: pointer;
      border-radius: 6px;
      overflow: hidden;
      background: #f9f9f9;
      transition: 0.1s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .irv-item.selected {
      border-color: #0a84ff;
      background: #eef5ff;
    }
    .irv-item.selected::after {
      content: "✓";
      position: absolute;
      top: 4px;
      right: 6px;
      background: #0a84ff;
      color: #fff;
      font-size: 12px;
      padding: 2px 5px;
      border-radius: 50%;
      z-index: 2;
    }
    .irv-item {
      position: relative;
    }
    #irv-actions {
      margin-top: 12px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    button {
      padding: 6px 12px;
      cursor: pointer;
      border: none;
      border-radius: 4px;
      background: #0a84ff;
      color: white;
    }
    button:hover {
      background: #0066cc;
    }
  `;
  document.head.appendChild(style);

  const btn = document.createElement('div');
  btn.id = 'irv-btn';
  btn.textContent = '📁 File Grid';
  document.body.appendChild(btn);

  const overlay = document.createElement('div');
  overlay.id = 'irv-overlay';
  overlay.innerHTML = `
    <div id="irv-modal">
      <div id="irv-header">
        <strong>Select any file (images, audio, video, docs, archives…)</strong>
        <button id="irv-close">✕</button>
      </div>
      <div id="irv-grid"></div>
      <div id="irv-actions">
        <button id="irv-copy">📋 Copy Selected URLs (JSON)</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ---------- EVENT HANDLERS ----------
  btn.onclick = () => {
    const urls = collectFileUrls();
    renderGrid(urls);
    overlay.style.display = 'block';
  };

  overlay.querySelector('#irv-close').onclick = () => {
    overlay.style.display = 'none';
  };

  overlay.querySelector('#irv-copy').onclick = copySelected;

  // optional: close overlay when clicking outside modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.style.display = 'none';
  });
})();
