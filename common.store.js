
/*! common.store_ideonorm.js — drop-in Store with Science→Scientific normalization */
(function (global) {
  const LS_KEY = "civ7_data_store_v3";
  const IDEOLOGY_MAP = { Science: "Scientific", Scientific: "Scientific" };
  const IDEOS = ["Culture","Diplomatic","Economic","Expansionist","Military","Scientific"];

  // --- utils ---
  function clone(x){ return JSON.parse(JSON.stringify(x||{})); }
  function readLS(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; } }
  function writeLS(obj){ localStorage.setItem(LS_KEY, JSON.stringify(obj||{})); }

  // normalize helpers
  function normIdeoname(name){
    return Object.prototype.hasOwnProperty.call(IDEOLOGY_MAP, name) ? IDEOLOGY_MAP[name] : name;
  }
  function normalizeInPlace(s){
    if(!s || typeof s!=='object') return s;

    // List
    if(Array.isArray(s.ipIdeologies)){
      s.ipIdeologies = s.ipIdeologies.map(normIdeoname);
      // ensure full set if empty
      if(!s.ipIdeologies.length) s.ipIdeologies = IDEOS.slice();
    }

    // Current game (ipGame)
    const ipg = (((s.state||{}).current||{}).ipGame)||[];
    ipg.forEach(c=>{
      if(c && c.ideology) c.ideology = normIdeoname(c.ideology);
    });

    // ipStats aggregates
    if(s.ipStats && typeof s.ipStats==='object'){
      Object.values(s.ipStats).forEach(stat=>{
        if(!stat) return;
        if(stat.ideologyCounts && stat.ideologyCounts.Science!=null){
          stat.ideologyCounts.Scientific = (stat.ideologyCounts.Scientific||0) + (stat.ideologyCounts.Science||0);
          delete stat.ideologyCounts.Science;
        }
        if(stat.lastIdeology && stat.lastIdeology.ideology==="Science"){
          stat.lastIdeology.ideology = "Scientific";
        }
      });
    }

    // Data Editor aggregates
    const csList = (((s.editor||{}).data||{}).cityStates)||[];
    csList.forEach(cs=>{
      const t = cs && cs.appearedByType;
      if(!t) return;
      if(t.Science!=null){
        t.Scientific = (t.Scientific||0) + (t.Science||0);
        delete t.Science;
      }
    });

    // Ensure paths exist
    s.state = s.state||{};
    s.state.current = s.state.current||{};
    s.state.current.ipGame = s.state.current.ipGame||[];
    s.editor = s.editor||{};
    s.editor.data = s.editor.data||{};
    if(!Array.isArray(s.editor.data.cityStates)) s.editor.data.cityStates = [];
    if(!Array.isArray(s.ipIdeologies)) s.ipIdeologies = IDEOS.slice();

    return s;
  }

  // subscribers
  const subs = new Set();
  function notify(){ subs.forEach(fn=>{ try{ fn(); }catch{} }); }

  // core state
  let state = normalizeInPlace(readLS());

  const Store = {
    get(){ return clone(state); },

    set(next){
      state = normalizeInPlace(clone(next));
      writeLS(state);
      notify();
    },

    replace(next){ this.set(next); },

    update(updater){
      const draft = clone(state);
      updater(draft);
      this.set(draft);
    },

    subscribe(fn){
      if(typeof fn==='function'){ subs.add(fn); return ()=>subs.delete(fn); }
      return ()=>{};
    },

    export(){
      return JSON.stringify(this.get(), null, 2);
    },

    import(json){
      let obj = {};
      try{ obj = JSON.parse(json); }catch{ obj = {}; }
      this.set(obj);
    },

    // reserved for future adapters; noop passthrough for now
    useAdapter(adapter){ this._adapter = adapter || null; }
  };

  // Expose
  global.Store = Store;
})(window);
