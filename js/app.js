/* ── app.js ─ Tab switching, global wiring, initialization ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};

  /* ── Tab switching ── */
  GSCM.switchToolTab = function(id){
    document.querySelectorAll('.tool-tab').forEach(function(t){t.classList.toggle('active',t.getAttribute('data-tool')===id);});
    document.querySelectorAll('.tool-panel').forEach(function(p){p.classList.toggle('active',p.id===id);});
  };

  /* ── Wire global onclick handlers ── */
  window.switchToolTab  = GSCM.switchToolTab;
  window.calcDesign     = GSCM.calcDesign;
  window.calcNewsvendor = GSCM.calcNewsvendor;
  window.calcSupplier   = GSCM.calcSupplier;
  window.calcTracker    = GSCM.calcTracker;
  window.calcYoY        = GSCM.calcYoY;
  window.resetTool      = GSCM.resetTool;
  window.saveYoYYear    = GSCM.saveYoYYear;
  window.resetYoYHistory= GSCM.resetYoYHistory;

  /* ── Initialize ── */
  GSCM.loadYoYHistory();
  GSCM.renderYoYHistory();
  GSCM.loadSuppliers();
  GSCM.renderSupplierEditor();
  GSCM.updateSupplierCheckboxes();
  GSCM.restoreAll();
  var yoyLbl = document.getElementById('yoy-entry-label');
  if(yoyLbl) yoyLbl.textContent = 'Year ' + (GSCM.yoyHistory.length + 1);
})();
