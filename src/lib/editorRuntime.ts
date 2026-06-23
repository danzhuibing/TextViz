// 编辑器运行时脚本：注入到预览 iframe 中，提供选中、拖拽、缩放、删除能力。
// 通过 postMessage 与父窗口通信。

export const EDITOR_RUNTIME_SCRIPT = `
(function() {
  if (window.__textvizEditor) return;
  window.__textvizEditor = true;

  var selected = null;
  var mode = null; // 'drag' | 'resize'
  var startX = 0, startY = 0;
  var startLeft = 0, startTop = 0, startWidth = 0, startHeight = 0;
  var dragMoved = false;

  // 选中高亮 overlay
  var overlay = document.createElement('div');
  overlay.id = '__tv-overlay';
  overlay.style.cssText = 'position:absolute;border:2px solid #7c3aed;pointer-events:none;z-index:999998;display:none;box-shadow:0 0 0 9999px rgba(124,58,237,0.08);';

  // 右下角缩放手柄
  var handleSE = document.createElement('div');
  handleSE.id = '__tv-handle-se';
  handleSE.style.cssText = 'position:absolute;width:14px;height:14px;background:#7c3aed;border:2px solid #fff;border-radius:50%;cursor:nwse-resize;pointer-events:auto;z-index:999999;display:none;';

  // 左上角删除按钮
  var delBtn = document.createElement('div');
  delBtn.id = '__tv-del';
  delBtn.innerHTML = '\\u00d7';
  delBtn.style.cssText = 'position:absolute;width:22px;height:22px;background:#ef4444;color:#fff;border-radius:50%;cursor:pointer;pointer-events:auto;z-index:999999;display:none;font-size:16px;line-height:20px;text-align:center;font-family:sans-serif;font-weight:bold;user-select:none;';

  // 提示条
  var tagLabel = document.createElement('div');
  tagLabel.id = '__tv-tag';
  tagLabel.style.cssText = 'position:absolute;background:#7c3aed;color:#fff;font-size:11px;padding:2px 6px;border-radius:4px;pointer-events:none;z-index:999999;display:none;font-family:monospace;white-space:nowrap;';

  function ensureContainer() {
    var c = document.getElementById('__tv-container');
    if (!c) {
      c = document.createElement('div');
      c.id = '__tv-container';
      c.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:999990;pointer-events:none;';
      document.body.appendChild(c);
      c.appendChild(overlay);
      c.appendChild(handleSE);
      c.appendChild(delBtn);
      c.appendChild(tagLabel);
    }
  }

  function positionOverlay() {
    if (!selected) return;
    var rect = selected.getBoundingClientRect();
    overlay.style.display = 'block';
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    handleSE.style.display = 'block';
    handleSE.style.left = (rect.left + rect.width - 7) + 'px';
    handleSE.style.top = (rect.top + rect.height - 7) + 'px';
    delBtn.style.display = 'block';
    delBtn.style.left = (rect.left - 11) + 'px';
    delBtn.style.top = (rect.top - 11) + 'px';
    tagLabel.style.display = 'block';
    tagLabel.style.left = rect.left + 'px';
    tagLabel.style.top = Math.max(0, rect.top - 20) + 'px';
    var tag = selected.tagName.toLowerCase();
    if (selected.id) tag += '#' + selected.id;
    if (selected.className && typeof selected.className === 'string') {
      var cls = selected.className.trim().split(/\\s+/).slice(0, 2).join('.');
      if (cls) tag += '.' + cls;
    }
    tagLabel.textContent = tag;
  }

  function isEditorEl(el) {
    return el === overlay || el === handleSE || el === delBtn || el === tagLabel || (el && el.id === '__tv-container');
  }

  function getRelevantStyles(el) {
    var cs = getComputedStyle(el);
    return {
      position: cs.position,
      left: cs.left,
      top: cs.top,
      width: cs.width,
      height: cs.height,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      textAlign: cs.textAlign,
      margin: cs.margin,
      padding: cs.padding,
      border: cs.border,
      borderRadius: cs.borderRadius,
      display: cs.display,
      opacity: cs.opacity,
      lineHeight: cs.lineHeight,
      fontFamily: cs.fontFamily
    };
  }

  function isSVGElement(el) {
    return el && (el.tagName === 'svg' || (el.ownerSVGElement !== undefined) || el.tagName.toLowerCase() === 'svg');
  }

  function getSelectionId(el) {
    if (!el.dataset.tvId) {
      el.dataset.tvId = 'tv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    }
    return el.dataset.tvId;
  }

  function buildSelectedPayload(el) {
    var rect = el.getBoundingClientRect();
    return {
      selectionId: getSelectionId(el),
      tagName: el.tagName.toLowerCase(),
      textContent: el.textContent || '',
      innerHTML: el.innerHTML,
      outerHTML: el.outerHTML,
      isSVG: el.tagName.toLowerCase() === 'svg',
      styles: getRelevantStyles(el),
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    };
  }

  function selectElement(el) {
    if (isEditorEl(el)) return;
    if (!el || el === document.body || el === document.documentElement) return;
    selected = el;
    ensureContainer();
    positionOverlay();
    sendToParent('selected', buildSelectedPayload(el));
  }

  function deselect() {
    selected = null;
    overlay.style.display = 'none';
    handleSE.style.display = 'none';
    delBtn.style.display = 'none';
    tagLabel.style.display = 'none';
    sendToParent('deselected', {});
  }

  function sendToParent(type, payload) {
    window.parent.postMessage({ source: 'textviz-editor', type: type, payload: payload }, '*');
  }

  function syncHtmlToParent() {
    sendToParent('changed', { html: document.documentElement.outerHTML });
  }

  // 点击选中
  document.addEventListener('click', function(e) {
    if (isEditorEl(e.target)) {
      if (e.target === delBtn) {
        if (selected) {
          selected.remove();
          deselect();
          syncHtmlToParent();
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    selectElement(e.target);
  }, true);

  // 滚动/缩放时重新定位 overlay
  document.addEventListener('scroll', positionOverlay, true);
  window.addEventListener('resize', positionOverlay);

  // 鼠标按下：开始拖拽或缩放
  document.addEventListener('mousedown', function(e) {
    if (isEditorEl(e.target)) {
      if (e.target === handleSE && selected) {
        mode = 'resize';
        e.preventDefault();
        e.stopPropagation();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = selected.getBoundingClientRect().width;
        startHeight = selected.getBoundingClientRect().height;
      }
      return;
    }
    if (selected && e.target === selected && e.button === 0) {
      mode = 'drag';
      dragMoved = false;
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      var cs = getComputedStyle(selected);
      startLeft = parseFloat(cs.left) || 0;
      startTop = parseFloat(cs.top) || 0;
      // 若不是 absolute/fixed/relative，设为 relative 以便移动
      if (cs.position === 'static' || cs.position === '') {
        selected.style.position = 'relative';
      }
    }
  }, true);

  document.addEventListener('mousemove', function(e) {
    if (!mode || !selected) return;
    e.preventDefault();
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (mode === 'drag') {
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragMoved = true;
      selected.style.left = (startLeft + dx) + 'px';
      selected.style.top = (startTop + dy) + 'px';
      positionOverlay();
    } else if (mode === 'resize') {
      var newW = Math.max(10, startWidth + dx);
      var newH = Math.max(10, startHeight + dy);
      selected.style.width = newW + 'px';
      selected.style.height = newH + 'px';
      positionOverlay();
    }
  }, true);

  document.addEventListener('mouseup', function() {
    if (mode) {
      mode = null;
      if (selected) {
        sendToParent('selected', buildSelectedPayload(selected));
        syncHtmlToParent();
      }
    }
  }, true);

  // 键盘：Delete 删除，Escape 取消选中
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selected && document.activeElement === document.body) {
        e.preventDefault();
        selected.remove();
        deselect();
        syncHtmlToParent();
      }
    } else if (e.key === 'Escape') {
      deselect();
    }
  }, true);

  // 监听父窗口消息
  window.addEventListener('message', function(e) {
    var msg = e.data;
    if (!msg || msg.source !== 'textviz-parent') return;
    if (msg.type === 'apply-style' && selected) {
      var patch = msg.payload.styles;
      for (var key in patch) {
        if (Object.prototype.hasOwnProperty.call(patch, key)) {
          selected.style[key] = patch[key];
        }
      }
      positionOverlay();
      syncHtmlToParent();
    } else if (msg.type === 'apply-text' && selected) {
      selected.textContent = msg.payload.text;
      positionOverlay();
      syncHtmlToParent();
    } else if (msg.type === 'apply-html' && selected) {
      selected.innerHTML = msg.payload.html;
      positionOverlay();
      syncHtmlToParent();
    } else if (msg.type === 'apply-attribute' && selected) {
      selected.setAttribute(msg.payload.name, msg.payload.value);
      positionOverlay();
      syncHtmlToParent();
    } else if (msg.type === 'delete' && selected) {
      selected.remove();
      deselect();
      syncHtmlToParent();
    } else if (msg.type === 'deselect') {
      deselect();
    } else if (msg.type === 'replace-with-image' && selected) {
      var img = document.createElement('img');
      img.src = msg.payload.dataUrl;
      img.style.maxWidth = '100%';
      if (selected.style.width) img.style.width = selected.style.width;
      if (selected.style.height) img.style.height = selected.style.height;
      if (selected.getAttribute('width')) img.style.width = selected.getAttribute('width') + 'px';
      if (selected.getAttribute('height')) img.style.height = selected.getAttribute('height') + 'px';
      selected.replaceWith(img);
      selected = img;
      ensureContainer();
      positionOverlay();
      sendToParent('selected', buildSelectedPayload(img));
      syncHtmlToParent();
    }
  });

  sendToParent('ready', {});
})();
`;
