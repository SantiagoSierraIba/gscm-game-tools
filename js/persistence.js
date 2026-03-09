/* ── persistence.js ─ localStorage save/restore/reset ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};
  var STORAGE_KEY = 'gscm-game-tools';

  GSCM.getAllInputs = function(){
    var inputs=document.querySelectorAll('.tool-card input, .tool-card select');
    var data={};
    inputs.forEach(function(el){
      if(!el.id) return;
      if(el.type==='checkbox') data[el.id]=el.checked;
      else data[el.id]=el.value;
    });
    return data;
  };

  GSCM.saveAll = function(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(GSCM.getAllInputs()));}catch(e){}
  };

  GSCM.restoreAll = function(){
    try{
      var raw=localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      var data=JSON.parse(raw);
      Object.keys(data).forEach(function(id){
        var el=document.getElementById(id);
        if(!el) return;
        if(el.type==='checkbox') el.checked=!!data[id];
        else el.value=data[id];
      });
    }catch(e){}
  };

  GSCM.resetTool = function(toolName){
    var panel=document.getElementById('tool-'+toolName) || document.getElementById('result-'+toolName);
    if(!panel) return;
    var container = document.getElementById('tool-'+toolName);
    if(container){
      container.querySelectorAll('input[type="number"]').forEach(function(el){ el.value=el.defaultValue||''; });
      container.querySelectorAll('input[type="text"]').forEach(function(el){ el.value=''; });
      container.querySelectorAll('input[type="checkbox"]').forEach(function(el){ el.checked=el.defaultChecked; });
    }
    var rp=document.getElementById('result-'+toolName);
    if(rp){ rp.innerHTML=''; rp.classList.remove('visible'); }
    GSCM.saveAll();
  };

  /* Auto-save on input/change inside tool-cards */
  document.addEventListener('input',function(e){
    if(e.target.closest('.tool-card')) GSCM.saveAll();
  });
  document.addEventListener('change',function(e){
    if(e.target.closest('.tool-card')) GSCM.saveAll();
  });
})();
