/* ── tool-newsvendor.js ─ Newsvendor Optimizer ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};
  var normalInvCDF=GSCM.normalInvCDF, lossFunction=GSCM.lossFunction;
  var fmtQ=GSCM.fmtQ, fmtR=GSCM.fmtR, fmtPct=GSCM.fmtPct, fmtMoney=GSCM.fmtMoney;

  GSCM.calcNewsvendor = function(){
    var season=parseFloat(document.getElementById('t2-season').value)||8;
    var models=['A','B'];
    var html='<h4>&#128202; Newsvendor Optimization Results</h4>';
    html+='<div class="tool-grid-2">';

    models.forEach(function(m){
      var price=parseFloat(document.getElementById('t2-price'+m).value)||0;
      var cost=parseFloat(document.getElementById('t2-cost'+m).value)||0;
      var salvage=parseFloat(document.getElementById('t2-salvage'+m).value)||0;
      var hold=parseFloat(document.getElementById('t2-hold'+m).value)||0;
      var mu=parseFloat(document.getElementById('t2-mu'+m).value)||0;
      var sig=parseFloat(document.getElementById('t2-sig'+m).value)||0;

      var Cu=price-cost;
      var Co=cost-salvage+hold;
      var CR=Cu/(Cu+Co);
      var z=normalInvCDF(CR);
      var Qmo=mu+z*sig;
      var Qseason=Qmo*season;

      var Lz=lossFunction(z);
      var expLostSales=sig*Lz;
      var expSales=mu-expLostSales;
      var expLeftover=Qmo-expSales;
      var expProfit=Cu*expSales-Co*expLeftover;
      var fillRate=1-(sig*Lz)/mu;

      html+='<div class="tool-col">';
      html+='<div class="tool-col-header">Model '+m+'</div>';
      html+='<div class="result-row"><span class="result-label">C<sub>u</sub> (underage)</span><span class="result-value">'+fmtMoney(Cu)+'</span></div>';
      html+='<div class="result-row"><span class="result-label">C<sub>o</sub> (overage)</span><span class="result-value">'+fmtMoney(Co)+'</span></div>';
      html+='<div class="result-row"><span class="result-label">Critical Ratio</span><span class="result-value">'+fmtR(CR)+'</span></div>';
      html+='<div class="result-row"><span class="result-label">z*</span><span class="result-value">'+fmtR(z)+'</span></div>';
      html+='<div class="result-row"><span class="result-label">Q* / month</span><span class="result-value" style="color:var(--cyan);font-size:1.05rem;">'+fmtQ(Qmo)+'k</span></div>';
      html+='<div class="result-row"><span class="result-label">Q* / season ('+season+'mo)</span><span class="result-value" style="color:var(--cyan);">'+fmtQ(Qseason)+'k</span></div>';
      html+='<div class="result-row"><span class="result-label">L(z) loss fn</span><span class="result-value">'+fmtR(Lz)+'</span></div>';
      html+='<div class="result-row"><span class="result-label">Exp. Lost Sales/mo</span><span class="result-value negative">'+fmtQ(expLostSales)+'k</span></div>';
      html+='<div class="result-row"><span class="result-label">Exp. Leftover/mo</span><span class="result-value negative">'+fmtQ(expLeftover)+'k</span></div>';
      html+='<div class="result-row"><span class="result-label">Exp. Sales/mo</span><span class="result-value positive">'+fmtQ(expSales)+'k</span></div>';
      html+='<div class="result-row"><span class="result-label">Exp. Profit/mo</span><span class="result-value positive">'+fmtMoney(expProfit)+'k</span></div>';
      html+='<div class="result-row"><span class="result-label">Fill Rate</span><span class="result-value">'+fmtPct(fillRate)+'</span></div>';

      var verdictCls=z>=0?'verdict-above':'verdict-below';
      var verdictTxt=z>=0?'Order ABOVE the mean (+'+fmtQ(z*sig)+'k)':'Order BELOW the mean ('+fmtQ(z*sig)+'k)';
      html+='<div class="verdict '+verdictCls+'" style="font-size:0.9rem;padding:0.6rem;">'+verdictTxt+'</div>';
      html+='</div>';
    });

    html+='</div>';

    var rp=document.getElementById('result-newsvendor');
    rp.innerHTML=html;
    rp.classList.add('visible');
  };
})();
