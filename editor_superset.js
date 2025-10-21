/* editor_superset_v3.js
   - Upsert on Add (if name exists, updates that entry instead of duplicating)
   - Proper Edit-in-form: clicking Edit prefills the Add form, button becomes Save, Cancel available
   - Delete per item remains
   - Clear-Category & Delete-ALL (with confirm & double-confirm) remain
   - Fires a global 'c7-data-updated' event after any change so other UI (e.g., dropdowns) can refresh live
   - Also calls optional window.c7RebuildDropdowns?.() if present (no-op otherwise)
   - No layout changes elsewhere
*/
(function(){
  const LS_KEY = "c7_store";
  const SCHEMA_VERSION = 2;

  const $ = (sel, root) => (root||document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root||document).querySelectorAll(sel));
  const byId = id => document.getElementById(id);
  const clone = o => JSON.parse(JSON.stringify(o));

  function merge(base, extra){
    if (Array.isArray(base) && Array.isArray(extra)) return extra.slice();
    if (base && typeof base==='object' && extra && typeof extra==='object'){
      const out = {...base};
      for (const k of Object.keys(extra)) out[k] = merge(base[k], extra[k]);
      return out;
    }
    return (extra!==undefined)? extra : base;
  }

  const DEFAULT = {
    schemaVersion: SCHEMA_VERSION,
    editor: { data: { leaders:[], civs:[], mementos:[], worldWonders:[], naturalWonders:[], cityStates:[] } },
    civs: { Antiquity:[], Exploration:[], Modern:[] },
    civMeta: {}, leaders:{}, mementos:{},
    current: { players: { steve:{leaders:[],mementos:[],civs:[]}, tiny:{leaders:[],mementos:[],civs:[]} },
               karma: { wonders:{steve:0,tiny:0}, natural:{steve:0,tiny:0}, independents:{steve:0,tiny:0} } }
  };

  function load(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return clone(DEFAULT);
      const parsed = JSON.parse(raw);
      const merged = merge(clone(DEFAULT), parsed);
      if (!merged.schemaVersion || merged.schemaVersion < SCHEMA_VERSION){
        migrate(merged);
        merged.schemaVersion = SCHEMA_VERSION;
        localStorage.setItem(LS_KEY, JSON.stringify(merged));
      }
      const ed = merged.editor = merged.editor || {data:{}};
      ed.data = ed.data || {};
      ["leaders","civs","mementos","worldWonders","naturalWonders","cityStates"].forEach(k=>{
        ed.data[k] = Array.isArray(ed.data[k]) ? ed.data[k] : [];
      });
      return merged;
    }catch(e){ console.warn(e); return clone(DEFAULT); }
  }
  function save(s){ try{ localStorage.setItem(LS_KEY, JSON.stringify(s)); }catch{} }
  function emitUpdated(types){
    try{
      window.dispatchEvent(new CustomEvent("c7-data-updated",{detail:{types: types||["all"]}}));
      if (typeof window.c7RebuildDropdowns === "function"){ window.c7RebuildDropdowns(); }
    }catch{}
  }

  function migrate(s){
    if (s.civs && s.editor && s.editor.data){
      const hasEditorCivs = (s.editor.data.civs||[]).length>0;
      if (!hasEditorCivs){
        ["Antiquity","Exploration","Modern"].forEach(age=>{
          (s.civs[age]||[]).forEach(name=>{
            if (!s.editor.data.civs.find(c=>c.name===name)){
              s.editor.data.civs.push({name, ages:[age], description: (s.civMeta?.[name]?.desc)||""});
            }
          });
        });
      }
    }
    if (s.leaders && (s.editor.data.leaders||[]).length===0){
      Object.entries(s.leaders).forEach(([name,obj])=>{
        s.editor.data.leaders.push({name, description: obj?.desc||"", image: obj?.image||""});
      });
    }
    if (s.mementos && (s.editor.data.mementos||[]).length===0){
      Object.entries(s.mementos).forEach(([name,obj])=>{
        s.editor.data.mementos.push({name, effect: obj?.desc||"", image: obj?.image||""});
      });
    }
    (s.editor.data.cityStates||[]).forEach(cs=>{
      cs.appearedByAge = cs.appearedByAge || {Antiquity:0,Exploration:0,Modern:0};
      cs.appearedByType = cs.appearedByType || {Military:0,Economic:0,Culture:0,Diplomatic:0,Science:0,Expansionist:0};
      cs.homeCount = cs.homeCount||0; cs.distantCount=cs.distantCount||0; cs.hostileCount=cs.hostileCount||0;
    });
  }

  let store = window.store || load(); window.store = store; save(store);

  // ---------- UI helpers ----------
  function imgInput(label, id){
    return `<div class="row" style="gap:8px;align-items:center">
      <label style="width:120px">${label}</label>
      <input type="file" id="${id}" accept="image/*" />
    </div>`;
  }
  function textInput(label, id, ph="", multiline=false){
    if (multiline) return `<div class="row" style="gap:8px;align-items:flex-start">
      <label style="width:120px">${label}</label>
      <textarea id="${id}" placeholder="${ph}" style="flex:1;min-height:72px;background:var(--panel-2,#0f1418);color:var(--text,#e6eef6);border:1px solid var(--border,#24303b);border-radius:10px;padding:8px"></textarea>
    </div>`;
    return `<div class="row" style="gap:8px;align-items:center">
      <label style="width:120px">${label}</label>
      <input id="${id}" placeholder="${ph}" style="flex:1"/>
    </div>`;
  }
  function selectAges(id){
    return `<div class="row" style="gap:8px;align-items:center">
      <label style="width:120px">Ages</label>
      <div style="display:flex;gap:10px">
        <label><input type="checkbox" class="c7Age" data-id="${id}" value="Antiquity"> Antiquity</label>
        <label><input type="checkbox" class="c7Age" data-id="${id}" value="Exploration"> Exploration</label>
        <label><input type="checkbox" class="c7Age" data-id="${id}" value="Modern"> Modern</label>
      </div>
    </div>`;
  }
  function yesNo(label, id){
    return `<div class="row" style="gap:8px;align-items:center">
      <label style="width:120px">${label}</label>
      <input type="checkbox" id="${id}"/>
    </div>`;
  }
  function numberInput(label,id,min=0){
    return `<div class="row" style="gap:8px;align-items:center">
      <label style="width:180px">${label}</label>
      <input type="number" id="${id}" min="${min}" value="0" style="width:120px"/>
    </div>`;
  }
  function makeTable(headers){
    return `<table class="table" style="width:100%;border-collapse:collapse;border:1px solid var(--border,#24303b)">
      <thead><tr>${headers.map(h=>`<th style="text-align:left;padding:8px;border-bottom:1px solid var(--border,#24303b)">${h}</th>`).join("")}</tr></thead>
      <tbody></tbody>
    </table>`;
  }
  function fileToDataURL(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = ()=> resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  // ---------- Scaffold ----------
  function ensureEditor(){
    const modal = byId("editor");
    if (!modal) return null;
    if (modal.querySelector(".c7-editor")) return modal;

    modal.innerHTML = `
      <div class="panel" style="width:min(900px,95vw);background:var(--panel, #11161b);border:1px solid var(--border,#24303b);border-radius:14px;padding:16px">
        <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px">
          <h2 style="margin:0">Data Editor</h2>
          <div class="right" style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn" id="c7Export">Export</button>
            <input type="file" id="c7ImportFile" accept=".json" style="display:none"/>
            <button class="btn" id="c7Import">Import</button>
            <button class="btn danger" id="c7ClearTab" title="Clear current category">Clear This Category</button>
            <button class="btn danger" id="c7NukeAll" title="Delete ALL Data">Delete ALL Data</button>
            <button class="btn" id="c7Close">Close</button>
          </div>
        </div>
        <div class="c7-editor">
          <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">
            <button class="btn small" data-tab="leaders">Leaders</button>
            <button class="btn small" data-tab="civs">Civilizations</button>
            <button class="btn small" data-tab="mementos">Mementos</button>
            <button class="btn small" data-tab="worldWonders">World Wonders</button>
            <button class="btn small" data-tab="naturalWonders">Natural Wonders</button>
            <button class="btn small" data-tab="cityStates">City States</button>
          </div>
          <div id="c7TabContent"></div>
        </div>
      </div>
    `;
    return modal;
  }

  // ---------- Common edit-in-form controller ----------
  function makeEditController(){
    let editing = null; // {kind, index}
    return {
      isEditing(kind){ return editing && editing.kind===kind ? editing.index : -1; },
      begin(kind, index){ editing = {kind, index}; },
      end(){ editing = null; },
      active(){ return editing; }
    };
  }
  const editorCtl = makeEditController();

  // ---------- Renderers ----------
  function renderLeaders(content){
    const idxEditing = editorCtl.isEditing("leaders");
    const editingObj = idxEditing>=0 ? store.editor.data.leaders[idxEditing] : null;
    content.innerHTML = `
      <div class="card" style="padding:12px;border:1px solid var(--border,#24303b);border-radius:10px;margin-bottom:10px">
        <h3 style="margin:0 0 8px 0">${idxEditing>=0?"Edit Leader":"Add Leader"}</h3>
        ${textInput("Name","ldrName","e.g., Isabella")}
        ${textInput("Description","ldrDesc","Traits / effects", true)}
        ${imgInput("Icon","ldrImg")}
        <div class="row" style="justify-content:flex-end;gap:8px">
          ${idxEditing>=0? `<button class="btn" id="cancelLeader" type="button">Cancel</button>`:""}
          <button class="btn" id="addLeader" type="button">${idxEditing>=0?"Save":"Add"}</button>
        </div>
      </div>
      ${makeTable(["Leader","Description","Actions"])}
    `;
    if (editingObj){
      $("#ldrName", content).value = editingObj.name||"";
      $("#ldrDesc", content).value = editingObj.description||"";
    }
    const tbody = $("tbody", content);
    (store.editor.data.leaders||[]).sort((a,b)=>a.name.localeCompare(b.name)).forEach((o,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td style="padding:8px">${o.name}</td><td style="padding:8px">${o.description||""}</td>
                      <td style="padding:8px">
                        <button class="btn small" data-edit="${i}">Edit</button>
                        <button class="btn small danger" data-del="${i}">Delete</button>
                      </td>`;
      tbody.appendChild(tr);
    });

    $("#cancelLeader", content)?.addEventListener("click", ()=>{ editorCtl.end(); renderLeaders(content); });

    $("#addLeader", content)?.addEventListener("click", async (ev)=>{
      ev.preventDefault(); ev.stopPropagation();
      const name = $("#ldrName", content).value.trim(); if (!name) return;
      const description = $("#ldrDesc", content).value.trim();
      let image="";
      const file = $("#ldrImg", content).files[0];
      if (file) image = await fileToDataURL(file);

      const existingIdx = (store.editor.data.leaders||[]).findIndex(x=>x.name.toLowerCase()===name.toLowerCase());
      const payload = {name, description, image: image || (existingIdx>=0? store.editor.data.leaders[existingIdx].image:"")};

      if (idxEditing>=0){ // editing current row
        store.editor.data.leaders[idxEditing] = payload;
        editorCtl.end();
      } else if (existingIdx>=0){ // upsert on duplicate name
        store.editor.data.leaders[existingIdx] = payload;
      } else {
        store.editor.data.leaders.push(payload);
      }
      store.leaders[name] = {desc: payload.description, image: payload.image};
      save(store); emitUpdated(["leaders"]);
      renderLeaders(content);
    });

    content.addEventListener("click",(e)=>{
      const del = e.target.getAttribute("data-del");
      const edit = e.target.getAttribute("data-edit");
      if (del){
        const idx = parseInt(del,10);
        const name = store.editor.data.leaders[idx]?.name;
        store.editor.data.leaders.splice(idx,1);
        if (name) delete store.leaders[name];
        save(store); emitUpdated(["leaders"]); renderLeaders(content);
      } else if (edit){
        const idx = parseInt(edit,10);
        editorCtl.begin("leaders", idx);
        renderLeaders(content);
      }
    });
  }

  function renderCivs(content){
    const idxEditing = editorCtl.isEditing("civs");
    const editingObj = idxEditing>=0 ? store.editor.data.civs[idxEditing] : null;
    content.innerHTML = `
      <div class="card" style="padding:12px;border:1px solid var(--border,#24303b);border-radius:10px;margin-bottom:10px">
        <h3 style="margin:0 0 8px 0">${idxEditing>=0?"Edit Civilization":"Add Civilization"}</h3>
        ${textInput("Name","civName","e.g., Babylon")}
        ${selectAges("civAges")}
        ${textInput("Description","civDesc","Summary / traits", true)}
        ${imgInput("Icon","civImg")}
        <div class="row" style="justify-content:flex-end;gap:8px">
          ${idxEditing>=0? `<button class="btn" id="cancelCiv" type="button">Cancel</button>`:""}
          <button class="btn" id="addCiv" type="button">${idxEditing>=0?"Save":"Add"}</button>
        </div>
      </div>
      ${makeTable(["Civilization","Ages","Description","Actions"])}
    `;
    if (editingObj){
      $("#civName", content).value = editingObj.name||"";
      $("#civDesc", content).value = editingObj.description||"";
      (editingObj.ages||[]).forEach(a=>{
        const el = $(`.c7Age[data-id='civAges'][value='${a}']`, content);
        if (el) el.checked = true;
      });
    }
    const tbody = $("tbody", content);
    (store.editor.data.civs||[]).sort((a,b)=>a.name.localeCompare(b.name)).forEach((o,i)=>{
      const ages = (o.ages||[]).join(", ");
      const tr = document.createElement("tr");
      tr.innerHTML = `<td style="padding:8px">${o.name}</td><td style="padding:8px">${ages}</td>
                      <td style="padding:8px">${o.description||""}</td>
                      <td style="padding:8px">
                        <button class="btn small" data-edit="${i}">Edit</button>
                        <button class="btn small danger" data-del="${i}">Delete</button>
                      </td>`;
      tbody.appendChild(tr);
    });

    $("#cancelCiv", content)?.addEventListener("click", ()=>{ editorCtl.end(); renderCivs(content); });

    $("#addCiv", content)?.addEventListener("click", async (ev)=>{
      ev.preventDefault(); ev.stopPropagation();
      const name = $("#civName", content).value.trim(); if (!name) return;
      const desc = $("#civDesc", content).value.trim();
      const ages = $$(".c7Age[data-id='civAges']:checked", content).map(el=>el.value);
      let image=""; const f=$("#civImg", content).files[0]; if (f) image = await fileToDataURL(f);

      const existingIdx = (store.editor.data.civs||[]).findIndex(x=>x.name.toLowerCase()===name.toLowerCase());
      const payload = {name, ages, description: desc, image: image || (existingIdx>=0? store.editor.data.civs[existingIdx].image:"")};

      if ((editorCtl.isEditing("civs"))>=0){
        store.editor.data.civs[idxEditing] = payload;
        editorCtl.end();
      } else if (existingIdx>=0){
        store.editor.data.civs[existingIdx] = payload;
      } else {
        store.editor.data.civs.push(payload);
      }
      // sync derived buckets/meta for compatibility
      store.civs={Antiquity:[],Exploration:[],Modern:[]};
      (store.editor.data.civs||[]).forEach(c=> (c.ages||[]).forEach(a=>{
        if (!store.civs[a]) store.civs[a]=[];
        if (!store.civs[a].includes(c.name)) store.civs[a].push(c.name);
      }));
      store.civMeta[name] = {desc, image: payload.image||""};
      save(store); emitUpdated(["civs"]); renderCivs(content);
    });

    content.addEventListener("click",(e)=>{
      const del = e.target.getAttribute("data-del");
      const edit = e.target.getAttribute("data-edit");
      if (del){
        const idx = parseInt(del,10);
        const name = store.editor.data.civs[idx]?.name;
        store.editor.data.civs.splice(idx,1);
        // rebuild derived
        store.civs={Antiquity:[],Exploration:[],Modern:[]};
        (store.editor.data.civs||[]).forEach(c=> (c.ages||[]).forEach(a=>{
          if (!store.civs[a]) store.civs[a]=[];
          if (!store.civs[a].includes(c.name)) store.civs[a].push(c.name);
        }));
        if (name) delete store.civMeta[name];
        save(store); emitUpdated(["civs"]); renderCivs(content);
      } else if (edit){
        const idx = parseInt(edit,10);
        editorCtl.begin("civs", idx);
        renderCivs(content);
      }
    });
  }

  function renderMementos(content){
    const idxEditing = editorCtl.isEditing("mementos");
    const editingObj = idxEditing>=0 ? store.editor.data.mementos[idxEditing] : null;
    content.innerHTML = `
      <div class="card" style="padding:12px;border:1px solid var(--border,#24303b);border-radius:10px;margin-bottom:10px">
        <h3 style="margin:0 0 8px 0">${idxEditing>=0?"Edit Memento":"Add Memento"}</h3>
        ${textInput("Name","memName","e.g., Royal Mace")}
        ${textInput("Effect","memEffect","What it does", true)}
        ${imgInput("Icon","memImg")}
        <div class="row" style="justify-content:flex-end;gap:8px">
          ${idxEditing>=0? `<button class="btn" id="cancelMem" type="button">Cancel</button>`:""}
          <button class="btn" id="addMem" type="button">${idxEditing>=0?"Save":"Add"}</button>
        </div>
      </div>
      ${makeTable(["Memento","Effect","Actions"])}
    `;
    if (editingObj){
      $("#memName", content).value = editingObj.name||"";
      $("#memEffect", content).value = editingObj.effect||"";
    }
    const tbody = $("tbody", content);
    (store.editor.data.mementos||[]).sort((a,b)=>a.name.localeCompare(b.name)).forEach((o,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td style="padding:8px">${o.name}</td><td style="padding:8px">${o.effect||""}</td>
                      <td style="padding:8px">
                        <button class="btn small" data-edit="${i}">Edit</button>
                        <button class="btn small danger" data-del="${i}">Delete</button>
                      </td>`;
      tbody.appendChild(tr);
    });

    $("#cancelMem", content)?.addEventListener("click", ()=>{ editorCtl.end(); renderMementos(content); });

    $("#addMem", content)?.addEventListener("click", async (ev)=>{
      ev.preventDefault(); ev.stopPropagation();
      const name = $("#memName", content).value.trim(); if (!name) return;
      const effect = $("#memEffect", content).value.trim();
      let image=""; const f=$("#memImg", content).files[0]; if (f) image = await fileToDataURL(f);

      const existingIdx = (store.editor.data.mementos||[]).findIndex(x=>x.name.toLowerCase()===name.toLowerCase());
      const payload = {name, effect, image: image || (existingIdx>=0? store.editor.data.mementos[existingIdx].image:"")};

      if ((editorCtl.isEditing("mementos"))>=0){
        store.editor.data.mementos[idxEditing] = payload;
        editorCtl.end();
      } else if (existingIdx>=0){
        store.editor.data.mementos[existingIdx] = payload;
      } else {
        store.editor.data.mementos.push(payload);
      }
      store.mementos[name] = {desc: effect, image: payload.image||""};
      save(store); emitUpdated(["mementos"]); renderMementos(content);
    });

    content.addEventListener("click",(e)=>{
      const del = e.target.getAttribute("data-del");
      const edit = e.target.getAttribute("data-edit");
      if (del){
        const idx = parseInt(del,10);
        const name = store.editor.data.mementos[idx]?.name;
        store.editor.data.mementos.splice(idx,1);
        if (name) delete store.mementos[name];
        save(store); emitUpdated(["mementos"]); renderMementos(content);
      } else if (edit){
        const idx = parseInt(edit,10);
        editorCtl.begin("mementos", idx);
        renderMementos(content);
      }
    });
  }

  function renderWorldWonders(content){
    const idxEditing = editorCtl.isEditing("worldWonders");
    const editingObj = idxEditing>=0 ? store.editor.data.worldWonders[idxEditing] : null;
    content.innerHTML = `
      <div class="card" style="padding:12px;border:1px solid var(--border,#24303b);border-radius:10px;margin-bottom:10px">
        <h3 style="margin:0 0 8px 0">${idxEditing>=0?"Edit World Wonder":"Add World Wonder"}</h3>
        ${textInput("Name","wwName","e.g., Pyramids")}
        <div class="row" style="gap:8px;align-items:center">
          <label style="width:120px">Age</label>
          <select id="wwAge"><option>Antiquity</option><option>Exploration</option><option>Modern</option></select>
        </div>
        ${textInput("Unlocked By","wwUnlock","Tech/Civic")}
        ${yesNo("Big Ticket","wwBig")}
        ${textInput("Description","wwDesc","What it does", true)}
        ${imgInput("Icon","wwImg")}
        <div class="row" style="justify-content:flex-end;gap:8px">
          ${idxEditing>=0? `<button class="btn" id="cancelWW" type="button">Cancel</button>`:""}
          <button class="btn" id="addWW" type="button">${idxEditing>=0?"Save":"Add"}</button>
        </div>
      </div>
      ${makeTable(["Name","Age","Unlocked By","Big","Actions"])}
    `;
    if (editingObj){
      $("#wwName", content).value = editingObj.name||"";
      $("#wwAge", content).value = editingObj.age||"Antiquity";
      $("#wwUnlock", content).value = editingObj.unlockedBy||"";
      $("#wwBig", content).checked = !!editingObj.isBigTicket;
      $("#wwDesc", content).value = editingObj.description||"";
    }
    const tbody = $("tbody", content);
    (store.editor.data.worldWonders||[])
      .sort((a,b)=> (a.age||"").localeCompare(b.age||"") || a.name.localeCompare(b.name))
      .forEach((o,i)=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `<td style="padding:8px">${o.name}</td><td style="padding:8px">${o.age||""}</td>
                        <td style="padding:8px">${o.unlockedBy||""}</td><td style="padding:8px">${o.isBigTicket? "Yes":"No"}</td>
                        <td style="padding:8px">
                          <button class="btn small" data-edit="${i}">Edit</button>
                          <button class="btn small danger" data-del="${i}">Delete</button>
                        </td>`;
        tbody.appendChild(tr);
      });

    $("#cancelWW", content)?.addEventListener("click", ()=>{ editorCtl.end(); renderWorldWonders(content); });

    $("#addWW", content)?.addEventListener("click", async (ev)=>{
      ev.preventDefault(); ev.stopPropagation();
      const name = $("#wwName", content).value.trim(); if (!name) return;
      const age  = $("#wwAge", content).value;
      const unlockedBy = $("#wwUnlock", content).value.trim();
      const isBigTicket = $("#wwBig", content).checked;
      const desc = $("#wwDesc", content).value.trim();
      let image=""; const f=$("#wwImg", content).files[0]; if (f) image = await fileToDataURL(f);

      const existingIdx = (store.editor.data.worldWonders||[]).findIndex(x=>x.name.toLowerCase()===name.toLowerCase());
      const payload = {name, age, unlockedBy, isBigTicket, description: desc, image: image || (existingIdx>=0? store.editor.data.worldWonders[existingIdx].image:"")};

      if ((editorCtl.isEditing("worldWonders"))>=0){
        store.editor.data.worldWonders[idxEditing] = payload;
        editorCtl.end();
      } else if (existingIdx>=0){
        store.editor.data.worldWonders[existingIdx] = payload;
      } else {
        store.editor.data.worldWonders.push(payload);
      }
      save(store); emitUpdated(["worldWonders"]); renderWorldWonders(content);
    });

    content.addEventListener("click",(e)=>{
      const del = e.target.getAttribute("data-del");
      const edit = e.target.getAttribute("data-edit");
      if (del){
        const idx = parseInt(del,10);
        store.editor.data.worldWonders.splice(idx,1);
        save(store); emitUpdated(["worldWonders"]); renderWorldWonders(content);
      } else if (edit){
        const idx = parseInt(edit,10);
        editorCtl.begin("worldWonders", idx);
        renderWorldWonders(content);
      }
    });
  }

  function renderNaturalWonders(content){
    const idxEditing = editorCtl.isEditing("naturalWonders");
    const editingObj = idxEditing>=0 ? store.editor.data.naturalWonders[idxEditing] : null;
    content.innerHTML = `
      <div class="card" style="padding:12px;border:1px solid var(--border,#24303b);border-radius:10px;margin-bottom:10px">
        <h3 style="margin:0 0 8px 0">${idxEditing>=0?"Edit Natural Wonder":"Add Natural Wonder"}</h3>
        ${textInput("Name","nwName","e.g., Mount Roraima")}
        ${numberInput("Tiles (size)","nwTiles",1)}
        ${textInput("Terrain Tags","nwTerrain","Comma-separated e.g., Tundra, Hills")}
        ${textInput("Bonuses","nwBonuses","Text; what it provides", true)}
        ${imgInput("Icon","nwImg")}
        <div class="row" style="justify-content:flex-end;gap:8px">
          ${idxEditing>=0? `<button class="btn" id="cancelNW" type="button">Cancel</button>`:""}
          <button class="btn" id="addNW" type="button">${idxEditing>=0?"Save":"Add"}</button>
        </div>
      </div>
      ${makeTable(["Name","Tiles","Terrain","Actions"])}
    `;
    if (editingObj){
      $("#nwName", content).value = editingObj.name||"";
      $("#nwTiles", content).value = editingObj.tiles||0;
      $("#nwTerrain", content).value = (editingObj.terrain||[]).join(", ");
      $("#nwBonuses", content).value = editingObj.bonuses||"";
    }
    const tbody = $("tbody", content);
    (store.editor.data.naturalWonders||[]).sort((a,b)=>a.name.localeCompare(b.name)).forEach((o,i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td style="padding:8px">${o.name}</td><td style="padding:8px">${o.tiles||0}</td>
                      <td style="padding:8px">${(o.terrain||[]).join(", ")}</td>
                      <td style="padding:8px">
                        <button class="btn small" data-edit="${i}">Edit</button>
                        <button class="btn small danger" data-del="${i}">Delete</button>
                      </td>`;
      tbody.appendChild(tr);
    });

    $("#cancelNW", content)?.addEventListener("click", ()=>{ editorCtl.end(); renderNaturalWonders(content); });

    $("#addNW", content)?.addEventListener("click", async (ev)=>{
      ev.preventDefault(); ev.stopPropagation();
      const name = $("#nwName", content).value.trim(); if (!name) return;
      const tiles = parseInt($("#nwTiles", content).value,10) || 0;
      const terrain = ($("#nwTerrain", content).value||"").split(",").map(s=>s.trim()).filter(Boolean);
      const bonuses = $("#nwBonuses", content).value.trim();
      let image=""; const f=$("#nwImg", content).files[0]; if (f) image = await fileToDataURL(f);

      const existingIdx = (store.editor.data.naturalWonders||[]).findIndex(x=>x.name.toLowerCase()===name.toLowerCase());
      const payload = {name, tiles, terrain, bonuses, image: image || (existingIdx>=0? store.editor.data.naturalWonders[existingIdx].image:"")};

      if ((editorCtl.isEditing("naturalWonders"))>=0){
        store.editor.data.naturalWonders[idxEditing] = payload;
        editorCtl.end();
      } else if (existingIdx>=0){
        store.editor.data.naturalWonders[existingIdx] = payload;
      } else {
        store.editor.data.naturalWonders.push(payload);
      }
      save(store); emitUpdated(["naturalWonders"]); renderNaturalWonders(content);
    });

    content.addEventListener("click",(e)=>{
      const del = e.target.getAttribute("data-del");
      const edit = e.target.getAttribute("data-edit");
      if (del){
        const idx = parseInt(del,10);
        store.editor.data.naturalWonders.splice(idx,1);
        save(store); emitUpdated(["naturalWonders"]); renderNaturalWonders(content);
      } else if (edit){
        const idx = parseInt(edit,10);
        editorCtl.begin("naturalWonders", idx);
        renderNaturalWonders(content);
      }
    });
  }

  function renderCityStates(content){
    const idxEditing = editorCtl.isEditing("cityStates");
    const editingObj = idxEditing>=0 ? store.editor.data.cityStates[idxEditing] : null;
    content.innerHTML = `
      <div class="card" style="padding:12px;border:1px solid var(--border,#24303b);border-radius:10px;margin-bottom:10px">
        <h3 style="margin:0 0 8px 0">${idxEditing>=0?"Edit City State":"Add City State Name"}</h3>
        ${textInput("Name","csName","e.g., Venice")}
        ${textInput("Notes","csNotes","Optional", true)}
        <div class="row" style="justify-content:flex-end;gap:8px">
          ${idxEditing>=0? `<button class="btn" id="cancelCS" type="button">Cancel</button>`:""}
          <button class="btn" id="addCS" type="button">${idxEditing>=0?"Save":"Add"}</button>
        </div>
      </div>

      <div class="card" style="padding:12px;border:1px solid var(--border,#24303b);border-radius:10px;margin-bottom:10px">
        <h3 style="margin:0 0 8px 0">Selected City State Counters (bootstrap/edit)</h3>
        <div class="row" style="gap:8px;align-items:center">
          <label style="width:120px">Select</label>
          <select id="csSelect"></select>
        </div>
        <div id="csStats" style="margin-top:10px;display:none">
          <div class="row" style="gap:24px;flex-wrap:wrap">
            ${numberInput("Antiquity appearances","csA_Ant",0)}
            ${numberInput("Exploration appearances","csA_Exp",0)}
            ${numberInput("Modern appearances","csA_Mod",0)}
          </div>
          <div class="row" style="gap:24px;flex-wrap:wrap;margin-top:6px">
            ${numberInput("Military","csT_Mil",0)}
            ${numberInput("Economic","csT_Eco",0)}
            ${numberInput("Culture","csT_Cul",0)}
            ${numberInput("Diplomatic","csT_Dip",0)}
            ${numberInput("Science","csT_Sci",0)}
            ${numberInput("Expansionist","csT_Expn",0)}
          </div>
          <div class="row" style="gap:24px;flex-wrap:wrap;margin-top:6px">
            ${numberInput("Homelands count","csHome",0)}
            ${numberInput("Distant count","csDist",0)}
            ${numberInput("Hostile count","csHost",0)}
          </div>
          <div class="row" style="gap:8px;margin-top:6px">
            <label style="width:120px">Last Seen</label>
            <input id="csLastSeen" placeholder="ISO date or leave blank" style="flex:1"/>
          </div>
          <div class="row" style="justify-content:flex-end;margin-top:8px">
            <button class="btn" id="saveCSStats" type="button">Save Stats</button>
          </div>
        </div>
      </div>

      ${makeTable(["Name","Last Seen","Ages (A/E/M)","Types (Mil/Eco/Cul/Dip/Sci/Expn)","Actions"])}
    `;

    if (editingObj){
      $("#csName", content).value = editingObj.name||"";
      $("#csNotes", content).value = editingObj.notes||"";
    }

    function fillSelect(){
      const sel = byId("csSelect");
      sel.innerHTML = `<option value="">-- choose --</option>`;
      (store.editor.data.cityStates||[]).sort((a,b)=>a.name.localeCompare(b.name)).forEach((o,idx)=>{
        const opt = document.createElement("option");
        opt.value = String(idx); opt.textContent = o.name;
        sel.appendChild(opt);
      });
    }

    function readStatsToUI(cs){
      const box = byId("csStats");
      if (!cs){ box.style.display="none"; return; }
      box.style.display="block";
      byId("csA_Ant").value = cs.appearedByAge?.Antiquity ?? 0;
      byId("csA_Exp").value = cs.appearedByAge?.Exploration ?? 0;
      byId("csA_Mod").value = cs.appearedByAge?.Modern ?? 0;

      byId("csT_Mil").value = cs.appearedByType?.Military ?? 0;
      byId("csT_Eco").value = cs.appearedByType?.Economic ?? 0;
      byId("csT_Cul").value = cs.appearedByType?.Culture ?? 0;
      byId("csT_Dip").value = cs.appearedByType?.Diplomatic ?? 0;
      byId("csT_Sci").value = cs.appearedByType?.Science ?? 0;
      byId("csT_Expn").value = cs.appearedByType?.Expansionist ?? 0;

      byId("csHome").value = cs.homeCount ?? 0;
      byId("csDist").value = cs.distantCount ?? 0;
      byId("csHost").value = cs.hostileCount ?? 0;

      byId("csLastSeen").value = cs.lastSeen || "";
    }

    const tbody = $("tbody", content);
    function rebuildTable(){
      tbody.innerHTML = "";
      (store.editor.data.cityStates||[]).sort((a,b)=>a.name.localeCompare(b.name)).forEach((o,i)=>{
        const ages = o.appearedByAge||{Antiquity:0,Exploration:0,Modern:0};
        const types = o.appearedByType||{Military:0,Economic:0,Culture:0,Diplomatic:0,Science:0,Expansionist:0};
        const tr = document.createElement("tr");
        tr.innerHTML = `<td style="padding:8px">${o.name}</td>
                        <td style="padding:8px">${o.lastSeen||""}</td>
                        <td style="padding:8px">${ages.Antiquity||0}/${ages.Exploration||0}/${ages.Modern||0}</td>
                        <td style="padding:8px">${types.Military||0}/${types.Economic||0}/${types.Culture||0}/${types.Diplomatic||0}/${types.Science||0}/${types.Expansionist||0}</td>
                        <td style="padding:8px">
                          <button class="btn small" data-edit="${i}">Edit</button>
                          <button class="btn small danger" data-del="${i}">Delete</button>
                        </td>`;
        tbody.appendChild(tr);
      });
    }

    $("#cancelCS", content)?.addEventListener("click", ()=>{ editorCtl.end(); renderCityStates(content); });

    $("#addCS", content)?.addEventListener("click", (ev)=>{
      ev.preventDefault(); ev.stopPropagation();
      const name = $("#csName", content).value.trim(); if (!name) return;
      const notes = $("#csNotes", content).value.trim();

      const existingIdx = (store.editor.data.cityStates||[]).findIndex(x=>x.name.toLowerCase()===name.toLowerCase());
      const base = existingIdx>=0? store.editor.data.cityStates[existingIdx] : {};
      const payload = {
        name, notes,
        lastSeen: base.lastSeen || "",
        appearedByAge: base.appearedByAge || {Antiquity:0,Exploration:0,Modern:0},
        appearedByType: base.appearedByType || {Military:0,Economic:0,Culture:0,Diplomatic:0,Science:0,Expansionist:0},
        homeCount: base.homeCount || 0,
        distantCount: base.distantCount || 0,
        hostileCount: base.hostileCount || 0
      };

      if ((editorCtl.isEditing("cityStates"))>=0){
        store.editor.data.cityStates[idxEditing] = payload;
        editorCtl.end();
      } else if (existingIdx>=0){
        store.editor.data.cityStates[existingIdx] = payload;
      } else {
        store.editor.data.cityStates.push(payload);
      }
      save(store); emitUpdated(["cityStates"]);
      renderCityStates(content);
    });

    byId("csSelect").onchange = (e)=>{
      const idx = parseInt(e.target.value,10);
      const cs = isNaN(idx)? null : store.editor.data.cityStates[idx];
      readStatsToUI(cs);
    };

    $("#saveCSStats", content)?.addEventListener("click", (ev)=>{
      ev.preventDefault(); ev.stopPropagation();
      const sel = byId("csSelect").value;
      if (!sel) return;
      const idx = parseInt(sel,10);
      const cs = store.editor.data.cityStates[idx]; if (!cs) return;
      cs.appearedByAge = {
        Antiquity: parseInt(byId("csA_Ant").value,10)||0,
        Exploration: parseInt(byId("csA_Exp").value,10)||0,
        Modern: parseInt(byId("csA_Mod").value,10)||0
      };
      cs.appearedByType = {
        Military: parseInt(byId("csT_Mil").value,10)||0,
        Economic: parseInt(byId("csT_Eco").value,10)||0,
        Culture: parseInt(byId("csT_Cul").value,10)||0,
        Diplomatic: parseInt(byId("csT_Dip").value,10)||0,
        Science: parseInt(byId("csT_Sci").value,10)||0,
        Expansionist: parseInt(byId("csT_Expn").value,10)||0
      };
      cs.homeCount = parseInt(byId("csHome").value,10)||0;
      cs.distantCount = parseInt(byId("csDist").value,10)||0;
      cs.hostileCount = parseInt(byId("csHost").value,10)||0;
      cs.lastSeen = (byId("csLastSeen").value||"").trim();
      save(store); emitUpdated(["cityStates"]); rebuildTable();
    });

    content.addEventListener("click",(e)=>{
      const del = e.target.getAttribute("data-del");
      const edit = e.target.getAttribute("data-edit");
      if (del){
        const idx = parseInt(del,10);
        store.editor.data.cityStates.splice(idx,1);
        save(store); emitUpdated(["cityStates"]); fillSelect(); rebuildTable(); readStatsToUI(null);
      } else if (edit){
        const idx = parseInt(edit,10);
        editorCtl.begin("cityStates", idx);
        renderCityStates(content);
      }
    });

    fillSelect();
    rebuildTable();
  }

  // ---------- Tab wiring + bulk clear ----------
  function openEditor(){
    const modal = ensureEditor(); if (!modal) { alert("Editor container (#editor) not found."); return; }
    modal.style.display = "flex";

    const content = byId("c7TabContent");
    const tabs = $$(".c7-editor [data-tab]", modal);
    let activeTab = "leaders";
    function setActive(name){
      activeTab = name;
      tabs.forEach(b=> b.classList.toggle("primary", b.getAttribute("data-tab")===name));
      if (name==="leaders") renderLeaders(content);
      else if (name==="civs") renderCivs(content);
      else if (name==="mementos") renderMementos(content);
      else if (name==="worldWonders") renderWorldWonders(content);
      else if (name==="naturalWonders") renderNaturalWonders(content);
      else if (name==="cityStates") renderCityStates(content);
    }
    tabs.forEach(b=> b.onclick = ()=> setActive(b.getAttribute("data-tab")));
    setActive("leaders");

    byId("c7Export").onclick = ()=>{
      const blob = new Blob([JSON.stringify(store,null,2)], {type:"application/json"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `c7_export_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
    };
    byId("c7Import").onclick = ()=> byId("c7ImportFile").click();
    byId("c7ImportFile").onchange = async (e)=>{
      const file = e.target.files[0]; if (!file) return;
      try{
        const incoming = JSON.parse(await file.text());
        if (incoming && incoming.editor && incoming.editor.data){
          // merge editor data
          store.editor.data = merge(store.editor.data, incoming.editor.data);
          // rebuild derived dicts
          store.leaders = {};
          (store.editor.data.leaders||[]).forEach(o=>{ if (o?.name) store.leaders[o.name] = {desc:o.description||"", image:o.image||""}; });
          store.mementos = {};
          (store.editor.data.mementos||[]).forEach(o=>{ if (o?.name) store.mementos[o.name] = {desc:o.effect||"", image:o.image||""}; });
          store.civs = {Antiquity:[],Exploration:[],Modern:[]};
          store.civMeta = {};
          (store.editor.data.civs||[]).forEach(o=>{
            if (!o?.name) return;
            (o.ages||[]).forEach(a=>{
              store.civs[a] = store.civs[a]||[];
              if (!store.civs[a].includes(o.name)) store.civs[a].push(o.name);
            });
            store.civMeta[o.name] = {desc:o.description||"", image:o.image||""};
          });
          save(store); emitUpdated(["leaders","civs","mementos","worldWonders","naturalWonders","cityStates"]);
          alert("Import complete.");
          setActive(activeTab);
        } else alert("Invalid file (missing editor.data).");
      }catch(err){ console.error(err); alert("Failed to import JSON."); }
      e.target.value = "";
    };
    byId("c7Close").onclick = ()=> { modal.style.display="none"; };

    byId("c7ClearTab").onclick = ()=>{
      const labelMap = {
        leaders:"Leaders", civs:"Civilizations", mementos:"Mementos",
        worldWonders:"World Wonders", naturalWonders:"Natural Wonders", cityStates:"City States"
      };
      if (!confirm(`Delete ALL items in "${labelMap[activeTab]}"?`)) return;
      store.editor.data[activeTab] = [];

      if (activeTab==="civs"){ store.civs={Antiquity:[],Exploration:[],Modern:[]}; store.civMeta={}; }
      if (activeTab==="leaders"){ store.leaders={}; }
      if (activeTab==="mementos"){ store.mementos={}; }

      save(store); emitUpdated([activeTab]); setActive(activeTab);
    };

    byId("c7NukeAll").onclick = ()=>{
      if (!confirm("This will ERASE ALL data in the editor and derived dictionaries. Continue?")) return;
      if (!confirm("Are you ABSOLUTELY sure? This cannot be undone.")) return;
      store.editor.data = { leaders:[], civs:[], mementos:[], worldWonders:[], naturalWonders:[], cityStates:[] };
      store.civs={Antiquity:[],Exploration:[],Modern:[]};
      store.civMeta={}; store.leaders={}; store.mementos={};
      save(store); emitUpdated(["all"]); setActive(activeTab);
    };
  }

  function bindOpen(){
    const btn = byId("openEditor");
    if (btn) btn.addEventListener("click", openEditor);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindOpen);
  else bindOpen();
})();
// c7: fallback global emit after editor actions
document.addEventListener('click',function(e){
  const id=(e.target&&e.target.id)||'';
  if(/add|save|delete|clear|import|export/i.test(id)){
    try{ window.dispatchEvent(new CustomEvent('c7-data-updated',{detail:{types:['all']}})); }catch(_){}
  }
});
