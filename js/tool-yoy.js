/* ── tool-yoy.js ─ Year-over-Year Performance Tracker ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};
  var fmtR=GSCM.fmtR, fmtPct=GSCM.fmtPct, fmtQ=GSCM.fmtQ, fmtMoneyK=GSCM.fmtMoneyK;

  GSCM.calcYoY = function(){
    var years=[];
    for(var i=0;i<4;i++){
      var fc=document.getElementById('t5-y'+i+'-fc').value;
      var act=document.getElementById('t5-y'+i+'-act').value;
      var prod=document.getElementById('t5-y'+i+'-prod').value;
      var sold=document.getElementById('t5-y'+i+'-sold').value;
      var prof=document.getElementById('t5-y'+i+'-prof').value;
      if(fc===''&&act===''&&prod===''&&sold===''&&prof==='') continue;
      years.push({
        year:i+1,
        fc:parseFloat(fc)||0,
        act:parseFloat(act)||0,
        prod:parseFloat(prod)||0,
        sold:parseFloat(sold)||0,
        prof:parseFloat(prof)||0
      });
    }

    if(years.length===0){
      var rp=document.getElementById('result-yoy');
      rp.innerHTML='<h4 style="color:var(--red);">&#9888; Enter data for at least one year.</h4>';
      rp.classList.add('visible');
      return;
    }

    var html='<h4>&#128202; Year-over-Year Analysis</h4>';

    // Per-year metrics
    var cumFC=0,cumAct=0;
    html+='<table class="combo-table"><thead><tr><th>Year</th><th>A/F Ratio</th><th>Cumul. A/F</th><th>Utilization</th><th>Profit</th></tr></thead><tbody>';
    years.forEach(function(y){
      var af=y.fc>0?(y.act/y.fc):0;
      cumFC+=y.fc; cumAct+=y.act;
      var cumAF=cumFC>0?(cumAct/cumFC):0;
      var util=y.prod>0?(y.sold/y.prod):0;
      var cls=af>=0.9&&af<=1.1?'':'style="color:'+(af>1.1?'var(--green)':'var(--red)')+'"';
      html+='<tr><td>Year '+y.year+'</td>';
      html+='<td '+cls+'>'+fmtR(af)+'</td>';
      html+='<td>'+fmtR(cumAF)+'</td>';
      html+='<td>'+fmtPct(util)+'</td>';
      html+='<td>'+fmtMoneyK(y.prof)+'</td></tr>';
    });
    html+='</tbody></table>';

    // Bias detection
    var totalFC=0,totalAct=0;
    years.forEach(function(y){totalFC+=y.fc;totalAct+=y.act;});
    var overallAF=totalFC>0?(totalAct/totalFC):1;
    var bias=overallAF-1;
    if(Math.abs(bias)>0.02){
      if(bias>0){
        html+='<div class="verdict verdict-below" style="font-size:0.85rem;padding:0.6rem;margin-top:0.8rem;">&#9888; You tend to <strong>under-forecast</strong> by ~'+fmtPct(Math.abs(bias))+'. Actual demand exceeds forecasts.</div>';
      } else {
        html+='<div class="verdict verdict-above" style="font-size:0.85rem;padding:0.6rem;margin-top:0.8rem;">&#9888; You tend to <strong>over-forecast</strong> by ~'+fmtPct(Math.abs(bias))+'. Consider reducing next forecast.</div>';
      }
    } else {
      html+='<div class="verdict verdict-on" style="font-size:0.85rem;padding:0.6rem;margin-top:0.8rem;">&#9989; Forecasts are well-calibrated (bias &lt; 2%).</div>';
    }

    // Trend & recommendation
    if(years.length>=2){
      var last=years[years.length-1];
      var prev=years[years.length-2];
      var trend=(prev.act>0)?((last.act-prev.act)/prev.act):0;
      var recommended=last.act*(1+trend);
      html+='<div class="result-row" style="margin-top:0.8rem;"><span class="result-label">YoY demand trend</span><span class="result-value">'+(trend>=0?'+':'')+fmtPct(trend)+'</span></div>';
      html+='<div class="result-row"><span class="result-label">Suggested next-year forecast</span><span class="result-value" style="color:var(--cyan);">'+fmtQ(recommended)+'k</span></div>';
    }

    // Profit bar chart
    var maxProf=0;
    years.forEach(function(y){if(Math.abs(y.prof)>maxProf) maxProf=Math.abs(y.prof);});
    if(maxProf>0){
      html+='<h4 style="margin-top:1rem;">Profit by Year</h4>';
      html+='<div class="bar-chart">';
      var colors=['var(--accent)','var(--green)','var(--purple)','var(--orange)'];
      years.forEach(function(y,idx){
        var pct=Math.max(4,Math.abs(y.prof)/maxProf*100);
        html+='<div class="bar-wrapper">';
        html+='<div class="bar-value">'+fmtMoneyK(y.prof)+'</div>';
        html+='<div class="bar" style="height:'+pct+'%;background:'+colors[idx%4]+';"></div>';
        html+='<div class="bar-label">Y'+y.year+'</div>';
        html+='</div>';
      });
      html+='</div>';
    }

    var rp=document.getElementById('result-yoy');
    rp.innerHTML=html;
    rp.classList.add('visible');
  };
})();
