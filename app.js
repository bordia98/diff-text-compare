/* =============================================
   Diff Compare — app.js
   ============================================= */

(function () {
  'use strict';

  // ── DOM References ──
  const $ = (id) => document.getElementById(id);

  const textOriginal   = $('text-original');
  const textModified   = $('text-modified');
  const originalMeta   = $('original-meta');
  const modifiedMeta   = $('modified-meta');

  const btnCompare     = $('btn-compare');
  const btnSwap        = $('btn-swap');
  const btnSample      = $('btn-sample');
  const btnClear       = $('btn-clear');
  const btnTheme       = $('btn-theme');
  const btnPasteOrig   = $('btn-paste-original');
  const btnPasteMod    = $('btn-paste-modified');
  const btnUploadOrig  = $('btn-upload-original');
  const btnUploadMod   = $('btn-upload-modified');
  const fileOriginal   = $('file-original');
  const fileModified   = $('file-modified');

  const diffModeSelect  = $('diff-mode-select');
  const ignoreWhitespace = $('ignore-whitespace');
  const ignoreCase      = $('ignore-case');

  const diffResult     = $('diff-result');
  const diffOrigBody   = $('diff-original-body');
  const diffModBody    = $('diff-modified-body');
  const diffUnifiedBody = $('diff-unified-body');
  const diffSplitView  = $('diff-split-view');
  const diffUnifiedView = $('diff-unified-view');

  const btnViewSplit   = $('btn-view-split');
  const btnViewUnified = $('btn-view-unified');
  const btnCopyDiff    = $('btn-copy-diff');

  const statAdded      = $('stat-added');
  const statRemoved    = $('stat-removed');
  const statUnchanged  = $('stat-unchanged');
  const statsRow       = $('stats-row');
  const statSimilarity = $('stat-similarity');
  const statTotalLines = $('stat-total-lines');
  const statChanges    = $('stat-changes');
  const statDiffMode   = $('stat-diff-mode');
  const statusBadge    = $('status-badge');
  const toastEl        = $('toast');

  // ── State ──
  let lastDiffResult = null;

  // ── Theme ──
  function initTheme() {
    const saved = localStorage.getItem('diff-theme');
    const pref  = saved || 'light';
    document.documentElement.setAttribute('data-theme', pref);
  }
  initTheme();

  btnTheme.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('diff-theme', next);
  });

  // ── Toast ──
  let toastTimer = null;
  function showToast(msg, duration = 2200) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
  }

  // ── Meta Updates ──
  function updateMeta(textarea, metaEl) {
    const val = textarea.value;
    const lines = val ? val.split('\n').length : 0;
    const chars = val.length;
    metaEl.textContent = `${lines} line${lines !== 1 ? 's' : ''} · ${chars.toLocaleString()} chars`;
  }

  textOriginal.addEventListener('input', () => updateMeta(textOriginal, originalMeta));
  textModified.addEventListener('input', () => updateMeta(textModified, modifiedMeta));

  // ── Paste buttons ──
  async function pasteInto(textarea, metaEl) {
    try {
      const text = await navigator.clipboard.readText();
      textarea.value = text;
      updateMeta(textarea, metaEl);
      showToast('📋 Pasted from clipboard');
    } catch {
      showToast('⚠️ Clipboard access denied');
    }
  }
  btnPasteOrig.addEventListener('click', () => pasteInto(textOriginal, originalMeta));
  btnPasteMod.addEventListener('click', () => pasteInto(textModified, modifiedMeta));

  // ── File upload ──
  function loadFile(input, textarea, metaEl) {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        textarea.value = ev.target.result;
        updateMeta(textarea, metaEl);
        showToast(`📄 Loaded ${file.name}`);
      };
      reader.readAsText(file);
      input.value = '';
    });
  }
  loadFile(fileOriginal, textOriginal, originalMeta);
  loadFile(fileModified, textModified, modifiedMeta);

  btnUploadOrig.addEventListener('click', () => fileOriginal.click());
  btnUploadMod.addEventListener('click', () => fileModified.click());

  // ── Swap ──
  btnSwap.addEventListener('click', () => {
    const tmp = textOriginal.value;
    textOriginal.value = textModified.value;
    textModified.value = tmp;
    updateMeta(textOriginal, originalMeta);
    updateMeta(textModified, modifiedMeta);
    showToast('🔄 Texts swapped');
  });

  // ── Clear ──
  btnClear.addEventListener('click', () => {
    textOriginal.value = '';
    textModified.value = '';
    updateMeta(textOriginal, originalMeta);
    updateMeta(textModified, modifiedMeta);
    diffResult.hidden = true;
    statsRow.hidden = true;
    statusBadge.textContent = 'Ready';
    lastDiffResult = null;
    showToast('🗑️ Cleared');
  });

  // ── Sample ──
  const SAMPLE_ORIGINAL = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob", "Charlie"];

