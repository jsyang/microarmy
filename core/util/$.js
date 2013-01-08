// $ -- misc util functions
define({
  
  // Checks if any arguments are undefined
  isUndefined : function() {
    for(var i=0; i<arguments.length; i++) {
      if(typeof arguments[i] === 'undefined') {
        return true;
      }
    }
    
    return false;
  },
  
  // Random float / with coefficient
  r : function(n) { return n?n*Math.random():Math.random(); },

  // Random integer from [min,max] (bound inclusive)
  R : function(min,max) { return min+(Math.random()*(max-min+1))>>0; },

  // Array sum
  sum : function(a) { for(var sum=0, i=a.length; i--; sum+=a[i] ); return sum; },

  // Object attribute sum
  sumObj : function(a) { var sum=0; for(var i in a) sum+=a[i]; return sum; },

  // Object literal extend.
  extend : function(target , extender) {
    for(var prop in extender) {
      target[prop] = extender[prop];
    }
    return target;
  }  
  
});