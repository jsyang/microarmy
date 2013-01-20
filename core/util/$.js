// $ -- misc util functions
define({

  // Random float / with coefficient
  r : function(n) { return n?n*Math.random():Math.random(); },

  // Random integer from [min,max] (bound inclusive)
  R : function(min,max) { return min+(Math.random()*(max-min+1))>>0; },

  // Returns a PseudoRandom function using a seed
  PRfunc : function(seed){
    var LCG = {
      Xi    : seed? seed : 0,
      seed  : seed? seed : 0,
      c     : 17,
      a     : 16807,
      m     : 524287 // mersenne prime #7
      // conditions are fulfilled for achieving a full period.
    };

    return function LCGpseudorandom(min,max) {
      LCG.Xi = (LCG.a*LCG.Xi+LCG.c) % LCG.m;
      return min +(LCG.Xi/LCG.m*(max-min+1))>>0;
    };
  },

  // Pick a random element from an array (optional custom random func)
  pickRandom : function(a, randomFunc) {
    if(randomFunc) {
      return a[randomFunc(0,a.length-1)];
    } else {
      return a[(Math.random()*a.length)>>0];
    }
  },

  // Array sum
  sum : function(a) { for(var sum=0, i=a.length; i--; sum+=a[i] ); return sum; },

  // Object attribute sum
  sumObj : function(a) { var sum=0; for(var i in a) sum+=a[i]; return sum; },


  // Checks if any arguments are undefined
  isUndefined : function() {
    for(var i=0; i<arguments.length; i++) {
      if(typeof arguments[i] === 'undefined') {
        return true;
      }
    }

    return false;
  },

  // Object literal extend.
  extend : function(target , extender) {
    for(var prop in extender) {
      target[prop] = extender[prop];
    }
    return target;
  }

});