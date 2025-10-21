/* topbar.js — shared navigation bar for Civ 7 Tracker */
(function(){
  const CSS_ID = "c7-topbar-style";
  if (!document.getElementById(CSS_ID)){
    const css = document.createElement("style");
    css.id = CSS_ID;
    css.textContent = `
    :root{ --bg:#0f1216; --panel:#171b21; --text:#e6edf3; --muted:#9aa4b2; --border:#242a33; --accent:#4aa3ff; }
    #c7-topbar{background:var(--bg); color:var(--text); font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial;}
    #c7-topbar .wrap{max-width:1200px;margin:0 auto;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;border-bottom:1px solid #141821;}
    #c7-topbar .title{font-size:18px;font-weight:800}
    #c7-topbar nav{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    #c7-topbar nav a{margin-right:0;text-decoration:none;border:1px solid var(--border);padding:6px 10px;border-radius:8px;color:#cbd5e1}
    #c7-topbar nav a.active{border-color:#3b82f6;color:#e6edf3}
    #c7-topbar nav a:hover{border-color:#334155}
    #c7-topbar .row{display:flex;gap:8px;align-items:center}
    #c7-topbar button{background:transparent;border:1px solid var(--border);color:#cbd5e1;padding:6px 10px;border-radius:8px;cursor:pointer}
    #c7-topbar button:hover{border-color:#334155}
    #c7-topbar input[type=file]{display:none}
    `;
    document.head.appendChild(css);
  }

  const html = `
  <div id="c7-topbar" role="banner">
    <div class="wrap">
      <div class="title">Civilization 7 Tracker</div>
      <nav role="navigation" aria-label="Primary">
        <a href="index.html">Home</a>
        <a href="world_wonders.html">World Wonders</a>
        <a href="natural_wonders.html">Natural Wonders</a>
        <a href="independent_peoples.html">Independent Peoples</a>
        <a href="results.html">Results</a>
        <a href="data_editor.html">Data Editor</a>
      </nav>
      <div class="row">
        <button id="c7-export" title="Export data as JSON">Export</button>
        <button id="c7-import" title="Import data from JSON">Import</button>
        <input id="c7-import-file" type="file" accept="application/json">
      </div>
    </div>
  </div>`;

  // mount
  const mount = document.getElementById("topbar-root");
  if (mount) mount.innerHTML = html;
  else document.body.insertAdjacentHTML("afterbegin", html);

  // mark active link
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("#c7-topbar nav a").forEach(a=>{
    const href = (a.getAttribute("href")||"").toLowerCase();
    if (href === current) a.classList.add("active");
  });

  // export/import
  const exp = document.getElementById("c7-export");
  const imp = document.getElementById("c7-import");
  const file = document.getElementById("c7-import-file");

  function download(filename, text){
    const blob = new Blob([text], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  const LS_KEY = "civ7_data_store_v3";

  exp?.addEventListener("click", ()=>{
    if (window.Store && Store.export){
      Store.export();
    } else {
      const text = localStorage.getItem(LS_KEY) || "{}";
      download("civ7-data-store.json", text);
    }
  });

  imp?.addEventListener("click", ()=> file?.click());
  file?.addEventListener("change", async (e)=>{
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (window.Store && Store.importFromFile){
      await Store.importFromFile(f);
    } else {
      const text = await f.text();
      localStorage.setItem(LS_KEY, text);
    }
    e.target.value = "";
    alert("Import complete.");
  });

})();