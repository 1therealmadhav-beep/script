(function () {
  if (window.__IRV_JSON_ARRAY__) return;
  window.__IRV_JSON_ARRAY__ = true;

  /* ---------- STYLES ---------- */
  const style = document.createElement("style");
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
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    #irv-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.85);
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
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    #irv-grid {
      flex: 1;
      margin-top: 10px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      overflow: auto;
      padding: 10px;
    }
    .irv-item {
      border: 3px solid transparent;
      cursor: pointer;
      position: relative;
      border-radius: 6px;
      overflow: hidden;
      aspect-ratio: 1;
      background: #f0f0f0;
      transition: all 0.2s;
    }
    .irv-item:hover {
      transform: scale(1.05);
    }
    .irv-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .irv-item.loading {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .irv-item.loading::before {
      content: "⏳";
      font-size: 24px;
    }
    .irv-item.selected {
      border-color: #0a84ff;
      box-shadow: 0 0 12px rgba(10, 132, 255, 0.5);
    }
    .irv-item.selected::after {
      content: "✓";
      position: absolute;
      top: 8px;
      right: 8px;
      background: #0a84ff;
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .irv-item.copy-mode {
      cursor: copy;
    }
    .irv-item.copy-mode:hover {
      border-color: #ff9500;
    }
    #irv-actions {
      margin-top: 10px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      padding: 10px;
      border-top: 1px solid #ddd;
    }
    #irv-actions button {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.2s;
    }
    #irv-actions button:hover {
      opacity: 0.8;
    }
    #irv-copy-json { background: #0a84ff; color: #fff; }
    #irv-copy-urls { background: #34c759; color: #fff; }
    #irv-copy-mode { background: #ff9500; color: #fff; }
    #irv-select-all { background: #5856d6; color: #fff; }
    #irv-clear { background: #ff3b30; color: #fff; }
    #irv-download { background: #af52de; color: #fff; }
    #irv-close {
      background: #666;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
    }
    #irv-status {
      margin-top: 8px;
      font-size: 13px;
      color: #666;
      padding: 0 10px;
    }
    .irv-copy-hint {
      background: #ff9500;
      color: #fff;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);

  /* ---------- BUTTON ---------- */
  const btn = document.createElement("div");
  btn.id = "irv-btn";
  btn.textContent = "📸 Image Grid";
  document.body.appendChild(btn);

  /* ---------- MODAL ---------- */
  const overlay = document.createElement("div");
  overlay.id = "irv-overlay";
  overlay.innerHTML = `
    <div id="irv-modal">
      <div id="irv-header">
        <strong>📸 Image Selector & Copy Tool</strong>
        <button id="irv-close">✕ Close</button>
      </div>
      <div id="irv-grid"></div>
      <div id="irv-actions">
        <button id="irv-select-all">☑️ Select All</button>
        <button id="irv-clear">❌ Clear</button>
        <button id="irv-copy-mode">🖼️ Copy Image Mode</button>
        <button id="irv-copy-json">📋 Copy JSON</button>
        <button id="irv-copy-urls">📝 Copy URLs</button>
        <button id="irv-download">⬇️ Download</button>
      </div>
      <div id="irv-status">0 images selected</div>
    </div>
  `;
  document.body.appendChild(overlay);

  let copyMode = false;

  /* ---------- COLLECT IMAGES ---------- */
  function collectImages() {
    const urls = new Set();

    document.querySelectorAll("img").forEach(img => {
      const src = img.currentSrc || img.src;
      if (src && !src.startsWith("data:")) urls.add(src);
    });

    document.querySelectorAll("*").forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (!bg || bg === "none") return;

      const matches = bg.match(/url\((['"]?)(.*?)\1\)/g);
      if (!matches) return;

      matches.forEach(m => {
        const url = m.replace(/url\(|\)|'|"/g, "");
        if (url && !url.startsWith("data:")) urls.add(url);
      });
    });

    return [...urls];
  }

  /* ---------- UPDATE STATUS ---------- */
  function updateStatus() {
    const count = document.querySelectorAll(".irv-item.selected").length;
    const statusEl = document.getElementById("irv-status");
    
    if (copyMode) {
      statusEl.innerHTML = `<span class="irv-copy-hint">🖼️ COPY MODE: Click any image to copy it to clipboard</span>`;
    } else {
      statusEl.textContent = `${count} image(s) selected`;
    }
  }

  /* ---------- LAZY LOAD IMAGE ---------- */
  function loadImage(item, url, priority = false) {
    const img = document.createElement("img");
    
    img.onload = () => {
      item.classList.remove("loading");
      item.innerHTML = "";
      item.appendChild(img);
    };
    
    img.onerror = () => {
      item.classList.remove("loading");
      item.innerHTML = "❌";
      item.style.display = "flex";
      item.style.alignItems = "center";
      item.style.justifyContent = "center";
    };

    if (!priority) {
      img.loading = "lazy";
    }
    
    img.src = url;
  }

  /* ---------- RENDER GRID ---------- */
  function renderGrid(urls) {
    const grid = document.getElementById("irv-grid");
    grid.innerHTML = "";

    urls.forEach(url => {
      const item = document.createElement("div");
      item.className = "irv-item loading";
      item.dataset.url = url;

      item.onclick = () => {
        if (copyMode) {
          copyImageToClipboard(url, item);
        } else {
          item.classList.toggle("selected");
          updateStatus();
        }
      };

      grid.appendChild(item);
      
      // Load with lazy loading initially
      loadImage(item, url, false);
    });

    updateStatus();
  }

  /* ---------- GET SELECTED URLS ---------- */
  function getSelectedUrls() {
    return [...document.querySelectorAll(".irv-item.selected")]
      .map(el => el.dataset.url);
  }

  /* ---------- COPY AS JSON ARRAY ---------- */
  function copyAsJson() {
    const selected = getSelectedUrls();
    if (!selected.length) {
      alert("⚠️ No images selected");
      return;
    }

    const output = JSON.stringify(selected, null, 2);
    navigator.clipboard.writeText(output).then(() => {
      alert(`✅ Copied ${selected.length} URLs as JSON array`);
    });
  }

  /* ---------- COPY AS LINE-BY-LINE URLS ---------- */
  function copyAsUrls() {
    const selected = getSelectedUrls();
    if (!selected.length) {
      alert("⚠️ No images selected");
      return;
    }

    const output = selected.join("\n");
    navigator.clipboard.writeText(output).then(() => {
      alert(`✅ Copied ${selected.length} URLs`);
    });
  }

  /* ---------- COPY SINGLE IMAGE TO CLIPBOARD ---------- */
  async function copyImageToClipboard(url, itemElement) {
    // Visual feedback
    const originalBorder = itemElement.style.border;
    itemElement.style.border = "3px solid #ff9500";

    try {
      // Method 1: Try direct blob copy (works for same-origin and CORS-enabled images)
      const response = await fetch(url);
      const blob = await response.blob();

      // Convert to PNG for clipboard
      if (blob.type === "image/png") {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        showCopySuccess(itemElement);
        return;
      }

      // Convert other formats to PNG
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (pngBlob) => {
        if (pngBlob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": pngBlob })
          ]);
          showCopySuccess(itemElement);
        }
      }, "image/png");

    } catch (err) {
      console.error("Copy failed:", err);
      
      // Fallback: Copy URL instead
      try {
        await navigator.clipboard.writeText(url);
        alert("⚠️ Could not copy image (CORS blocked).\n✅ Image URL copied instead!");
      } catch (e) {
        alert("❌ Copy failed. Try right-click → Copy Image");
      }
      
      itemElement.style.border = originalBorder;
    }
  }

  /* ---------- SHOW COPY SUCCESS ---------- */
  function showCopySuccess(itemElement) {
    const checkmark = document.createElement("div");
    checkmark.textContent = "✓";
    checkmark.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #34c759;
      color: white;
      font-size: 48px;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      animation: fadeOut 1s forwards;
    `;
    
    itemElement.appendChild(checkmark);
    
    setTimeout(() => {
      checkmark.remove();
      itemElement.style.border = "";
    }, 1000);
  }

  /* ---------- DOWNLOAD SELECTED IMAGES ---------- */
  async function downloadSelected() {
    const selected = getSelectedUrls();
    if (!selected.length) {
      alert("⚠️ No images selected");
      return;
    }

    for (let i = 0; i < selected.length; i++) {
      const url = selected[i];
      const filename = url.split("/").pop().split("?")[0] || `image_${i + 1}.jpg`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      await new Promise(r => setTimeout(r, 300));
    }

    alert(`✅ Started downloading ${selected.length} images`);
  }

  /* ---------- SELECT ALL ---------- */
  function selectAll() {
    document.querySelectorAll(".irv-item").forEach(item => {
      item.classList.add("selected");
    });
    updateStatus();
  }

  /* ---------- CLEAR SELECTION ---------- */
  function clearSelection() {
    document.querySelectorAll(".irv-item.selected").forEach(item => {
      item.classList.remove("selected");
    });
    updateStatus();
  }

  /* ---------- TOGGLE COPY MODE ---------- */
  function toggleCopyMode() {
    copyMode = !copyMode;
    const btn = document.getElementById("irv-copy-mode");
    const items = document.querySelectorAll(".irv-item");
    
    if (copyMode) {
      btn.style.background = "#ff3b30";
      btn.textContent = "❌ Exit Copy Mode";
      items.forEach(item => {
        item.classList.add("copy-mode");
        // Preload selected images
        if (item.classList.contains("loading")) {
          loadImage(item, item.dataset.url, true);
        }
      });
    } else {
      btn.style.background = "#ff9500";
      btn.textContent = "🖼️ Copy Image Mode";
      items.forEach(item => item.classList.remove("copy-mode"));
    }
    
    updateStatus();
  }

  /* ---------- EVENTS ---------- */
  btn.onclick = () => {
    const urls = collectImages();
    renderGrid(urls);
    overlay.style.display = "block";
    copyMode = false;
    updateStatus();
  };

  overlay.querySelector("#irv-close").onclick = () => {
    overlay.style.display = "none";
    copyMode = false;
  };

  overlay.querySelector("#irv-copy-json").onclick = copyAsJson;
  overlay.querySelector("#irv-copy-urls").onclick = copyAsUrls;
  overlay.querySelector("#irv-copy-mode").onclick = toggleCopyMode;
  overlay.querySelector("#irv-download").onclick = downloadSelected;
  overlay.querySelector("#irv-select-all").onclick = selectAll;
  overlay.querySelector("#irv-clear").onclick = clearSelection;

  // Add CSS animation
  const animStyle = document.createElement("style");
  animStyle.textContent = `
    @keyframes fadeOut {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
    }
  `;
  document.head.appendChild(animStyle);
})();
