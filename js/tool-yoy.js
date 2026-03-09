/* ── tool-yoy.js ─ Year-over-Year Performance Tracker (persistent history) ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};
  var fmtR=GSCM.fmtR, fmtPct=GSCM.fmtPct, fmtQ=GSCM.fmtQ, fmtMoneyK=GSCM.fmtMoneyK;

  var STORAGE_KEY = 'gscm-yoy-history';
  GSCM.yoyHistory = [];
  GSCM._yoyEditIdx = -1;

  /* ── Storage ── */
  GSCM.loadYoYHistory = function(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      GSCM.yoyHistory = raw ? JSON.parse(raw) : [];
    } catch(e) { GSCM.yoyHistory = []; }
  };

  GSCM.saveYoYHistory = function(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(GSCM.yoyHistory)); } catch(e){}
  };

  GSCM.resetYoYHistory = function(){
    GSCM.yoyHistory = [];
    GSCM._yoyEditIdx = -1;
    try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
    _clearForm();
    _updateLabel();
    GSCM.renderYoYHistory();
    var rp = document.getElementById('result-yoy');
    if(rp){ rp.innerHTML=''; rp.classList.remove('visible'); }
  };

  /* ── Helpers ── */
  function _clearForm(){
    ['t5-fc','t5-act','t5-prod','t5-sold','t5-prof'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.value='';
    });
    GSCM._yoyEditIdx = -1;
  }

  function _updateLabel(){
    var lbl = document.getElementById('yoy-entry-label');
    if(!lbl) return;
    if(GSCM._yoyEditIdx >= 0){
      lbl.textContent = 'Year ' + (GSCM._yoyEditIdx + 1) + ' (editing)';
    } else {
      lbl.textContent = 'Year ' + (GSCM.yoyHistory.length + 1);
    }
  }

  /* ── Save / Edit / Delete ── */
  GSCM.saveYoYYear = function(){
    var fc  = parseFloat(document.getElementById('t5-fc').value)  || 0;
    var act = parseFloat(document.getElementById('t5-act').value) || 0;
    var prod= parseFloat(document.getElementById('t5-prod').value)|| 0;
    var sold= parseFloat(document.getElementById('t5-sold').value)|| 0;
    var prof= parseFloat(document.getElementById('t5-prof').value)|| 0;

    if(fc===0 && act===0 && prod===0 && sold===0 && prof===0) return;

    var entry = { fc:fc, act:act, prod:prod, sold:sold, prof:prof };

    if(GSCM._yoyEditIdx >= 0 && GSCM._yoyEditIdx < GSCM.yoyHistory.length){
      GSCM.yoyHistory[GSCM._yoyEditIdx] = entry;
    } else {
      GSCM.yoyHistory.push(entry);
    }

    GSCM.saveYoYHistory();
    _clearForm();
    _updateLabel();
    GSCM.renderYoYHistory();
  };

  GSCM.editYoYYear = function(idx){
    if(idx < 0 || idx >= GSCM.yoyHistory.length) return;
    var y = GSCM.yoyHistory[idx];
    document.getElementById('t5-fc').value   = y.fc;
    document.getElementById('t5-act').value  = y.act;
    document.getElementById('t5-prod').value = y.prod;
    document.getElementById('t5-sold').value = y.sold;
    document.getElementById('t5-prof').value = y.prof;
    GSCM._yoyEditIdx = idx;
    _updateLabel();
    document.getElementById('t5-fc').focus();
  };

  GSCM.deleteYoYYear = function(idx){
    if(idx < 0 || idx >= GSCM.yoyHistory.length) return;
    GSCM.yoyHistory.splice(idx, 1);
    GSCM.saveYoYHistory();
    if(GSCM._yoyEditIdx === idx) { GSCM._yoyEditIdx = -1; _clearForm(); }
    else if(GSCM._yoyEditIdx > idx) { GSCM._yoyEditIdx--; }
    _updateLabel();
    GSCM.renderYoYHistory();
  };

  /* ── Render History Table ── */
  GSCM.renderYoYHistory = function(){
    var container = document.getElementById('yoy-history-container');
    if(!container) return;

    if(GSCM.yoyHistory.length === 0){
      container.innerHTML = '<p style="color:var(--text-dim);font-size:0.85rem;font-style:italic;">No saved years yet. Enter data above and click Save Year.</p>';
      return;
    }

    var html = '<table class="combo-table"><thead><tr>';
    html += '<th>Year</th><th>Forecast</th><th>Actual</th><th>Produced</th><th>Sold</th><th>Profit</th><th>A/F</th><th>Actions</th>';
    html += '</tr></thead><tbody>';

    GSCM.yoyHistory.forEach(function(y, i){
      var af = y.fc > 0 ? (y.act / y.fc) : 0;
      var afColor = (af < 0.9 || af > 1.1) ? 'color:var(--red);font-weight:700;' : '';
      html += '<tr>';
      html += '<td>Year ' + (i+1) + '</td>';
      html += '<td>' + fmtQ(y.fc) + '</td>';
      html += '<td>' + fmtQ(y.act) + '</td>';
      html += '<td>' + fmtQ(y.prod) + '</td>';
      html += '<td>' + fmtQ(y.sold) + '</td>';
      html += '<td>' + fmtMoneyK(y.prof) + '</td>';
      html += '<td style="' + afColor + '">' + fmtR(af) + '</td>';
      html += '<td><button class="yoy-action-btn yoy-edit-btn" onclick="GSCM.editYoYYear('+i+')" title="Edit">&#9998;</button>';
      html += '<button class="yoy-action-btn yoy-delete-btn" onclick="GSCM.deleteYoYYear('+i+')" title="Delete">&times;</button></td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  };

  /* ── Analysis ── */
  GSCM.calcYoY = function(){
    var years = [];
    GSCM.yoyHistory.forEach(function(y, i){
      years.push({ year: i+1, fc:y.fc, act:y.act, prod:y.prod, sold:y.sold, prof:y.prof });
    });

    if(years.length === 0){
      var rp = document.getElementById('result-yoy');
      rp.innerHTML = '<h4 style="color:var(--red);">&#9888; No saved years to analyze. Save at least one year first.</h4>';
      rp.classList.add('visible');
      return;
    }

    var html = '<h4>&#128202; Year-over-Year Analysis</h4>';

    // Per-year metrics
    var cumFC=0, cumAct=0;
    html += '<table class="combo-table"><thead><tr><th>Year</th><th>A/F Ratio</th><th>Cumul. A/F</th><th>Utilization</th><th>Profit</th></tr></thead><tbody>';
    years.forEach(function(y){
      var af = y.fc>0 ? (y.act/y.fc) : 0;
      cumFC += y.fc; cumAct += y.act;
      var cumAF = cumFC>0 ? (cumAct/cumFC) : 0;
      var util = y.prod>0 ? (y.sold/y.prod) : 0;
      var cls = af>=0.9 && af<=1.1 ? '' : 'style="color:'+(af>1.1?'var(--green)':'var(--red)')+'"';
      html += '<tr><td>Year '+y.year+'</td>';
      html += '<td '+cls+'>'+fmtR(af)+'</td>';
      html += '<td>'+fmtR(cumAF)+'</td>';
      html += '<td>'+fmtPct(util)+'</td>';
      html += '<td>'+fmtMoneyK(y.prof)+'</td></tr>';
    });
    html += '</tbody></table>';

    // Bias detection
    var totalFC=0, totalAct=0;
    years.forEach(function(y){ totalFC+=y.fc; totalAct+=y.act; });
    var overallAF = totalFC>0 ? (totalAct/totalFC) : 1;
    var bias = overallAF - 1;
    if(Math.abs(bias) > 0.02){
      if(bias > 0){
        html += '<div class="verdict verdict-below" style="font-size:0.85rem;padding:0.6rem;margin-top:0.8rem;">&#9888; You tend to <strong>under-forecast</strong> by ~'+fmtPct(Math.abs(bias))+'. Actual demand exceeds forecasts.</div>';
      } else {
        html += '<div class="verdict verdict-above" style="font-size:0.85rem;padding:0.6rem;margin-top:0.8rem;">&#9888; You tend to <strong>over-forecast</strong> by ~'+fmtPct(Math.abs(bias))+'. Consider reducing next forecast.</div>';
      }
    } else {
      html += '<div class="verdict verdict-on" style="font-size:0.85rem;padding:0.6rem;margin-top:0.8rem;">&#9989; Forecasts are well-calibrated (bias &lt; 2%).</div>';
    }

    // Trend & recommendation
    if(years.length >= 2){
      var last = years[years.length-1];
      var prev = years[years.length-2];
      var trend = (prev.act>0) ? ((last.act-prev.act)/prev.act) : 0;
      var recommended = last.act * (1 + trend);
      html += '<div class="result-row" style="margin-top:0.8rem;"><span class="result-label">YoY demand trend</span><span class="result-value">'+(trend>=0?'+':'')+fmtPct(trend)+'</span></div>';
      html += '<div class="result-row"><span class="result-label">Suggested next-year forecast</span><span class="result-value" style="color:var(--cyan);">'+fmtQ(recommended)+'k</span></div>';
    }

    // Profit bar chart
    var maxProf = 0;
    years.forEach(function(y){ if(Math.abs(y.prof)>maxProf) maxProf=Math.abs(y.prof); });
    if(maxProf > 0){
      html += '<h4 style="margin-top:1rem;">Profit by Year</h4>';
      html += '<div class="bar-chart">';
      var colors = ['var(--accent)','var(--green)','var(--purple)','var(--orange)'];
      years.forEach(function(y, idx){
        var pct = Math.max(4, Math.abs(y.prof)/maxProf*100);
        html += '<div class="bar-wrapper">';
        html += '<div class="bar-value">'+fmtMoneyK(y.prof)+'</div>';
        html += '<div class="bar" style="height:'+pct+'%;background:'+colors[idx%4]+';"></div>';
        html += '<div class="bar-label">Y'+y.year+'</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    var rp = document.getElementById('result-yoy');
    rp.innerHTML = html;
    rp.classList.add('visible');
  };
})();