for (let i = 0; i < users.length; i++) {
  greet(users[i]);
}

// TODO: Add error handling
console.log("Done processing users");`;

  const SAMPLE_MODIFIED = `function greet(name, greeting = "Hello") {
  if (!name) throw new Error("Name is required");
  console.log(\`\${greeting}, \${name}!\`);
  return true;
}

const users = ["Alice", "Bob", "Charlie", "Diana"];

for (const user of users) {
  greet(user);
}

// Added error handling
try {
  greet(null);
} catch (err) {
  console.error("Error:", err.message);
}

console.log("Done processing users");`;

  btnSample.addEventListener('click', () => {
    textOriginal.value = SAMPLE_ORIGINAL;
    textModified.value = SAMPLE_MODIFIED;
    updateMeta(textOriginal, originalMeta);
    updateMeta(textModified, modifiedMeta);
    showToast('📝 Sample loaded');
  });

  // ══════════════════════════════════════════════
  //  DIFF ALGORITHM (Myers-like LCS approach)
  // ══════════════════════════════════════════════

  // Longest Common Subsequence to produce diff ops
  function lcs(a, b) {
    const m = a.length;
    const n = b.length;

    // Optimization for large inputs — use only 2 rows
    let prev = new Array(n + 1).fill(0);
    let curr = new Array(n + 1).fill(0);

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          curr[j] = prev[j - 1] + 1;
        } else {
          curr[j] = Math.max(prev[j], curr[j - 1]);
        }
      }
      [prev, curr] = [curr, new Array(n + 1).fill(0)];
    }

    // Backtrack to get actual LCS — need full table for backtrack
    const table = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          table[i][j] = table[i - 1][j - 1] + 1;
        } else {
          table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]);
        }
      }
    }

    // Generate diff operations
    const ops = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        ops.unshift({ type: 'equal', oldIdx: i - 1, newIdx: j - 1 });
        i--; j--;
      } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
        ops.unshift({ type: 'add', newIdx: j - 1 });
        j--;
      } else {
        ops.unshift({ type: 'remove', oldIdx: i - 1 });
        i--;
      }
    }
    return ops;
  }

  // Normalize text based on options
  function normalize(text) {
    let result = text;
    if (ignoreCase.checked) result = result.toLowerCase();
    if (ignoreWhitespace.checked) result = result.replace(/\s+/g, ' ').trim();
    return result;
  }

  // Split text into tokens based on mode
  function tokenize(text, mode) {
    if (mode === 'char') return text.split('');
    if (mode === 'word') return text.split(/(\s+)/);
    return text.split('\n');
  }

  // Find inline word-level diffs within two lines
  function inlineDiff(oldLine, newLine) {
    const oldWords = oldLine.split(/(\s+)/);
    const newWords = newLine.split(/(\s+)/);

    const normalizeWord = (w) => {
      let r = w;
      if (ignoreCase.checked) r = r.toLowerCase();
      return r;
    };

    const normalizedOld = oldWords.map(normalizeWord);
    const normalizedNew = newWords.map(normalizeWord);

    const ops = lcs(normalizedOld, normalizedNew);

    let oldHtml = '';
    let newHtml = '';

    for (const op of ops) {
      if (op.type === 'equal') {
        oldHtml += escapeHtml(oldWords[op.oldIdx]);
        newHtml += escapeHtml(newWords[op.newIdx]);
      } else if (op.type === 'remove') {
        oldHtml += `<span class="diff-hi-remove">${escapeHtml(oldWords[op.oldIdx])}</span>`;
      } else if (op.type === 'add') {
        newHtml += `<span class="diff-hi-add">${escapeHtml(newWords[op.newIdx])}</span>`;
      }
    }

    return { oldHtml, newHtml };
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Main Compare ──
  function runCompare() {
    const orig = textOriginal.value;
    const mod  = textModified.value;

    if (!orig && !mod) {
      showToast('⚠️ Please enter text in both panels');
      return;
    }

    const mode = diffModeSelect.value;

    const origLines = orig.split('\n');
    const modLines  = mod.split('\n');

    // For line-by-line diff
    const normalizedOrig = origLines.map(normalize);
    const normalizedMod  = modLines.map(normalize);

    let ops;

    if (mode === 'line') {
      ops = lcs(normalizedOrig, normalizedMod);
    } else {
      // For word/char mode, we still do line-by-line to maintain structure
      // but show word/char-level inline diffs
      ops = lcs(normalizedOrig, normalizedMod);
    }

    // Count stats
    let added = 0, removed = 0, unchanged = 0;
    for (const op of ops) {
      if (op.type === 'add') added++;
      else if (op.type === 'remove') removed++;
      else unchanged++;
    }

    // Store result
    lastDiffResult = { ops, origLines, modLines, mode, added, removed, unchanged };

    // Update stats
    statAdded.innerHTML = `<span class="diff-stat__dot diff-stat__dot--added"></span> ${added} added`;
    statRemoved.innerHTML = `<span class="diff-stat__dot diff-stat__dot--removed"></span> ${removed} removed`;
    statUnchanged.innerHTML = `<span class="diff-stat__dot diff-stat__dot--unchanged"></span> ${unchanged} unchanged`;

    const total = origLines.length + modLines.length;
    const similarity = total > 0 ? ((unchanged * 2 / total) * 100).toFixed(1) : 100;

    statSimilarity.textContent = `${similarity}%`;
    statTotalLines.textContent = Math.max(origLines.length, modLines.length);
    statChanges.textContent = added + removed;
    statDiffMode.textContent = mode === 'line' ? 'Line' : mode === 'word' ? 'Word' : 'Char';

    // Render diff
    renderDiff();

    // Show results
    diffResult.hidden = false;
    statsRow.hidden = false;
    statusBadge.textContent = 'Compared';

    // Scroll to result
    diffResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Render Diff ──
  function renderDiff() {
    if (!lastDiffResult) return;

    const { ops, origLines, modLines, mode } = lastDiffResult;

    // Split view
    renderSplitView(ops, origLines, modLines, mode);
    // Unified view
    renderUnifiedView(ops, origLines, modLines, mode);
  }

  function renderSplitView(ops, origLines, modLines, mode) {
    let origHtml = '';
    let modHtml = '';
    let origLineNum = 0;
    let modLineNum = 0;

    for (const op of ops) {
      if (op.type === 'equal') {
        origLineNum++;
        modLineNum++;
        const text = escapeHtml(origLines[op.oldIdx]);
        origHtml += makeLine(origLineNum, ' ', text, '');
        modHtml  += makeLine(modLineNum, ' ', text, '');
      } else if (op.type === 'remove') {
        origLineNum++;
        // Check if next op is an add — then do inline diff
        const pairIdx = findPair(ops, op, origLines, modLines);
        if (pairIdx !== null && (mode === 'word' || mode === 'char')) {
          const { oldHtml, newHtml } = inlineDiff(origLines[op.oldIdx], modLines[pairIdx]);
          origHtml += makeLine(origLineNum, '−', oldHtml, 'removed');
        } else {
          origHtml += makeLine(origLineNum, '−', escapeHtml(origLines[op.oldIdx]), 'removed');
        }
        modHtml += makeLine('', ' ', '', 'empty');
      } else if (op.type === 'add') {
        modLineNum++;
        const prevOp = findPrevRemove(ops, op, origLines, modLines);
        if (prevOp !== null && (mode === 'word' || mode === 'char')) {
          const { oldHtml, newHtml } = inlineDiff(origLines[prevOp], modLines[op.newIdx]);
          modHtml += makeLine(modLineNum, '+', newHtml, 'added');
        } else {
          modHtml += makeLine(modLineNum, '+', escapeHtml(modLines[op.newIdx]), 'added');
        }
        origHtml += makeLine('', ' ', '', 'empty');
      }
    }

    diffOrigBody.innerHTML = origHtml;
    diffModBody.innerHTML = modHtml;

    // Sync scroll
    diffOrigBody.onscroll = () => {
      diffModBody.scrollTop = diffOrigBody.scrollTop;
      diffModBody.scrollLeft = diffOrigBody.scrollLeft;
    };
    diffModBody.onscroll = () => {
      diffOrigBody.scrollTop = diffModBody.scrollTop;
      diffOrigBody.scrollLeft = diffModBody.scrollLeft;
    };
  }

  function renderUnifiedView(ops, origLines, modLines, mode) {
    let html = '';
    let origLineNum = 0;
    let modLineNum = 0;

    for (const op of ops) {
      if (op.type === 'equal') {
        origLineNum++;
        modLineNum++;
        html += makeUnifiedLine(origLineNum, modLineNum, ' ', escapeHtml(origLines[op.oldIdx]), '');
      } else if (op.type === 'remove') {
        origLineNum++;
        html += makeUnifiedLine(origLineNum, '', '−', escapeHtml(origLines[op.oldIdx]), 'removed');
      } else if (op.type === 'add') {
        modLineNum++;
        html += makeUnifiedLine('', modLineNum, '+', escapeHtml(modLines[op.newIdx]), 'added');
      }
    }

    diffUnifiedBody.innerHTML = html;
  }

  function findPair(ops, removeOp, origLines, modLines) {
    const idx = ops.indexOf(removeOp);
    for (let i = idx + 1; i < ops.length && i <= idx + 3; i++) {
      if (ops[i].type === 'add') return ops[i].newIdx;
      if (ops[i].type === 'equal') break;
    }
    return null;
  }

  function findPrevRemove(ops, addOp, origLines, modLines) {
    const idx = ops.indexOf(addOp);
    for (let i = idx - 1; i >= 0 && i >= idx - 3; i--) {
      if (ops[i].type === 'remove') return ops[i].oldIdx;
      if (ops[i].type === 'equal') break;
    }
    return null;
  }

  function makeLine(num, prefix, content, type) {
    const cls = type ? ` diff-line--${type}` : '';
    return `<div class="diff-line${cls}">` +
      `<span class="diff-line__num">${num}</span>` +
      `<span class="diff-line__prefix">${prefix}</span>` +
      `<span class="diff-line__content">${content || '&nbsp;'}</span>` +
      `</div>`;
  }

  function makeUnifiedLine(origNum, modNum, prefix, content, type) {
    const cls = type ? ` diff-line--${type}` : '';
    return `<div class="diff-line${cls}">` +
      `<span class="diff-line__num">${origNum}</span>` +
      `<span class="diff-line__num">${modNum}</span>` +
      `<span class="diff-line__prefix">${prefix}</span>` +
      `<span class="diff-line__content">${content || '&nbsp;'}</span>` +
      `</div>`;
  }

  // ── View Toggle ──
  btnViewSplit.addEventListener('click', () => {
    btnViewSplit.classList.add('active');
    btnViewSplit.setAttribute('aria-checked', 'true');
    btnViewUnified.classList.remove('active');
    btnViewUnified.setAttribute('aria-checked', 'false');
    diffSplitView.hidden = false;
    diffUnifiedView.hidden = true;
  });

  btnViewUnified.addEventListener('click', () => {
    btnViewUnified.classList.add('active');
    btnViewUnified.setAttribute('aria-checked', 'true');
    btnViewSplit.classList.remove('active');
    btnViewSplit.setAttribute('aria-checked', 'false');
    diffUnifiedView.hidden = false;
    diffSplitView.hidden = true;
  });

  // ── Copy Diff ──
  btnCopyDiff.addEventListener('click', async () => {
    if (!lastDiffResult) return;

    const { ops, origLines, modLines } = lastDiffResult;
    let text = '';

    for (const op of ops) {
      if (op.type === 'equal') {
        text += `  ${origLines[op.oldIdx]}\n`;
      } else if (op.type === 'remove') {
        text += `- ${origLines[op.oldIdx]}\n`;
      } else if (op.type === 'add') {
        text += `+ ${modLines[op.newIdx]}\n`;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast('📋 Diff copied to clipboard');
    } catch {
      showToast('⚠️ Failed to copy');
    }
  });

  // ── Compare Button ──
  btnCompare.addEventListener('click', runCompare);

  // ── Keyboard shortcuts ──
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCompare();
    }
  });

  // ── Drag & Drop ──
  function setupDragDrop(textarea, metaEl) {
    textarea.addEventListener('dragover', (e) => {
      e.preventDefault();
      textarea.style.borderColor = 'var(--clr-purple)';
    });
    textarea.addEventListener('dragleave', () => {
      textarea.style.borderColor = '';
    });
    textarea.addEventListener('drop', (e) => {
      e.preventDefault();
      textarea.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          textarea.value = ev.target.result;
          updateMeta(textarea, metaEl);
          showToast(`📄 Loaded ${file.name}`);
        };
        reader.readAsText(file);
      }
    });
  }
  setupDragDrop(textOriginal, originalMeta);
  setupDragDrop(textModified, modifiedMeta);

})();
