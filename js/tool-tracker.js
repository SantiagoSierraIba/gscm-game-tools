/* ── tool-tracker.js ─ Mid-Season Demand Tracker ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};
  var fmtQ=GSCM.fmtQ, fmtR=GSCM.fmtR, fmtPct=GSCM.fmtPct;

  GSCM.calcTracker = function(){
    var fcstA=parseFloat(document.getElementById('t4-fcstA').value)||0;
    var fcstB=parseFloat(document.getElementById('t4-fcstB').value)||0;
    var farCommitA=parseFloat(document.getElementById('t4-farCommitA').value)||0;
    var farCommitB=parseFloat(document.getElementById('t4-farCommitB').value)||0;
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

    // Identify close suppliers (lead <= 1) from GSCM.suppliers
    var suppliers=GSCM.suppliers||[];
    var closeSups=[];
    for(var s=0;s<suppliers.length;s++){
      if(suppliers[s].lead<=1) closeSups.push(suppliers[s]);
    }
    // Sort close suppliers by cost (cheapest first for A)
    closeSups.sort(function(a,b){return a.costA-b.costA;});

    function analyze(vals,fcst,farCommit,label,modelKey){
      if(vals.length===0) return '<p style="color:var(--text-dim);">No data for '+label+'</p>';
      var sum=0; vals.forEach(function(v){sum+=v.v;});
      var avg=sum/vals.length;
      var afRatio=fcst>0?avg/fcst:0;
      var remaining=8-vals.length;

      var html2='<div class="tool-col-header">'+label+'</div>';
      html2+='<div class="result-row"><span class="result-label">Months observed</span><span class="result-value">'+vals.length+'</span></div>';
      html2+='<div class="result-row"><span class="result-label">Running avg demand</span><span class="result-value">'+fmtQ(avg)+'k/mo</span></div>';
      html2+='<div class="result-row"><span class="result-label">Your demand forecast (&mu;)</span><span class="result-value">'+fmtQ(fcst)+'k/mo</span></div>';
      html2+='<div class="result-row"><span class="result-label">A/F Ratio</span><span class="result-value '+(afRatio>=1?'positive':'negative')+'">'+fmtR(afRatio)+'</span></div>';

      // Verdict
      var verdictCls,verdictTxt;
      if(afRatio>=0.9&&afRatio<=1.1){verdictCls='verdict-on';verdictTxt='&#9989; On Track (A/F = '+fmtR(afRatio)+')';}
      else if(afRatio>1.1&&afRatio<=1.3){verdictCls='verdict-above';verdictTxt='&#9650; Above Forecast (+'+fmtPct(afRatio-1)+')';}
      else if(afRatio>=0.7&&afRatio<0.9){verdictCls='verdict-below';verdictTxt='&#9660; Below Forecast ('+fmtPct(afRatio-1)+')';}
      else if(afRatio>1.3){verdictCls='verdict-above';verdictTxt='&#9650;&#9650; Significantly Above (+'+fmtPct(afRatio-1)+')';}
      else{verdictCls='verdict-below';verdictTxt='&#9660;&#9660; Significantly Below ('+fmtPct(afRatio-1)+')';}
      html2+='<div class="verdict '+verdictCls+'" style="font-size:0.85rem;padding:0.5rem;margin-top:0.5rem;">'+verdictTxt+'</div>';

      // ── Supplier order recommendation ──
      if(remaining>0){
        var updatedDemand=avg; // best estimate of future monthly demand
        var gap=updatedDemand-farCommit;

        html2+='<div style="margin-top:0.8rem;padding:0.7rem;background:var(--card-bg);border:1px solid var(--border);border-radius:8px;">';
        html2+='<div style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-dim);margin-bottom:0.4rem;">&#128666; Close-Supplier Order for Remaining '+remaining+' Months</div>';
        html2+='<div class="result-row"><span class="result-label">Updated demand estimate</span><span class="result-value" style="color:var(--cyan);">'+fmtQ(updatedDemand)+'k/mo</span></div>';
        html2+='<div class="result-row"><span class="result-label">Far supplier committed</span><span class="result-value">'+fmtQ(farCommit)+'k/mo</span></div>';
        html2+='<div class="result-row"><span class="result-label">Gap to fill (close suppliers)</span><span class="result-value '+(gap>0?'positive':'negative')+'">'+fmtQ(gap)+'k/mo</span></div>';

        if(gap>0.01&&closeSups.length>0){
          var remainGap=gap;
          html2+='<div style="margin-top:0.5rem;font-size:0.88rem;">';
          html2+='<strong>Order per month:</strong>';
          for(var cs=0;cs<closeSups.length;cs++){
            var sup=closeSups[cs];
            var capKey=modelKey==='A'?'capA':'capB';
            var costKey=modelKey==='A'?'costA':'costB';
            var alloc=Math.min(remainGap,sup[capKey]);
            if(alloc>0.01){
              html2+='<div class="result-row" style="margin-top:0.2rem;">';
              html2+='<span class="result-label" style="padding-left:0.5rem;">&#8594; '+sup.name+' <span style="font-size:0.75rem;color:var(--text-dim);">(cap: '+fmtQ(sup[capKey])+'k, $'+sup[costKey]+'/unit, lead: '+sup.lead+'mo)</span></span>';
              html2+='<span class="result-value" style="color:var(--cyan);font-weight:700;">'+fmtQ(alloc)+'k</span>';
              html2+='</div>';
              remainGap-=alloc;
            }
            if(remainGap<=0.01) break;
          }
          if(remainGap>0.01){
            html2+='<div style="color:var(--red);font-size:0.85rem;margin-top:0.3rem;">&#9888; Remaining unmet gap: '+fmtQ(remainGap)+'k/mo &mdash; not enough close-supplier capacity!</div>';
          }
          html2+='</div>';
        } else if(gap<=0.01){
          html2+='<div style="color:var(--green);font-size:0.88rem;margin-top:0.3rem;">&#9989; Far supplier already covers demand. No close-supplier order needed.</div>';
        } else {
          html2+='<div style="color:var(--red);font-size:0.85rem;margin-top:0.3rem;">&#9888; No close suppliers configured (lead &le; 1 month). Add them in Supplier Configuration above.</div>';
        }
        html2+='</div>';
      }

      return html2;
    }

    var html='<h4>&#128202; Demand Tracking Analysis</h4>';
    html+='<div class="tool-grid-2">';
    html+='<div class="tool-col">'+analyze(valsA,fcstA,farCommitA,'Model A','A')+'</div>';
    html+='<div class="tool-col">'+analyze(valsB,fcstB,farCommitB,'Model B','B')+'</div>';
    html+='</div>';

    var rp=document.getElementById('result-tracker');
    rp.innerHTML=html;
    rp.classList.add('visible');
  };
})();
