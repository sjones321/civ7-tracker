// require-auth.js (v3, no-wire) — auth gate without loading wire_min.js
(function(){
  function load(src, cb){
    var s=document.createElement('script');
    s.src=src; s.defer=true; s.onload=cb||function(){};
    document.head.appendChild(s);
  }
  const LS_USER_KEY = "civ7_user_v1"; // must match auth.js
  function ensureAuth(cb){
    function ok(){ cb && cb(); }
    function go(){
      if (!window.civ7auth){
        load('auth.js', function(){ window.civ7auth && window.civ7auth.requireAuth(); ok(); });
      } else {
        window.civ7auth.requireAuth(); ok();
      }
    }
    if (document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', go); } else { go(); }
  }
  // IMPORTANT: we no longer auto-load wire_min.js here.
  // If a page needs extra helpers, it should include them explicitly.
  ensureAuth(function(){
    try{ load('results_core.js'); }catch(_){}
  });
})();
