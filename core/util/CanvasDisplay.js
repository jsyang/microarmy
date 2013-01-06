define([
  'core/util/$'
], function($) {
  
  var CanvasDisplay = Class.extend({
    init:function(params){
      this._=$.extend({
        w: 800,
        h: 600,
        ctx: undefined,
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
      var canvasElement=document.createElement("canvas");
      canvasElement.width=_.w;
      canvasElement.height=_.h;
      var style=canvasElement.style;
      for(var prop in _.css)
        style[prop]=_.css[prop];
      document.body.appendChild(canvasElement);
      _.ctx=canvasElement.getContext('2d');
      return _.ctx;
    },
  
    draw:function(gfx){
      if(!gfx.img) return;
      this._.ctx.drawImage(         gfx.img,
          gfx.imgdx,  gfx.imgdy,    gfx.imgw,gfx.imgh,
          gfx.worldx, gfx.worldy,   gfx.imgw,gfx.imgh
      );
    },
  
    clear:function(){ var _=this._; _.ctx.clearRect(0,0,_.w,_.h); }
  });
  
  return CanvasDisplay;
};