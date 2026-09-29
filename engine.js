/* DiveMath engine - honest recreational scuba planning math. */
(function (root) {
  "use strict";

  /* Pressure in atmospheres at depth (feet of seawater, 33ft per atm). */
  function pressureAta(depthFt) {
    return Math.round((1 + depthFt / 33) * 100) / 100;
  }

  /* Gas consumption at depth: surface SAC (psi/min) times pressure. */
  function consumptionPsiMin(surfaceSac, depthFt) {
    return Math.round(surfaceSac * pressureAta(depthFt) * 10) / 10;
  }

  /* Bottom time on usable gas: (startPsi - reservePsi) / consumption. */
  function bottomMinutes(opts) {
    var start = opts && typeof opts.startPsi === "number" ? opts.startPsi : 3000;
    var reserve = opts && typeof opts.reservePsi === "number" ? opts.reservePsi : 500;
    var sac = opts && typeof opts.sacPsiMin === "number" ? opts.sacPsiMin : 20;
    var depth = opts && typeof opts.depthFt === "number" ? opts.depthFt : 60;
    var c = consumptionPsiMin(sac, depth);
    if (c <= 0) return Infinity;
    return Math.round(((start - reserve) / c) * 10) / 10;
  }

  /* No-decompression limit (minutes) - PADI RDP-style table, interpolated. */
  var NDL_TABLE = [
    [35, 205], [40, 140], [50, 80], [60, 55], [70, 45], [80, 30],
    [90, 25], [100, 20], [110, 16], [120, 13], [130, 10]
  ];
  function noDecoLimit(depthFt) {
    if (depthFt <= 35) return 205;
    if (depthFt >= 130) return 10;
    for (var i = 1; i < NDL_TABLE.length; i++) {
      if (depthFt <= NDL_TABLE[i][0]) {
        var d0 = NDL_TABLE[i - 1][0], t0 = NDL_TABLE[i - 1][1];
        var d1 = NDL_TABLE[i][0], t1 = NDL_TABLE[i][1];
        return Math.round(t0 + (t1 - t0) * (depthFt - d0) / (d1 - d0));
      }
    }
    return 10;
  }

  /* Turn pressure on the rule of thirds: turn when one third is used. */
  function turnPsiThirds(startPsi) {
    return Math.round(startPsi * 2 / 3);
  }

  /* Rock-bottom gas for two divers to ascend from depth sharing one
     regulator: consumption * 2 divers * minutes to surface (incl stop). */
  function rockBottomPsi(opts) {
    var depth = opts && typeof opts.depthFt === "number" ? opts.depthFt : 60;
    var sac = opts && typeof opts.sacPsiMin === "number" ? opts.sacPsiMin : 20;
    var avgDepth = depth / 2;
    var minutes = Math.ceil(depth / 30) + 3; /* 30ft/min ascent + 3min stop */
    var c = consumptionPsiMin(sac, avgDepth);
    return Math.ceil(c * 2 * minutes * 1.2); /* 20% stress margin */
  }

  /* Maximum operating depth (ft) for a nitrox mix at a pO2 ceiling. */
  function modFt(fO2, pO2Max) {
    var ceiling = typeof pO2Max === "number" && pO2Max > 0 ? pO2Max : 1.4;
    if (fO2 <= 0 || fO2 >= 1) return fO2 === 0.21 ? Math.round((ceiling / 0.21 - 1) * 33) : 0;
    return Math.round((ceiling / fO2 - 1) * 33);
  }

  /* Best nitrox mix for a planned depth at the 1.4 ceiling. */
  function bestMix(depthFt) {
    var p = pressureAta(depthFt);
    var fo2 = Math.floor((1.4 / p) * 100) / 100;
    return Math.min(0.4, Math.max(0.21, fo2));
  }

  /* Equivalent narcotic depth (ft): air narcosis reference for the mix. */
  function endFt(depthFt, fO2) {
    var fn2 = 1 - fO2;
    var end = ((depthFt + 33) * fn2 / 0.79) - 33;
    return Math.round(Math.max(0, end));
  }

  /* Total ascent time in minutes: 30 ft/min plus a 3-minute safety stop
     at 15 ft when the dive went past 30 ft. */
  function ascentMinutes(depthFt) {
    var t = depthFt / 30;
    if (depthFt > 30) t += 3;
    return Math.round(t * 10) / 10;
  }

  /* Honest verdict comparing gas-limited bottom time to the NDL. */
  function limitingFactor(bottomMin, ndlMin) {
    if (bottomMin < ndlMin) return "gas - you will run low on air before the no-deco limit";
    if (bottomMin > ndlMin * 1.5) return "decompression - the table calls the dive long before your tank is low";
    return "balanced - gas and the table run out together";
  }

  var api = {
    pressureAta: pressureAta,
    consumptionPsiMin: consumptionPsiMin,
    bottomMinutes: bottomMinutes,
    noDecoLimit: noDecoLimit,
    turnPsiThirds: turnPsiThirds,
    rockBottomPsi: rockBottomPsi,
    modFt: modFt,
    bestMix: bestMix,
    endFt: endFt,
    ascentMinutes: ascentMinutes,
    limitingFactor: limitingFactor
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DiveMath = api;
})(typeof window !== "undefined" ? window : globalThis);
