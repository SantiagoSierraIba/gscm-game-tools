/* ── tool-design.js ─ Design Room Calculator (with Newsvendor mode) ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};
  var fmtD=GSCM.fmtD, fmtQ=GSCM.fmtQ, fmtMoney=GSCM.fmtMoney;

  /* ── Newsvendor expected profit helper ── */
  function nvExpProfit(mu, sigma, cu, co){
    // mu & sigma in k/mo, cu & co in $/unit → result in $k/mo
    if(sigma<=0||(cu+co)<=0) return cu*mu; // deterministic fallback
    var CR=cu/(cu+co);
    var zStar=GSCM.normalInvCDF(CR);
    var Lz=GSCM.lossFunction(zStar);
    var expSales=mu-sigma*Lz;
    var expLeftover=(mu+zStar*sigma)-expSales;
    return cu*expSales-co*expLeftover;
  }

  /* ── Read a numeric input, return NaN if blank ── */
  function readOpt(id){
    var el=document.getElementById(id);
    if(!el) return NaN;
    var v=el.value.trim();
    return v===''?NaN:parseFloat(v);
  }

  GSCM.calcDesign = function(){
    var baseDA=parseFloat(document.getElementById('t1-baseDA').value)||0;
    var baseDB=parseFloat(document.getElementById('t1-baseDB').value)||0;
    var baseProfA=parseFloat(document.getElementById('t1-baseProfA').value)||0;
    var baseProfB=parseFloat(document.getElementById('t1-baseProfB').value)||0;
    var baseProfit = baseDA*baseProfA + baseDB*baseProfB;

    // ── Uncertainty baseline inputs ──
    var baseSigA=readOpt('t1-baseSigA');
    var baseSigB=readOpt('t1-baseSigB');
    var coA=readOpt('t1-coA');
    var coB=readOpt('t1-coB');
    var nvMode=!isNaN(baseSigA)&&!isNaN(baseSigB)&&!isNaN(coA)&&!isNaN(coB)&&(baseSigA>0||baseSigB>0);

    var baseNVProfit=0;
    if(nvMode){
      // Cu = profit per unit (baseProfA/B already represents Cu)
      baseNVProfit=nvExpProfit(baseDA,Math.max(baseSigA,0),baseProfA,coA)
                  +nvExpProfit(baseDB,Math.max(baseSigB,0),baseProfB,coB);
    }

    // Read all 4 options
    var opts=[];
    for(var i=0;i<4;i++){
      var name=document.getElementById('t1-opt'+i+'-name').value || ('Option '+(i+1));
      var dA=parseFloat(document.getElementById('t1-opt'+i+'-dA').value)||0;
      var dB=parseFloat(document.getElementById('t1-opt'+i+'-dB').value)||0;
      var pA=parseFloat(document.getElementById('t1-opt'+i+'-pA').value)||0;
      var pB=parseFloat(document.getElementById('t1-opt'+i+'-pB').value)||0;
      var sigA=readOpt('t1-opt'+i+'-sigA');
      var sigB=readOpt('t1-opt'+i+'-sigB');
      opts.push({name:name, dA:dA, dB:dB, pA:pA, pB:pB, sigA:sigA, sigB:sigB, idx:i});
    }

    // Filter out options with no data entered
    var filled=[];
    for(var f=0;f<4;f++){
      var o=opts[f];
      var hasName=document.getElementById('t1-opt'+f+'-name').value.trim()!=='';
      var hasData=o.dA!==0||o.dB!==0||o.pA!==0||o.pB!==0||!isNaN(o.sigA)||!isNaN(o.sigB);
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
      var detImpact=newProfitA+newProfitB-baseProfit;
      var nvImpact=null;
      if(nvMode){
        var sA=isNaN(opt.sigA)?baseSigA:opt.sigA;
        var sB=isNaN(opt.sigB)?baseSigB:opt.sigB;
        var nvProf=nvExpProfit(baseDA+opt.dA,Math.max(sA,0),baseProfA+opt.pA,coA)
                  +nvExpProfit(baseDB+opt.dB,Math.max(sB,0),baseProfB+opt.pB,coB);
        nvImpact=nvProf-baseNVProfit;
      }
      singles.push({name:opt.name, detImpact:detImpact, nvImpact:nvImpact, idx:opt.idx});
    }
    singles.sort(function(a,b){
      var va=a.nvImpact!==null?a.nvImpact:a.detImpact;
      var vb=b.nvImpact!==null?b.nvImpact:b.detImpact;
      return vb-va;
    });

    // ── Build output HTML ──
    var html='<h4>&#128202; Individual Option Impact</h4>';
    html+='<div style="margin-bottom:0.5rem;font-size:0.82rem;color:var(--text-dim);">Baseline monthly profit: '+fmtMoney(baseProfit/1000)+'k';
    if(nvMode) html+=' &nbsp;|&nbsp; NV expected: '+fmtMoney(baseNVProfit/1000)+'k &nbsp;(&sigma;A='+fmtQ(baseSigA)+', &sigma;B='+fmtQ(baseSigB)+', CoA=$'+fmtD(coA)+', CoB=$'+fmtD(coB)+')';
    html+='</div>';

    for(var s=0;s<singles.length;s++){
      var r=singles[s];
      if(nvMode){
        var nvCls=r.nvImpact>=0?'positive':'negative';
        var detCls=r.detImpact>=0?'positive':'negative';
        html+='<div class="result-row"><span class="result-label">'+r.name+'</span>';
        html+='<span class="result-value '+nvCls+'">NV: '+(r.nvImpact>=0?'+':'')+fmtMoney(r.nvImpact/1000)+'k/mo</span>';
        html+='<span class="result-value" style="font-size:0.78rem;opacity:0.55;margin-left:0.8rem;">Det: '+(r.detImpact>=0?'+':'')+fmtMoney(r.detImpact/1000)+'k</span>';
        html+='</div>';
      } else {
        var cls=r.detImpact>=0?'positive':'negative';
        html+='<div class="result-row"><span class="result-label">'+r.name+'</span><span class="result-value '+cls+'">'+
          (r.detImpact>=0?'+':'')+fmtMoney(r.detImpact/1000)+'k/mo</span></div>';
      }
    }

    // ── Combination analysis (all non-empty subsets) ──
    var nf=filled.length;
    var combos=[];
    for(var mask=1;mask<(1<<nf);mask++){
      var comboNames=[], totalDA=0, totalDB=0, totalPA=0, totalPB=0, count=0;
      var comboSigA=baseSigA, comboSigB=baseSigB; // start from base
      for(var b=0;b<nf;b++){
        if(mask&(1<<b)){
          comboNames.push(filled[b].name);
          totalDA+=filled[b].dA;
          totalDB+=filled[b].dB;
          totalPA+=filled[b].pA;
          totalPB+=filled[b].pB;
          // Additive σ approximation: σ_combo = baseσ + Σ(optionσ_i − baseσ)
          if(nvMode){
            if(!isNaN(filled[b].sigA)) comboSigA+=(filled[b].sigA-baseSigA);
            if(!isNaN(filled[b].sigB)) comboSigB+=(filled[b].sigB-baseSigB);
          }
          count++;
        }
      }
      var comboProfA=(baseDA+totalDA)*(baseProfA+totalPA);
      var comboProfB=(baseDB+totalDB)*(baseProfB+totalPB);
      var comboDetImpact=comboProfA+comboProfB-baseProfit;
      var comboNVImpact=null;
      if(nvMode){
        var nvP=nvExpProfit(baseDA+totalDA,Math.max(comboSigA,0),baseProfA+totalPA,coA)
               +nvExpProfit(baseDB+totalDB,Math.max(comboSigB,0),baseProfB+totalPB,coB);
        comboNVImpact=nvP-baseNVProfit;
      }
      combos.push({
        name:comboNames.join(' + '),
        detImpact:comboDetImpact,
        nvImpact:comboNVImpact,
        count:count,
        profA:comboProfA,
        profB:comboProfB
      });
    }
    combos.sort(function(a,b){
      var va=a.nvImpact!==null?a.nvImpact:a.detImpact;
      var vb=b.nvImpact!==null?b.nvImpact:b.detImpact;
      return vb-va;
    });

    // Check if NV ranking differs from deterministic ranking
    var rankingDiffers=false;
    if(nvMode && combos.length>1){
      var detSorted=combos.slice().sort(function(a,b){ return b.detImpact-a.detImpact; });
      rankingDiffers=(detSorted[0].name!==combos[0].name);
    }

    html+='<hr class="tool-divider">';
    html+='<h4>&#127942; All Combinations Ranked'+(nvMode?' (by NV Expected Profit)':'')+'</h4>';
    html+='<div style="margin-bottom:0.5rem;font-size:0.82rem;color:var(--text-dim);">'+combos.length+' combinations from '+nf+' options</div>';

    if(nvMode && rankingDiffers){
      html+='<div class="verdict verdict-on" style="margin-bottom:0.8rem;">&#9888; Newsvendor ranking differs from deterministic! Uncertainty changes the best choice.</div>';
    }

    html+='<div class="ranking-list">';
    for(var k=0;k<combos.length;k++){
      var c=combos[k];
      var badge=c.count>1?' <span style="font-size:0.7rem;color:var(--text-dim);">('+c.count+' features)</span>':'';
      if(nvMode){
        var vCls=c.nvImpact>=0?'positive':'negative';
        html+='<div class="ranking-item"><span class="rank">'+(k+1)+'</span><span class="rank-name">'+c.name+badge+'</span>';
        html+='<span class="rank-value '+vCls+'">'+(c.nvImpact>=0?'+':'')+fmtMoney(c.nvImpact/1000)+'k</span>';
        if(Math.abs(c.nvImpact-c.detImpact)>0.5){
          html+='<span style="font-size:0.7rem;opacity:0.5;margin-left:0.5rem;">det: '+(c.detImpact>=0?'+':'')+fmtMoney(c.detImpact/1000)+'k</span>';
        }
        html+='</div>';
      } else {
        var verdictCls=c.detImpact>=0?'positive':'negative';
        html+='<div class="ranking-item"><span class="rank">'+(k+1)+'</span><span class="rank-name">'+c.name+badge+'</span>'+
          '<span class="rank-value '+verdictCls+'">'+(c.detImpact>=0?'+':'')+fmtMoney(c.detImpact/1000)+'k/mo</span></div>';
      }
    }
    html+='</div>';

    // ── Verdict ──
    var best=combos[0];
    var bestVal=best.nvImpact!==null?best.nvImpact:best.detImpact;
    if(bestVal>0){
      var label=nvMode?'NV Best':'Best';
      html+='<div class="verdict verdict-add">&#9989; '+label+' Combo: '+best.name+' &mdash; +'
        +fmtMoney(bestVal/1000)+'k/mo</div>';
    } else {
      html+='<div class="verdict verdict-skip">&#9888; No combination increases '+(nvMode?'expected ':'')+'profit. Consider skipping all.</div>';
    }

    var rp=document.getElementById('result-design');
    rp.innerHTML=html;
    rp.classList.add('visible');
  };
})();
