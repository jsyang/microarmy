define([
  'core/util/$'
], function($) {
  
  var ImageDisplay = Class.extend({
    init:function(params){
      this._=$.extend({
        element: undefined,
        css: { // Apply CSS to <canvas/>
          'position':             'absolute',
          'top':                  '0px',
          'left':                 '0px',
          '-webkit-touch-callout':'none',
          '-webkit-user-select':  'none',
          '-khtml-user-select':   'none',
          '-moz-user-select':     'none',
          '-ms-user-select':      'none',
          'user-select':          'none'
        }
      },params);
    },
    
    initDisplay:function(){ var _=this._;
      _.element=document.createElement("img");
      var style=_.element.style;
      for(var prop in _.css)
        style[prop]=_.css[prop];
      document.body.appendChild(_.element);
      return;
    }
  });
  
  return ImageDisplay;
});
