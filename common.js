
// common.js — shared helpers for Civ 7 Tracker
// One source of truth for results, cross-page karma, rich dropdowns, and a tiny signal bus.

(function(){
  const STORE_KEY="civ7_data_store_v3";
  const GAME_KEY ="civ7_game_state_v3";
  const SIGNAL_KEY="civ7_signal_v1";

  function now(){ return Date.now(); }

  // ---- Store / Game state
  function loadStore(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)||"{}")||{}; }catch(_){ return {}; } }
  function saveStore(s){ localStorage.setItem(STORE_KEY, JSON.stringify(s||{})); }

  function loadGame(){ try{ return JSON.parse(localStorage.getItem(GAME_KEY)||"{}")||{}; }catch(_){ return {}; } }
  function saveGame(g){ localStorage.setItem(GAME_KEY, JSON.stringify(g||{})); }

  // Ensure structures
  function ensureStructures(){
    const store = loadStore();
    store.civs = store.civs || [];      // {name, age:'Antiquity|Exploration|Modern', icon, desc|traits}
    store.leaders = store.leaders || []; // {name, icon, desc|traits}
    store.mementos = store.mementos || []; // {name, icon, effect|desc}
    store.wonders = store.wonders || []; // world wonders: {id,name,age,icon,desc,unlockTechs,bigTicket?:bool}
    store.naturalWonders = store.naturalWonders || []; // {id,name,icon,tiles,terrains,bonus,bigTicket?:bool}
    saveStore(store);

    const game = loadGame();
    game.current = game.current || {
      id: game.current?.id || ("game_"+now()),
      startedAt: game.current?.startedAt || now(),
      age: "Antiquity",
      picks: {
        steve: { age:"Antiquity", civ:"", leader:"", m1:"", m2:"" },
        tiny:  { age:"Antiquity", civ:"", leader:"", m1:"", m2:"" }
      },
      pools: {
        steve: { acq:[false,false,false,false], veto:[false,false,false,false,false] },
        tiny:  { acq:[false,false,false,false],  veto:[false,false,false,false,false] }
      }
    };
    store.results = store.results || {}; // results[gameId][category][itemId] = {owner:'steve'|'tiny'|'ai'|null, ts}
    store.history = store.history || {}; // history[itemId] = [{ts, gameId, action, details}]
    store.bigTicketDrought = store.bigTicketDrought || {}; // bigTicketDrought[itemId] = { steve: n, tiny: n }
    if (!store.results[game.current.id]) store.results[game.current.id] = {};
    saveStore(store); saveGame(game);
  }
  ensureStructures();

  // ---- Signal bus (storage event)
  function emitSignal(type, payload){
    localStorage.setItem(SIGNAL_KEY, JSON.stringify({ ts: now(), type, payload }));
  }
  function onSignal(handler){
    window.addEventListener('storage', (e)=>{
      if (e.key !== SIGNAL_KEY) return;
      try{ const msg = JSON.parse(e.newValue||"null"); if (msg) handler(msg); }catch(_){}
    });
    document.addEventListener('visibilitychange', ()=>{
      if (!document.hidden){ handler({ ts: now(), type: 'visibility-resync' }); }
    });
  }

  // ---- Results
  function setOwner(category, itemId, owner){
    const store = loadStore(); const game = loadGame();
    const gid = game.current.id;
    store.results[gid] = store.results[gid] || {};
    store.results[gid][category] = store.results[gid][category] || {};
    store.results[gid][category][itemId] = { owner, ts: now() };
    saveStore(store);
    emitSignal('owner-set', { category, itemId, owner, gid });
  }

  function getOwner(category, itemId){
    const store = loadStore(); const gid = loadGame().current.id;
    const o = store.results?.[gid]?.[category]?.[itemId];
    return o?.owner || null;
  }

  function clearAllOwnersCurrentGame(){
    const store=loadStore(); const gid=loadGame().current.id;
    if (!store.results[gid]) return;
    Object.keys(store.results[gid]).forEach(cat=>{
      Object.keys(store.results[gid][cat]).forEach(id=>{
        store.results[gid][cat][id].owner = null;
      });
    });
    saveStore(store);
    emitSignal('karma-reset', { gid });
  }

  // ---- Karma compute (current game)
  function computeKarma(){
    const store=loadStore(); const gid=loadGame().current.id;
    const out = { "World Wonders":{steve:0,tiny:0}, "Natural Wonders":{steve:0,tiny:0},
      "Independents:Military":{steve:0,tiny:0}, "Independents:Economic":{steve:0,tiny:0},
      "Independents:Culture":{steve:0,tiny:0}, "Independents:Diplomatic":{steve:0,tiny:0},
      "Independents:Science":{steve:0,tiny:0}, "Independents:Expansionist":{steve:0,tiny:0} };

    const r = store.results?.[gid] || {};
    Object.keys(r).forEach(cat=>{
      Object.values(r[cat]).forEach(v=>{
        if (v?.owner==='steve') out[cat]?.steve !== undefined && (out[cat].steve++);
        if (v?.owner==='tiny')  out[cat]?.tiny  !== undefined && (out[cat].tiny++);
      });
    });

    // Convert into bonuses: trailing player gets +diff for that category
    const bonus = {};
    Object.keys(out).forEach(cat=>{
      const s=out[cat].steve||0, t=out[cat].tiny||0, diff=Math.abs(s-t);
      bonus[cat] = { steve: s<t?diff:0, tiny: t<s?diff:0 };
    });
    return { counts: out, bonus };
  }

  // ---- History
  function pushHistory(itemId, entry){
    const store=loadStore();
    store.history[itemId] = store.history[itemId] || [];
    store.history[itemId].push(Object.assign({ ts: now(), gameId: loadGame().current.id }, entry||{}));
    saveStore(store);
  }
  function readHistory(itemId){ return (loadStore().history?.[itemId]||[]).slice().reverse(); }

  // ---- Big dropdown component (same look as mementos)
  // target: element to attach; options: [{value, name, icon, detail}], value: initial
  function mountRichSelect(target, { options, value, onChange, placeholder }={}){
    target.classList.add('richselect');
    target.innerHTML = `
      <div class="rs-head">
        <img class="rs-icon" alt="" />
        <div class="rs-main">
          <div class="rs-name">${placeholder||'Select'}</div>
          <div class="rs-detail small">—</div>
        </div>
        <button class="rs-btn">▼</button>
      </div>
      <div class="rs-menu" hidden></div>
    `;
    const head=target.querySelector('.rs-head');
    const icon=target.querySelector('.rs-icon');
    const name=target.querySelector('.rs-name');
    const detail=target.querySelector('.rs-detail');
    const btn=target.querySelector('.rs-btn');
    const menu=target.querySelector('.rs-menu');

    function renderMenu(list){
      menu.innerHTML="";
      list.forEach(o=>{
        const row=document.createElement('div');
        row.className='rs-row';
        row.innerHTML = `<img class="rs-i" src="${o.icon||''}"/><div class="rs-col"><div class="rs-n">${o.name}</div><div class="rs-d small">${o.detail||''}</div></div>`;
        row.onclick=()=>{ setValue(o.value); menu.hidden=true; onChange && onChange(o.value, o); };
        menu.appendChild(row);
      });
    }

    function setValue(val){
      const o = options.find(x=>x.value===val);
      if (o){ icon.src=o.icon||''; name.textContent=o.name; detail.textContent=o.detail||''; }
      else { icon.src=''; name.textContent=placeholder||'Select'; detail.textContent='—'; }
      value = val;
    }

    btn.onclick = ()=>{ menu.hidden = !menu.hidden; };
    document.addEventListener('click', (e)=>{
      if (!target.contains(e.target)) menu.hidden=true;
    });

    renderMenu(options||[]);
    setValue(value);
    return { setOptions:(opts)=>{ options=opts||[]; renderMenu(options); setValue(value); }, setValue };
  }

  // Map data → richselect options
  function mapLeaders(store){ return (store.leaders||[]).map(x=>({ value:x.name, name:x.name, icon:x.icon||"", detail:x.traits||x.desc||"" })); }
  function mapCivs(store, age){ return (store.civs||[]).filter(c=>!age || c.age===age).map(x=>({ value:x.name, name:x.name, icon:x.icon||"", detail:x.traits||x.desc||"", age:x.age||"" })); }
  function mapMementos(store){ return (store.mementos||[]).map(x=>({ value:x.name, name:x.name, icon:x.icon||"", detail:x.effect||x.desc||"" })); }

  // Expose API
  window.civ7 = {
    loadStore, saveStore, loadGame, saveGame, ensureStructures,
    setOwner, getOwner, computeKarma, clearAllOwnersCurrentGame,
    pushHistory, readHistory,
    onSignal, emitSignal,
    mountRichSelect, mapLeaders, mapCivs, mapMementos
  };
})();
