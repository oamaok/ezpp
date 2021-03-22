import ojsama from 'ojsama';

function calculateDTAR(ms) {
  if (ms < 300) {
    return 11; // with DT, the AR is capped at 11
  } if (ms < 1200) {
    return 11 - (ms - 300) / 150;
  }
  return 5 - (ms - 1200) / 120;
}

export function calculateApproachRate(modifiers, ar) {
  let ms;
  switch (modifiers & (ojsama.modbits.ht | ojsama.modbits.dt | ojsama.modbits.ez | ojsama.modbits.hr)) {
    case ojsama.modbits.hr: return Math.min(10, ar * 1.4);
    case ojsama.modbits.ez: return ar / 2;

    case (ojsama.modbits.dt & ojsama.modbits.hr): {
      if (ar < 4) {
        ms = 1200 - 112 * ar;
      } else if (ar > 4) {
        ms = 740 - 140 * (ar - 4);
      } else {
        ms = 864 - 124 * (ar - 3);
      }
      return calculateDTAR(ms);
    }
    case (ojsama.modbits.dt & ojsama.modbits.ez): return calculateDTAR(1200 - 40 * ar);

    case ojsama.modbits.dt: return calculateDTAR(ar > 5 ? 200 + (11 - ar) * 100 : 800 + (5 - ar) * 80);
    case ojsama.modbits.ht: {
      if (ar === 5) return 0;
      if (ar < 5) return -1.5 * (5 - ar);
      if (ar < 8) return 1.875 * ar;
      return 4 + 1.5 * (ar - 7);
    }

    case (ojsama.modbits.ht & ojsama.modbits.hr): {
      if (ar > 7) return 8.5;
      if (ar < 4) {
        ms = 2700 - 252 * ar;
      } else if (ar < 5) {
        ms = 1944 - 279 * (ar - 3);
      } else {
        ms = 1665 - 315 * (ar - 4);
      }
      if (ar < 6) {
        return 15 - ms / 120;
      } if (ar > 7) {
        return 13 - ms / 150;
      }
      return 15 - ms / 120;
    }
    case (ojsama.modbits.ht & ojsama.modbits.ez): return -0.75 * (10 - ar);

    default: return ar;
  }
}

export function calculatePerformance(map, mods, combo, misses, accuracy) {
  const stars = new ojsama.diff().calc({ map, mods });

  const pp = ojsama.ppv2({
    stars,
    combo,
    nmiss: misses,
    acc_percent: accuracy,
  });

  return { pp, stars };
}
