/* ── tool-design.js ─ Design Room Calculator ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};
  var fmtD=GSCM.fmtD, fmtQ=GSCM.fmtQ, fmtMoney=GSCM.fmtMoney;

  GSCM.calcDesign = function(){
    var baseDA=parseFloat(document.getElementById('t1-baseDA').value)||0;
    var baseDB=parseFloat(document.getElementById('t1-baseDB').value)||0;
    var baseProfA=parseFloat(document.getElementById('t1-baseProfA').value)||0;
    var baseProfB=parseFloat(document.getElementById('t1-baseProfB').value)||0;
    var baseProfit = baseDA*baseProfA + baseDB*baseProfB;

    var results=[];
    for(var i=0;i<4;i++){
      var name=document.getElementById('t1-opt'+i+'-name').value || ('Option '+(i+1));
      var dA=parseFloat(document.getElementById('t1-opt'+i+'-dA').value)||0;
      var dB=parseFloat(document.getElementById('t1-opt'+i+'-dB').value)||0;
      var pA=parseFloat(document.getElementById('t1-opt'+i+'-pA').value)||0;
      var pB=parseFloat(document.getElementById('t1-opt'+i+'-pB').value)||0;

      var newProfitA=(baseDA+dA)*(baseProfA+pA);
      var newProfitB=(baseDB+dB)*(baseProfB+pB);
      var newTotal=newProfitA+newProfitB;
      var impact=newTotal-baseProfit;
      results.push({name:name, impact:impact, profA:newProfitA, profB:newProfitB, idx:i});
    }

    results.sort(function(a,b){ return b.impact-a.impact; });

    var html='<h4>&#128202; Results &mdash; Monthly Profit Impact</h4>';
    html+='<div style="margin-bottom:0.5rem;font-size:0.82rem;color:var(--text-dim);">Baseline monthly profit: '+fmtMoney(baseProfit/1000)+'M ('+fmtQ(baseDA)+'k&times;$'+fmtD(baseProfA)+' + '+fmtQ(baseDB)+'k&times;$'+fmtD(baseProfB)+')</div>';

    for(var j=0;j<results.length;j++){
      var r=results[j];
      var cls=r.impact>=0?'positive':'negative';
      html+='<div class="result-row"><span class="result-label">'+r.name+'</span><span class="result-value '+cls+'">'+
        (r.impact>=0?'+':'')+fmtMoney(r.impact/1000)+'k/mo</span></div>';
    }

    html+='<hr class="tool-divider">';
    html+='<div class="ranking-list">';
    for(var k=0;k<results.length;k++){
      var r2=results[k];
      var verdictCls=r2.impact>=0?'positive':'negative';
      var verdictTxt=r2.impact>=0?'ADD':'SKIP';
      html+='<div class="ranking-item"><span class="rank">'+(k+1)+'</span><span class="rank-name">'+r2.name+'</span>'+
        '<span class="rank-value '+verdictCls+'">'+(r2.impact>=0?'+':'')+fmtMoney(r2.impact/1000)+'k &mdash; '+verdictTxt+'</span></div>';
    }
    html+='</div>';

    var best=results[0];
    if(best.impact>0){
      html+='<div class="verdict verdict-add">&#9989; Top Pick: '+best.name+' &mdash; +'+ fmtMoney(best.impact/1000)+'k/mo</div>';
    } else {
      html+='<div class="verdict verdict-skip">&#9888; No option increases profit. Consider skipping all.</div>';
    }

    var rp=document.getElementById('result-design');
    rp.innerHTML=html;
    rp.classList.add('visible');
  };
})();
