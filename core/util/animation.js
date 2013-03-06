
define(function() {
  return function(el, prop, duration, useStyle) {
    var cycleTime, cyclesLeft, k, objProp, oldProp, step, steps, v, _cycleTime;
    if (duration == null) {
      duration = 200;
    }
    if (useStyle == null) {
      useStyle = false;
    }
    clearInterval(el.animationInterval);
    cycleTime = 10;
    _cycleTime = 0.1;
    cyclesLeft = duration * _cycleTime;
    el.animating = true;
    el.animationInterval = null;
    objProp = useStyle ? el.style : el;
    oldProp = {};
    for (k in prop) {
      v = prop[k];
      oldProp[k] = parseInt(el[k]);
    }
    steps = {};
    for (k in oldProp) {
      v = oldProp[k];
      steps[k] = parseInt(_cycleTime * (prop[k] - oldProp[k]));
    }
    step = function() {
      for (k in steps) {
        v = steps[k];
        objProp[k] += v;
      }
      cyclesLeft--;
      if (cyclesLeft <= 0) {
        clearInterval(el.animationInterval);
        el.animating = false;
      }
    };
    el.animationInterval = setInterval(step, cycleTime);
  };
});

// Generated by CoffeeScript 1.5.0-pre
