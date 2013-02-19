
define(function() {
  return function(obj) {
    var flipsum, intervalEnd, k, lastK, r, sum, v;
    sum = 0;
    for (k in obj) {
      v = obj[k];
      sum += v;
    }
    flipsum = 1 / sum;
    r = Math.random();
    for (k in obj) {
      v = obj[k];
      if (!(typeof intervalEnd !== "undefined" && intervalEnd !== null)) {
        intervalEnd = v * flipsum;
      }
      if (r < intervalEnd) {
        return k;
      } else {
        intervalEnd += v * flipsum;
        lastK = k;
      }
    }
    return k;
  };
});

// Generated by CoffeeScript 1.5.0-pre
