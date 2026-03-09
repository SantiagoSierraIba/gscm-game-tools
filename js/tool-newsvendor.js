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

    var gameActions=[];

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

      gameActions.push({model:m, mu:mu, Qmo:Qmo, sig:sig, z:z});

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

    // ── "What to Enter in the Game" action box ──
    html+='<hr class="tool-divider">';
    html+='<h4>&#127918; What to Enter in the Game</h4>';
    html+='<div style="background:var(--card-bg);border:2px solid var(--cyan);border-radius:10px;padding:1rem 1.2rem;margin-bottom:0.5rem;">';

    html+='<div style="margin-bottom:0.8rem;">';
    html+='<div style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-dim);margin-bottom:0.3rem;">Step 1 &mdash; Forecasting Room</div>';
    html+='<div style="font-size:0.95rem;">Enter your <strong>demand forecast</strong> (what you expect customers to buy):</div>';
    html+='<div style="display:flex;gap:1.5rem;margin-top:0.3rem;">';
    gameActions.forEach(function(g){
      html+='<div style="font-size:1.1rem;font-weight:700;color:var(--purple);">Model '+g.model+': <span style="color:var(--green);">'+fmtQ(g.mu)+'k/mo</span> <span style="font-size:0.78rem;font-weight:400;color:var(--text-dim);">(&mu; = mean demand)</span></div>';
    });
    html+='</div>';
    html+='</div>';

    html+='<div style="margin-bottom:0.8rem;">';
    html+='<div style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-dim);margin-bottom:0.3rem;">Step 2 &mdash; Production Room</div>';
    html+='<div style="font-size:0.95rem;">Set your <strong>production target</strong> (how much to actually produce &mdash; accounts for demand uncertainty):</div>';
    html+='<div style="display:flex;gap:1.5rem;margin-top:0.3rem;">';
    gameActions.forEach(function(g){
      html+='<div style="font-size:1.1rem;font-weight:700;color:var(--purple);">Model '+g.model+': <span style="color:var(--cyan);">'+fmtQ(g.Qmo)+'k/mo</span> <span style="font-size:0.78rem;font-weight:400;color:var(--text-dim);">(Q* = &mu;'+((g.z>=0)?'+':'')+fmtR(g.z)+'&times;&sigma;)</span></div>';
    });
    html+='</div>';
    html+='</div>';

    html+='<div>';
    html+='<div style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-dim);margin-bottom:0.3rem;">Step 3 &mdash; Supplier Mix Advisor</div>';
    html+='<div style="font-size:0.95rem;">Use Q* as your <strong>Target Monthly Q</strong> in the Supplier Mix Advisor tool:</div>';
    html+='<div style="display:flex;gap:1.5rem;margin-top:0.3rem;">';
    gameActions.forEach(function(g){
      html+='<div style="font-size:1.1rem;font-weight:700;color:var(--purple);">Target '+g.model+': <span style="color:var(--cyan);">'+fmtQ(g.Qmo)+'k</span></div>';
    });
    html+='</div>';
    html+='</div>';

    html+='</div>';

    html+='<div style="font-size:0.82rem;color:var(--text-dim);margin-top:0.5rem;">';
    html+='<strong>Key distinction:</strong> The <span style="color:var(--green);">forecast (&mu;)</span> is your demand prediction &mdash; what you tell the board. ';
    html+='The <span style="color:var(--cyan);">production target (Q*)</span> is how much you actually produce &mdash; it\'s higher than &mu; when the critical ratio > 0.5 (profit margin is good), ';
    html+='because the cost of missing a sale exceeds the cost of overproducing.';
    html+='</div>';

    var rp=document.getElementById('result-newsvendor');
    rp.innerHTML=html;
    rp.classList.add('visible');
  };
})();
