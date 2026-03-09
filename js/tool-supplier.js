/* ── tool-supplier.js ─ Supplier Mix Advisor (reads GSCM.suppliers) ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};
  var fmtQ=GSCM.fmtQ, fmtMoneyK=GSCM.fmtMoneyK;

  GSCM.calcSupplier = function(){
    var allSuppliers = GSCM.suppliers;
    var targetA=parseFloat(document.getElementById('t3-targetA').value)||0;
    var targetB=parseFloat(document.getElementById('t3-targetB').value)||0;
    var holdCostA=parseFloat(document.getElementById('t3-holdingA').value)||0;
    var holdCostB=parseFloat(document.getElementById('t3-holdingB').value)||0;

    var checked=[];
    for(var s=0;s<allSuppliers.length;s++){
      var cb = document.getElementById('t3-sup'+s);
      if(cb && cb.checked) checked.push(s);
    }
    if(checked.length===0){
      var rp=document.getElementById('result-supplier');
      rp.innerHTML='<h4 style="color:var(--red);">&#9888; Select at least one supplier.</h4>';
      rp.classList.add('visible');
      return;
    }

    // Generate all non-empty subsets of checked suppliers
    var combos=[];
    var n=checked.length;
    for(var mask=1;mask<(1<<n);mask++){
      var subset=[];
      for(var b=0;b<n;b++){
        if(mask&(1<<b)) subset.push(checked[b]);
      }
      combos.push(subset);
    }

    // Sort suppliers within each combo by cost (cheapest first)
    var results=[];
    combos.forEach(function(combo){
      var sups=combo.map(function(idx){return allSuppliers[idx];});
      sups.sort(function(a,b){return a.costA-b.costA;});

      var allocA=[], allocB=[], remainA=targetA, remainB=targetB;
      var totalProdCost=0, totalSetup=0, totalHolding=0;
      var totalCapA=0, totalCapB=0;

      sups.forEach(function(sup){
        var uA=Math.min(remainA,sup.capA);
        var uB=Math.min(remainB,sup.capB);
        allocA.push(uA); allocB.push(uB);
        remainA-=uA; remainB-=uB;
        totalProdCost += uA*sup.costA + uB*sup.costB;
        totalSetup += sup.setup;
        totalHolding += (holdCostA*uA + holdCostB*uB)*sup.lead/2;
        totalCapA+=sup.capA; totalCapB+=sup.capB;
      });

      var totalCost=totalProdCost+totalSetup+totalHolding;
      var shortA=remainA>0.01?remainA:0;
      var shortB=remainB>0.01?remainB:0;
      var names=sups.map(function(s){return s.name;}).join(' + ');

      results.push({
        names:names, combo:combo, sups:sups, allocA:allocA, allocB:allocB,
        prodCost:totalProdCost, setup:totalSetup, holding:totalHolding,
        total:totalCost, shortA:shortA, shortB:shortB,
        capA:totalCapA, capB:totalCapB
      });
    });

    results.sort(function(a,b){ return a.total-b.total; });

    var html='<h4>&#128202; Supplier Combination Comparison</h4>';
    html+='<table class="combo-table"><thead><tr><th>Combination</th><th>Prod. Cost</th><th>Setup</th><th>Holding</th><th>Total/mo</th><th>Status</th></tr></thead><tbody>';

    var bestTotal=results[0].total;
    results.forEach(function(r){
      var isBest=(r.total===bestTotal && r.shortA===0 && r.shortB===0);
      var rowCls=isBest?'best-row':'';
      var status='';
      if(r.shortA>0||r.shortB>0){
        status='<span class="warn">Short: '+(r.shortA>0?fmtQ(r.shortA)+'k A ':'')+(r.shortB>0?fmtQ(r.shortB)+'k B':'')+'</span>';
      } else {
        status=isBest?'&#9989; Best':'&#9989; OK';
      }
      html+='<tr class="'+rowCls+'">';
      html+='<td>'+r.names+'</td>';
      html+='<td>'+fmtMoneyK(r.prodCost)+'</td>';
      html+='<td>'+fmtMoneyK(r.setup)+'</td>';
      html+='<td>'+fmtMoneyK(r.holding)+'</td>';
      html+='<td><strong>'+fmtMoneyK(r.total)+'</strong></td>';
      html+='<td>'+status+'</td>';
      html+='</tr>';
    });
    html+='</tbody></table>';

    // Find best feasible
    var bestFeasible=results.find(function(r){return r.shortA===0&&r.shortB===0;});
    if(bestFeasible){
      html+='<div class="verdict verdict-add">&#9989; Lowest Cost: '+bestFeasible.names+' at '+fmtMoneyK(bestFeasible.total)+'/mo</div>';
    } else {
      html+='<div class="verdict verdict-skip">&#9888; No combination meets full demand. Increase capacity or reduce target Q.</div>';
    }

    var rp=document.getElementById('result-supplier');
    rp.innerHTML=html;
    rp.classList.add('visible');
  };
})();
