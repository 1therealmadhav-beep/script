///
(function () {
  if (window.__IRV_NON_IMAGE_ARRAY__) return;
  window.__IRV_NON_IMAGE_ARRAY__ = true;

  // ---------- ONLY NON-IMAGE EXTENSIONS ----------
  const FILE_EXTENSIONS = new Set([
    // audio
    'mp3','wav','ogg','flac','aac','m4a','opus',
    // video
    'mp4','webm','ogv','mov','avi','mkv','flv','m4v','3gp',
    // documents
    'pdf','doc','docx','xls','xlsx','ppt','pptx','txt','rtf','odt','ods','odp',
    // archives
    'zip','rar','7z','tar','gz','bz2','xz',
    // executables / installers
    'exe','msi','apk','deb','rpm','dmg','pkg',
    // other data
    'json','xml','csv','log','sql','iso','img','bin'
  ]);

  function resolveUrl(url) {
    try {
      return new URL(url, window.location.href).href;
    } catch {
      return url;
    }
  }

  function getFileExtension(url) {
    let path = url.split('?')[0].split('#')[0];
    let ext = path.split('.').pop().toLowerCase();
    return ext;
  }

  function isNonImageFile(url) {
    if (!url) return false;
    let ext = getFileExtension(url);
    return FILE_EXTENSIONS.has(ext);
  }

  // ---------- COLLECT ONLY NON-IMAGE URLS ----------
  function collectNonImageUrls() {
    const urls = new Set();

    // 1. <video> and <audio> (src + <source>)
    document.querySelectorAll('video, audio').forEach(media => {
      if (media.src) urls.add(resolveUrl(media.src));
      media.querySelectorAll('source').forEach(source => {
        if (source.src) urls.add(resolveUrl(source.src));
      });
    });

    // 2. <a> links that point to non-image files
    document.querySelectorAll('a[href]').forEach(a => {
      let url = a.href;
      if (url && isNonImageFile(url)) urls.add(resolveUrl(url));
    });

    // 3. <embed> and <object>
    document.querySelectorAll('embed[src], object[data]').forEach(el => {
      let url = el.src || el.data;
      if (url && isNonImageFile(url)) urls.add(resolveUrl(url));
    });

    // 4. <source> inside <picture>? Usually images, so skip.
    //    But if someone uses picture for video? Unlikely. We'll skip.

    // 5. Optional: data-* attributes that may contain file URLs
    document.querySelectorAll('[data-src], [data-url], [data-file]').forEach(el => {
      let url = el.dataset.src || el.dataset.url || el.dataset.file;
      if (url && isNonImageFile(url)) urls.add(resolveUrl(url));
    });

    return [...urls];
  }

  // ---------- UI (simplified, without image previews) ----------
  function getFileIconHtml(url) {
    let ext = getFileExtension(url);
    if (['mp3','wav','ogg','flac','aac','m4a','opus'].includes(ext)) {
      return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#2c3e50;color:white;font-size:32px;">🎵</div>`;
    } else if (['mp4','webm','ogv','mov','avi','mkv','flv'].includes(ext)) {
      return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#34495e;color:white;font-size:32px;">🎬</div>`;
    } else if (['pdf'].includes(ext)) {
      return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#e74c3c;color:white;font-size:32px;">📄</div>`;
    } else if (['zip','rar','7z','tar','gz'].includes(ext)) {
      return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f39c12;color:white;font-size:32px;">🗜️</div>`;
    } else {
      return `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#7f8c8d;color:white;font-size:32px;">📁</div>`;
    }
  }

  function renderGrid(urls) {
    const grid = document.getElementById('irv-grid');
    grid.innerHTML = '';
    if (!urls.length) {
      grid.innerHTML = '<div style="padding:20px;text-align:center;">No non‑image files (MP3, MP4, PDF, ZIP, etc.) found on this page.</div>';
      return;
    }
    urls.forEach(url => {
      const item = document.createElement('div');
      item.className = 'irv-item';
      item.dataset.url = url;

      const iconDiv = document.createElement('div');
      iconDiv.style.width = '100%';
      iconDiv.style.height = '100px';
      iconDiv.style.display = 'flex';
      iconDiv.style.alignItems = 'center';
      iconDiv.style.justifyContent = 'center';
      iconDiv.innerHTML = getFileIconHtml(url);

      const label = document.createElement('div');
      label.textContent = url.split('/').pop() || url;
      label.style.fontSize = '11px';
      label.style.padding = '4px';
      label.style.whiteSpace = 'nowrap';
      label.style.overflow = 'hidden';
      label.style.textOverflow = 'ellipsis';
      label.title = url;

      item.appendChild(iconDiv);
      item.appendChild(label);
      item.onclick = () => item.classList.toggle('selected');
      grid.appendChild(item);
    });
  }

  function copySelected() {
    const selected = [...document.querySelectorAll('.irv-item.selected')].map(el => el.dataset.url);
    if (!selected.length) {
      alert('No files selected');
      return;
    }
    const json = JSON.stringify(selected, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      alert(`Copied ${selected.length} file URLs (JSON)`);
    }).catch(() => alert('Copy failed'));
  }

  // ---------- INJECT UI ----------
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
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
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
      position: relative;
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
  btn.textContent = '📁 Files (no images)';
  document.body.appendChild(btn);

  const overlay = document.createElement('div');
  overlay.id = 'irv-overlay';
  overlay.innerHTML = `
    <div id="irv-modal">
      <div id="irv-header">
        <strong>Non‑image files (audio, video, docs, archives…)</strong>
        <button id="irv-close">✕</button>
      </div>
      <div id="irv-grid"></div>
      <div id="irv-actions">
        <button id="irv-copy">📋 Copy selected URLs as JSON</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  btn.onclick = () => {
    renderGrid(collectNonImageUrls());
    overlay.style.display = 'block';
  };
  overlay.querySelector('#irv-close').onclick = () => overlay.style.display = 'none';
  overlay.querySelector('#irv-copy').onclick = copySelected;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
})();
