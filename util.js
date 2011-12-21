// A namespace for utility functions.
// Replaces helper.js

var $=new function() {
  this.r=function(n) { return n?n*Math.random():Math.random(); };
  // Random integer from [min,max] (bound inclusive)
  this.R=function(min,max) { return min+(Math.random()*(max-min+1))>>0; };
  this.i=function(s) { return parseInt(s); };
}