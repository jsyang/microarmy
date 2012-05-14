// A namespace for utility functions.
var $={
  r : function(n) { return n?n*Math.random():Math.random(); },
  
  // Random integer from [min,max] (bound inclusive)
  R : function(min,max) { return min+(Math.random()*(max-min+1))>>0; },
  
  sum : function(a) { for(var sum=0, i=a.length; i--; sum+=a[i] ); return sum; },
  
  sumObj : function(a) { var sum=0; for(var i in a) sum+=a[i]; return sum; },
  
  // Used to reset the DOM for other screens.
  removeWorld : function(){
    world.pause();    
    while(document.getElementsByTagName('canvas').length)    
      document.body.removeChild(document.getElementsByTagName('canvas')[0]);
    if(document.getElementById('msgbox'))
      document.body.removeChild(document.getElementById('msgbox'));
    world=undefined;
  },
  
  extend : function(target,extender) {
    for(var prop in extender)
      target[prop]=extender[prop];
    return target;
  }
};

// Extend function
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    this.Class = function(){};
    Class.extend = function(prop) {
      var _super = this.prototype;
      
      initializing = true;
      var prototype = new this();
      initializing = false;
  
      for (var name in prop) {
        prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
  
        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);
            this._super = tmp;  
            return ret;
          };
        })(name, prop[name]) : prop[name];
        }

		function Class() {
			if ( !initializing && this.init )
			this.init.apply(this, arguments);
		}

		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.extend = arguments.callee;
		return Class;
	};
})();