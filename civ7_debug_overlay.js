
/*! civ7_debug_overlay.js — Floating UI using Civ7Debug (v1) */
(function(){
  if (window.__CIV7_DEBUG_OVERLAY) return;
  window.__CIV7_DEBUG_OVERLAY = true;
  function el(t,c,h){ const n=document.createElement(t); if(c) n.className=c; if(h!=null) n.innerHTML=h; return n; }
  const style = el('style','',`
  .c7dbg{position:fixed;top:12px;right:12px;width:440px;z-index:999999;font:12px/1.5 ui-monospace,monospace;color:#e6edf3}
  .c7card{background:#171b21;border:1px solid #242a33;border-radius:12px;padding:10px;box-shadow:0 6px 24px rgba(0,0,0,.45)}
  .c7row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .c7btn{background:#4aa3ff;color:#001329;border:0;padding:6px 10px;border-radius:8px;font-weight:800;cursor:pointer}
  .c7btn.ghost{background:transparent;color:#9aa4b2;border:1px solid #242a33}
  .c7pre{background:#0b0f14;border:1px solid #242a33;border-radius:8px;padding:8px;max-height:300px;overflow:auto;white-space:pre-wrap}
  .c7pill{display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border-radius:999px;border:1px solid #242a33}
  .ok{background:rgba(23,201,100,.12);color:#17c964;border-color:rgba(23,201,100,.35)}
  .err{background:rgba(243,18,96,.12);color:#f31260;border-color:rgba(243,18,96,.35)}
  .warn{background:rgba(245,165,36,.12);color:#f5a524;border-color:rgba(245,165,36,.35)}
  `);
  document.head.appendChild(style);
  const root = el('div','c7dbg'); const card = el('div','c7card'); const row = el('div','c7row');
  const runBtn = el('button','c7btn','Run Debug'); const exportBtn = el('button','c7btn','Export JSON'); const closeBtn = el('button','c7btn ghost','Close');
  const pill = el('span','c7pill warn','status: idle');
  row.append(runBtn,exportBtn,closeBtn,pill);
  const preSum = el('pre','c7pre','—'); const preJson = el('pre','c7pre','');
  card.append(row, el('div','', '<strong>Summary</strong>'), preSum, el('div','', '<strong>Full Report</strong>'), preJson);
  root.appendChild(card); document.body.appendChild(root);
  function setStatus(kind,t){ pill.className = 'c7pill ' + (kind||'warn'); pill.textContent = 'status: ' + (t||''); }
  function ensureCore(){ if(!window.Civ7Debug){ throw new Error('civ7_debug_core.js not loaded'); } return window.Civ7Debug; }
  runBtn.onclick = function(){
    try{ setStatus('warn','running…'); const D=ensureCore(); const r=D.run(); preSum.textContent=r.summary||''; preJson.textContent=JSON.stringify(r,null,2); setStatus('ok','done'); }
    catch(e){ preJson.textContent=String(e); setStatus('err','failed'); }
  };
  exportBtn.onclick = function(){
    try{ const D=ensureCore(); const r = preJson.textContent? JSON.parse(preJson.textContent) : D.run(); D.export(r); }catch(e){ alert('Export failed: '+e); }
  };
  closeBtn.onclick = function(){ root.remove(); style.remove(); window.__CIV7_DEBUG_OVERLAY=false; };
  // auto-run once
  setTimeout(()=>runBtn.click(), 200);
})();
