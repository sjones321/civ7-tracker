
// results_core.js — NON-VISUAL shared state for Civ7 Tracker
// No CSS, no DOM changes. Safe to include on any page.

(function(){
  const STORE_KEY="civ7_data_store_v3";
  const GAME_KEY ="civ7_game_state_v3";
  const SIGNAL_KEY="civ7_signal_v1";

  function now(){ return Date.now(); }
  function loadStore(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)||"{}")||{}; }catch(_){ return {}; } }
  function saveStore(s){ localStorage.setItem(STORE_KEY, JSON.stringify(s||{})); }
  function loadGame(){ try{ return JSON.parse(localStorage.getItem(GAME_KEY)||"{}")||{}; }catch(_){ return {}; } }
  function saveGame(g){ localStorage.setItem(GAME_KEY, JSON.stringify(g||{})); }

  function ensure(){
    const store=loadStore();
    store.results = store.results || {};   // results[gameId][category][itemId] = { owner, ts }
    store.history = store.history || {};   // history[itemId] = [...]
    store.bigTicketDrought = store.bigTicketDrought || {};
    saveStore(store);
    const game=loadGame();
    game.current = game.current || { id: game.current?.id || ("game_"+now()), startedAt: game.current?.startedAt || now() };
    if (!store.results[game.current.id]){ store.results[game.current.id] = {}; saveStore(store); }
    saveGame(game);
  }
  ensure();

  function emit(type, payload){
    localStorage.setItem(SIGNAL_KEY, JSON.stringify({ ts: now(), type, payload }));
  }
  function onSignal(handler){
    window.addEventListener('storage', (e)=>{
      if (e.key!==SIGNAL_KEY) return;
      try{ const msg = JSON.parse(e.newValue||"null"); if (msg) handler(msg); }catch(_){}
    });
    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) handler({ ts: now(), type:"visibility-resync" }); });
  }

  function setOwner(category, itemId, owner){
    const store=loadStore(); const gid=loadGame().current.id;
    store.results[gid] = store.results[gid] || {};
    store.results[gid][category] = store.results[gid][category] || {};
    store.results[gid][category][itemId] = { owner, ts: now() };
    saveStore(store);
    emit('owner-set', { category, itemId, owner, gid });
  }
  function getOwner(category, itemId){
    const r = loadStore().results?.[loadGame().current.id]?.[category]?.[itemId];
    return r?.owner || null;
  }
  function clearAllOwnersCurrentGame(){
    const store=loadStore(); const gid=loadGame().current.id;
    const r = store.results?.[gid]; if (!r) return;
    Object.keys(r).forEach(cat=> Object.keys(r[cat]).forEach(id=>{ r[cat][id].owner = null; }));
    saveStore(store);
    emit('karma-reset', { gid });
  }

  // Count wins per category → convert to karma bonuses
  function computeKarma(){
    const store=loadStore(); const gid=loadGame().current.id;
    const out = {};   // counts
    const bonus = {}; // trailing diff
    const r = store.results?.[gid] || {};
    Object.keys(r).forEach(cat=>{
      const c = { steve:0, tiny:0 };
      Object.values(r[cat]).forEach(v=>{
        if (v?.owner==='steve') c.steve++;
        if (v?.owner==='tiny')  c.tiny++;
      });
      out[cat]=c;
      const diff = Math.abs(c.steve - c.tiny);
      bonus[cat] = { steve: c.steve < c.tiny ? diff : 0, tiny: c.tiny < c.steve ? diff : 0 };
    });
    return { counts: out, bonus };
  }

  // History utility
  function pushHistory(itemId, entry){ const store=loadStore(); store.history[itemId]=store.history[itemId]||[]; store.history[itemId].push(Object.assign({ ts: now(), gid: loadGame().current.id }, entry||{})); saveStore(store); }
  function readHistory(itemId){ return (loadStore().history?.[itemId]||[]).slice().reverse(); }

  window.civ7core = { loadStore, saveStore, loadGame, saveGame, onSignal, setOwner, getOwner, clearAllOwnersCurrentGame, computeKarma, pushHistory, readHistory };
})();
