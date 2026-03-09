/* ── suppliers.js ─ Editable supplier data model ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};
  var SUPPLIER_KEY = 'gscm-supplier-config';

  GSCM.DEFAULT_SUPPLIERS = [
    {name:'FarFarAway',    capA:120, capB:60, costA:160, costB:180, lead:6, setup:0},
    {name:'PrettyClose',   capA:50,  capB:25, costA:175, costB:195, lead:1, setup:100},
    {name:'RightNextDoor', capA:30,  capB:15, costA:195, costB:210, lead:0, setup:200}
  ];

  GSCM.suppliers = [];

  GSCM.loadSuppliers = function(){
    try {
      var raw = localStorage.getItem(SUPPLIER_KEY);
      if(raw) {
        var parsed = JSON.parse(raw);
        if(Array.isArray(parsed) && parsed.length > 0) {
          GSCM.suppliers = parsed;
          return;
        }
      }
    } catch(e){}
    GSCM.suppliers = JSON.parse(JSON.stringify(GSCM.DEFAULT_SUPPLIERS));
  };

  GSCM.saveSuppliers = function(){
    try { localStorage.setItem(SUPPLIER_KEY, JSON.stringify(GSCM.suppliers)); } catch(e){}
  };

  GSCM.resetSuppliers = function(){
    GSCM.suppliers = JSON.parse(JSON.stringify(GSCM.DEFAULT_SUPPLIERS));
    GSCM.saveSuppliers();
    GSCM.renderSupplierEditor();
    GSCM.updateSupplierCheckboxes();
  };

  GSCM.addSupplier = function(){
    GSCM.suppliers.push({name:'NewSupplier', capA:0, capB:0, costA:0, costB:0, lead:0, setup:0});
    GSCM.saveSuppliers();
    GSCM.renderSupplierEditor();
    GSCM.updateSupplierCheckboxes();
  };

  GSCM.removeSupplier = function(idx){
    if(GSCM.suppliers.length <= 1) return;
    GSCM.suppliers.splice(idx, 1);
    GSCM.saveSuppliers();
    GSCM.renderSupplierEditor();
    GSCM.updateSupplierCheckboxes();
  };

  GSCM.renderSupplierEditor = function(){
    var container = document.getElementById('supplier-editor');
    if(!container) return;

    var html = '<div class="supplier-editor">';
    GSCM.suppliers.forEach(function(sup, i){
      html += '<div class="supplier-card" data-sup-idx="'+i+'">';
      if(GSCM.suppliers.length > 1){
        html += '<button class="supplier-remove-btn" onclick="GSCM.removeSupplier('+i+')" title="Remove supplier">&times;</button>';
      }
      html += '<div class="supplier-fields">';
      html += '<div class="supplier-field name-field"><label>Name</label><input type="text" data-field="name" value="'+escapeAttr(sup.name)+'" onchange="GSCM._onSupField('+i+',\'name\',this.value)"></div>';
      html += '<div class="supplier-field"><label>Cap A (k)</label><input type="number" data-field="capA" value="'+sup.capA+'" step="1" onchange="GSCM._onSupField('+i+',\'capA\',this.value)"></div>';
      html += '<div class="supplier-field"><label>Cap B (k)</label><input type="number" data-field="capB" value="'+sup.capB+'" step="1" onchange="GSCM._onSupField('+i+',\'capB\',this.value)"></div>';
      html += '<div class="supplier-field"><label>Cost A ($)</label><input type="number" data-field="costA" value="'+sup.costA+'" step="1" onchange="GSCM._onSupField('+i+',\'costA\',this.value)"></div>';
      html += '<div class="supplier-field"><label>Cost B ($)</label><input type="number" data-field="costB" value="'+sup.costB+'" step="1" onchange="GSCM._onSupField('+i+',\'costB\',this.value)"></div>';
      html += '<div class="supplier-field"><label>Lead (mo)</label><input type="number" data-field="lead" value="'+sup.lead+'" step="1" onchange="GSCM._onSupField('+i+',\'lead\',this.value)"></div>';
      html += '<div class="supplier-field"><label>Setup ($k/mo)</label><input type="number" data-field="setup" value="'+sup.setup+'" step="1" onchange="GSCM._onSupField('+i+',\'setup\',this.value)"></div>';
      html += '</div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
  };

  GSCM._onSupField = function(idx, field, value){
    if(!GSCM.suppliers[idx]) return;
    if(field === 'name'){
      GSCM.suppliers[idx][field] = value;
    } else {
      GSCM.suppliers[idx][field] = parseFloat(value) || 0;
    }
    GSCM.saveSuppliers();
    GSCM.updateSupplierCheckboxes();
  };

  GSCM.updateSupplierCheckboxes = function(){
    var container = document.getElementById('t3-supplier-checkboxes');
    if(!container) return;

    var html = '';
    GSCM.suppliers.forEach(function(sup, i){
      var id = 't3-sup'+i;
      var checked = i < 2 ? 'checked' : '';
      // Try to preserve existing checked state
      var existing = document.getElementById(id);
      if(existing){
        checked = existing.checked ? 'checked' : '';
      }
      html += '<div class="tool-checkbox-row">';
      html += '<input type="checkbox" id="'+id+'" '+checked+'>';
      html += '<label for="'+id+'"><strong>'+escapeHtml(sup.name)+'</strong> &mdash; Cap A: '+sup.capA+'k, B: '+sup.capB+'k &middot; Cost A: $'+sup.costA+', B: $'+sup.costB+' &middot; Lead: '+sup.lead+' mo &middot; Setup: $'+sup.setup+'k/mo</label>';
      html += '</div>';
    });
    container.innerHTML = html;
  };

  function escapeAttr(s){
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function escapeHtml(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
})();
