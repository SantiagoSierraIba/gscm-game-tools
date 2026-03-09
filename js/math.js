/* ── math.js ─ Normal distribution & formatting helpers ── */
(function(){
  'use strict';
  var GSCM = window.GSCM = window.GSCM || {};

  GSCM.normalPDF = function(z){ return Math.exp(-0.5*z*z)/Math.sqrt(2*Math.PI); };

  GSCM.normalCDF = function(z){
    if(z<-8) return 0; if(z>8) return 1;
    var a=Math.abs(z),t=1/(1+0.2316419*a);
    var p=0.3989422804014327*Math.exp(-a*a/2)*(t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429)))));
    return z>0?1-p:p;
  };

  GSCM.normalInvCDF = function(p){
    if(p<=0) return -8; if(p>=1) return 8;
    var t=Math.sqrt(-2*Math.log(p<0.5?p:1-p));
    var z=t-(2.515517+t*(0.802853+t*0.010328))/(1+t*(1.432788+t*(0.189269+t*0.001308)));
    if(p<0.5) z=-z;
    for(var i=0;i<6;i++) z=z-(GSCM.normalCDF(z)-p)/GSCM.normalPDF(z);
    return z;
  };

  GSCM.lossFunction = function(z){ return GSCM.normalPDF(z)-z*(1-GSCM.normalCDF(z)); };

  /* ── Formatting helpers ── */
  GSCM.fmtD    = function(v){ return v.toFixed(2); };
  GSCM.fmtQ    = function(v){ return v.toFixed(1); };
  GSCM.fmtR    = function(v){ return v.toFixed(4); };
  GSCM.fmtPct  = function(v){ return (v*100).toFixed(1)+'%'; };
  GSCM.fmtK    = function(v){ return v.toFixed(1)+'k'; };
  GSCM.fmtMoney = function(v){ return '$'+v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,','); };
  GSCM.fmtMoneyK = function(v){ return '$'+v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'k'; };
})();
