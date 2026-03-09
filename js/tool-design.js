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

    // Read all 4 options
    var opts=[];
    for(var i=0;i<4;i++){
      var name=document.getElementById('t1-opt'+i+'-name').value || ('Option '+(i+1));
      var dA=parseFloat(document.getElementById('t1-opt'+i+'-dA').value)||0;
      var dB=parseFloat(document.getElementById('t1-opt'+i+'-dB').value)||0;
      var pA=parseFloat(document.getElementById('t1-opt'+i+'-pA').value)||0;
      var pB=parseFloat(document.getElementById('t1-opt'+i+'-pB').value)||0;
      opts.push({name:name, dA:dA, dB:dB, pA:pA, pB:pB, idx:i});
    }

    // Filter out options with no data entered (all zeros and no name typed)
    var filled=[];
    for(var f=0;f<4;f++){
      var o=opts[f];
      var hasName=document.getElementById('t1-opt'+f+'-name').value.trim()!=='';
      var hasData=o.dA!==0||o.dB!==0||o.pA!==0||o.pB!==0;
      if(hasName||hasData) filled.push(o);
    }

    if(filled.length===0){
      var rp=document.getElementById('result-design');
      rp.innerHTML='<h4 style="color:var(--red);">&#9888; Enter data for at least one design option.</h4>';
      rp.classList.add('visible');
      return;
    }

    // ── Individual option analysis ──
    var singles=[];
    for(var j=0;j<filled.length;j++){
      var opt=filled[j];
      var newProfitA=(baseDA+opt.dA)*(baseProfA+opt.pA);
      var newProfitB=(baseDB+opt.dB)*(baseProfB+opt.pB);
      var impact=newProfitA+newProfitB-baseProfit;
      singles.push({name:opt.name, impact:impact, idx:opt.idx});
    }
    singles.sort(function(a,b){ return b.impact-a.impact; });

    var html='<h4>&#128202; Individual Option Impact</h4>';
    html+='<div style="margin-bottom:0.5rem;font-size:0.82rem;color:var(--text-dim);">Baseline monthly profit: '+fmtMoney(baseProfit/1000)+'M ('+fmtQ(baseDA)+'k&times;$'+fmtD(baseProfA)+' + '+fmtQ(baseDB)+'k&times;$'+fmtD(baseProfB)+')</div>';

    for(var s=0;s<singles.length;s++){
      var r=singles[s];
      var cls=r.impact>=0?'positive':'negative';
      html+='<div class="result-row"><span class="result-label">'+r.name+'</span><span class="result-value '+cls+'">'+
        (r.impact>=0?'+':'')+fmtMoney(r.impact/1000)+'k/mo</span></div>';
    }

    // ── Combination analysis (all non-empty subsets) ──
    var nf=filled.length;
    var combos=[];
    for(var mask=1;mask<(1<<nf);mask++){
      var comboNames=[], totalDA=0, totalDB=0, totalPA=0, totalPB=0, count=0;
      for(var b=0;b<nf;b++){
        if(mask&(1<<b)){
          comboNames.push(filled[b].name);
          totalDA+=filled[b].dA;
          totalDB+=filled[b].dB;
          totalPA+=filled[b].pA;
          totalPB+=filled[b].pB;
          count++;
        }
      }
      var comboProfA=(baseDA+totalDA)*(baseProfA+totalPA);
      var comboProfB=(baseDB+totalDB)*(baseProfB+totalPB);
      var comboImpact=comboProfA+comboProfB-baseProfit;
      combos.push({
        name:comboNames.join(' + '),
        impact:comboImpact,
        count:count,
        profA:comboProfA,
        profB:comboProfB
      });
    }
    combos.sort(function(a,b){ return b.impact-a.impact; });

    html+='<hr class="tool-divider">';
    html+='<h4>&#127942; All Combinations Ranked</h4>';
    html+='<div style="margin-bottom:0.5rem;font-size:0.82rem;color:var(--text-dim);">'+combos.length+' combinations from '+nf+' options (includes singles and combos)</div>';
    html+='<div class="ranking-list">';
    for(var k=0;k<combos.length;k++){
      var c=combos[k];
      var verdictCls=c.impact>=0?'positive':'negative';
      var badge=c.count>1?' <span style="font-size:0.7rem;color:var(--text-dim);">('+c.count+' features)</span>':'';
      html+='<div class="ranking-item"><span class="rank">'+(k+1)+'</span><span class="rank-name">'+c.name+badge+'</span>'+
        '<span class="rank-value '+verdictCls+'">'+(c.impact>=0?'+':'')+fmtMoney(c.impact/1000)+'k/mo</span></div>';
    }
    html+='</div>';

    var best=combos[0];
    if(best.impact>0){
      html+='<div class="verdict verdict-add">&#9989; Best Combo: '+best.name+' &mdash; +'+fmtMoney(best.impact/1000)+'k/mo</div>';
    } else {
      html+='<div class="verdict verdict-skip">&#9888; No combination increases profit. Consider skipping all.</div>';
    }

    var rp=document.getElementById('result-design');
    rp.innerHTML=html;
    rp.classList.add('visible');
  };
})();
