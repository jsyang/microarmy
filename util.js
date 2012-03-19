// A namespace for utility functions.
// Replaces helper.js

var $=new function() {
  this.r=function(n) { return n?n*Math.random():Math.random(); };
  // Random integer from [min,max] (bound inclusive)
  this.R=function(min,max) { return min+(Math.random()*(max-min+1))>>0; };
  this.i=function(s) { return parseInt(s); };
  this.sum=function(a) {
    for(var sum=0, i=a.length; i--; sum+=a[i] ); return sum;
  };
    
  // Used to reset the DOM for other screens.
  this.removeWorld=function(){
    world.pause();    
    while(document.getElementsByTagName('canvas').length)    
      document.body.removeChild(document.getElementsByTagName('canvas')[0]);
    if(document.getElementById('msgbox'))
      document.body.removeChild(document.getElementById('msgbox'));
    world=undefined;
  };
}