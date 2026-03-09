/* ── tool-tracker.js ─ Mid-Season Demand Tracker ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};
  var fmtQ=GSCM.fmtQ, fmtR=GSCM.fmtR, fmtPct=GSCM.fmtPct;

  GSCM.calcTracker = function(){
    var fcstA=parseFloat(document.getElementById('t4-fcstA').value)||0;
    var fcstB=parseFloat(document.getElementById('t4-fcstB').value)||0;
    var months=['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    var valsA=[],valsB=[];
    for(var i=0;i<8;i++){
      var a=document.getElementById('t4-m'+i+'A').value;
      var b=document.getElementById('t4-m'+i+'B').value;
      if(a!==''&&a!==null&&!isNaN(parseFloat(a))) valsA.push({m:months[i],v:parseFloat(a)});
      if(b!==''&&b!==null&&!isNaN(parseFloat(b))) valsB.push({m:months[i],v:parseFloat(b)});
    }

    if(valsA.length===0&&valsB.length===0){
      var rp=document.getElementById('result-tracker');
      rp.innerHTML='<h4 style="color:var(--red);">&#9888; Enter at least one month of actual demand data.</h4>';
      rp.classList.add('visible');
      return;
    }

    function analyze(vals,fcst,label){
      if(vals.length===0) return '<p style="color:var(--text-dim);">No data for '+label+'</p>';
      var sum=0; vals.forEach(function(v){sum+=v.v;});
      var avg=sum/vals.length;
      var afRatio=avg/fcst;
      var remaining=8-vals.length;

      var html2='<div class="tool-col-header">'+label+'</div>';
      html2+='<div class="result-row"><span class="result-label">Months observed</span><span class="result-value">'+vals.length+'</span></div>';
      html2+='<div class="result-row"><span class="result-label">Running avg demand</span><span class="result-value">'+fmtQ(avg)+'k/mo</span></div>';
      html2+='<div class="result-row"><span class="result-label">Original forecast</span><span class="result-value">'+fmtQ(fcst)+'k/mo</span></div>';
      html2+='<div class="result-row"><span class="result-label">A/F Ratio</span><span class="result-value '+(afRatio>=1?'positive':'negative')+'">'+fmtR(afRatio)+'</span></div>';
      if(remaining>0){
        html2+='<div class="result-row"><span class="result-label">Updated forecast (remaining '+remaining+' mo)</span><span class="result-value" style="color:var(--cyan);">'+fmtQ(avg)+'k/mo</span></div>';
        html2+='<div class="result-row"><span class="result-label">Recommended close-supplier order</span><span class="result-value" style="color:var(--cyan);">'+fmtQ(avg)+'k</span></div>';
      }

      var verdictCls,verdictTxt;
      if(afRatio>=0.9&&afRatio<=1.1){verdictCls='verdict-on';verdictTxt='&#9989; On Track (A/F = '+fmtR(afRatio)+')';}
      else if(afRatio>1.1&&afRatio<=1.3){verdictCls='verdict-above';verdictTxt='&#9650; Slightly Above Forecast (+'+fmtPct(afRatio-1)+')';}
      else if(afRatio>=0.7&&afRatio<0.9){verdictCls='verdict-below';verdictTxt='&#9660; Slightly Below Forecast ('+fmtPct(afRatio-1)+')';}
      else if(afRatio>1.3){verdictCls='verdict-above';verdictTxt='&#9650;&#9650; Significantly Above Forecast (+'+fmtPct(afRatio-1)+')';}
      else{verdictCls='verdict-below';verdictTxt='&#9660;&#9660; Significantly Below Forecast ('+fmtPct(afRatio-1)+')';}
      html2+='<div class="verdict '+verdictCls+'" style="font-size:0.85rem;padding:0.5rem;margin-top:0.5rem;">'+verdictTxt+'</div>';
      return html2;
    }

    var html='<h4>&#128202; Demand Tracking Analysis</h4>';
    html+='<div class="tool-grid-2">';
    html+='<div class="tool-col">'+analyze(valsA,fcstA,'Model A')+'</div>';
    html+='<div class="tool-col">'+analyze(valsB,fcstB,'Model B')+'</div>';
    html+='</div>';

    var rp=document.getElementById('result-tracker');
    rp.innerHTML=html;
    rp.classList.add('visible');
  };
})();
