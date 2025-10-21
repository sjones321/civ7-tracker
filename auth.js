// auth.js — ultra-light client-side gate (NOT secure; ok for GitHub Pages)
(function(){
  const LS_USER_KEY = "civ7_user_v1";
  function getUser(){ try{ return JSON.parse(localStorage.getItem(LS_USER_KEY) || "null"); }catch(_){ return null; } }
  function setUser(u){ localStorage.setItem(LS_USER_KEY, JSON.stringify(u||null)); }
  function logout(){ localStorage.removeItem(LS_USER_KEY); location.href = "login.html"; }

  const LS_AUDIT = "civ7_audit_log_v1";
  function logAudit(entry){
    try{
      const arr = JSON.parse(localStorage.getItem(LS_AUDIT) || "[]");
      arr.push(Object.assign({ ts: Date.now(), user: (getUser()?.name||"Unknown") }, entry||{}));
      localStorage.setItem(LS_AUDIT, JSON.stringify(arr));
    }catch(e){ console.warn("audit failed", e); }
  }

  function requireAuth(opts){
    const user = getUser();
    if(!user){ location.href = "login.html"; return null; }
    if (opts && opts.readwriteOnly && user.readonly){
      console.info("Read-only spectator mode");
    }
    return user;
  }

  function isReadOnly(){ return !!getUser()?.readonly; }
  function currentUser(){ return getUser(); }

  window.civ7auth = { getUser, setUser, logout, requireAuth, isReadOnly, currentUser, logAudit };
})();