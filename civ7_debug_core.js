
/*! civ7_debug_core.js — Core probe library (v1) */
(function(global){
  if (global.Civ7Debug && global.Civ7Debug.__v) return;
  const Civ7Debug = {};
  Civ7Debug.__v = '1.0.0';

  // Utilities
  function safe(fn, fallback){ try{ return fn(); }catch(e){ return (fallback===undefined?null:fallback); } }
  function listScripts(d){ return Array.from(d.scripts).map(s=> s.src || '[inline]'); }
  function listCssRules(d){
    const out = [];
    for(const sheet of d.styleSheets){
      let rs; try{ rs = sheet.cssRules; }catch(e){ continue; }
      if(!rs) continue;
      for(const r of rs){
        try{ out.push({selector: r.selectorText||'', css: r.cssText||''}); }catch(_){}
      }
    }
    return out;
  }
  function findNodes(d, selectors){
    const out = {};
    selectors.forEach(sel=>{
      out[sel] = Array.from(d.querySelectorAll(sel)).map(n=> ({
        id: n.id||null, class: n.className||null, tag: n.tagName,
        outer: n.outerHTML ? n.outerHTML.slice(0,600) : null
      }) );
    });
    return out;
  }
  function computeHostileGap(d){
    const lab = d.createElement('label'); lab.className='small';
    lab.innerHTML='<input id="hostile" type="checkbox"> Hostile';
    d.body.appendChild(lab);
    const cs = d.defaultView.getComputedStyle(lab);
    const gap = cs.gap || cs.columnGap || 'n/a';
    lab.remove();
    return gap;
  }
  function dumpStorage(area, w){
    const src = (area==='session')? w.sessionStorage : w.localStorage;
    const o = {};
    try{
      for(let i=0;i<src.length;i++){ const k = src.key(i); o[k]=src.getItem(k); }
    }catch(_){}
    return o;
  }
  function summarizeFlags(storeSnap){
    const s = storeSnap || {};
    const ideos = new Set([].concat(s.ipIdeologies||[]));
    const ipGameIdeos = new Set(((s.state&&s.state.current&&s.state.current.ipGame)||[]).map(x=>x&&x.ideology).filter(Boolean));
    const editorIdeos = new Set(((s.editor&&s.editor.data&&s.editor.data.cityStates)||[]).flatMap(cs=> Object.keys((cs&&cs.appearedByType)||{})));
    return {
      hasScience: ideos.has('Science')||ipGameIdeos.has('Science')||editorIdeos.has('Science'),
      hasScientific: ideos.has('Scientific')||ipGameIdeos.has('Scientific')||editorIdeos.has('Scientific')
    };
  }

  // Default checks (extensible)
  const defaultChecks = [
    function meta({w,d}){
      return {
        time: new Date().toISOString(),
        href: w.location.href,
        title: d.title,
        userAgent: w.navigator.userAgent
      };
    },
    function resources({d}){
      return {
        scripts: listScripts(d),
        cssRules: listCssRules(d)
      };
    },
    function domScan({d}){
      const selectors = ['#topbar-root','[class*="topbar"]','.karma','[id*="karma"]','label.small','#hostile','select#ideo','#cityName','.typeahead','#cityTA','datalist#cityNameList'];
      return { nodes: findNodes(d, selectors) };
    },
    function styleHostile({d}){
      return { hostileGap: computeHostileGap(d) };
    },
    function storage({w}){
      return {
        localStorage: dumpStorage('local', w),
        sessionStorage: dumpStorage('session', w),
        cookies: w.document.cookie||''
      };
    },
    function storeInfo({w}){
      const out = { available: !!w.Store, hasSubscribe: !!(w.Store&&w.Store.subscribe), hasUpdate: !!(w.Store&&w.Store.update) };
      out.snapshot = safe(()=>w.Store.get(), null);
      out.snapshotError = (out.snapshot? null : safe(()=> ''));
      return { store: out, flags: summarizeFlags(out.snapshot) };
    }
  ];

  Civ7Debug.run = function(customChecks){
    const w = window, d = document;
    const ctx = {w,d};
    const checks = Array.isArray(customChecks) && customChecks.length ? customChecks : defaultChecks;
    const result = {};
    checks.forEach(fn=>{
      try{
        const part = fn(ctx) || {};
        Object.assign(result, part);
      }catch(e){
        (result.__errors||(result.__errors=[])).push({check: fn.name||'anon', error: String(e)});
      }
    });
    // quick synthesized summary
    const n = result.nodes||{};
    const topbarCount = (n['[class*="topbar"]']||[]).length;
    const karmaCount = (n['.karma']||[]).length;
    const store = (result.store||{});
    const flags = (result.flags||{});
    result.summary = [
      `Topbar nodes: ${topbarCount}`,
      `Karma blocks: ${karmaCount}`,
      `Hostile gap: ${result.hostileGap||'n/a'}`,
      `Store: ${(store.available?'ok':'missing')} | sub:${store.hasSubscribe?'Y':'N'} | upd:${store.hasUpdate?'Y':'N'}`,
      `Science present: ${flags.hasScience?'Y':'N'} | Scientific: ${flags.hasScientific?'Y':'N'}`
    ].join('\n');
    return result;
  };

  Civ7Debug.export = function(report, filename){
    const name = filename || 'civ7_debug_report.json';
    const blob = new Blob([JSON.stringify(report||{}, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 500);
  };

  global.Civ7Debug = Civ7Debug;
})(window);
