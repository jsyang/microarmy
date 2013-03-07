// Basic abstract gamepiece: Pawn.
define([
  'core/util/$',
  //'core/entity/behavior'
], function($) { return Class.extend({
  init : function(params){
    this._=$.extend({
      x           : undefined,
      y           : undefined,
      team        : undefined,
      corpsetime  : undefined,
      img : {
        w       : undefined,
        h       : undefined,
        hDist2  : undefined,    // hit radius^2 for collision testing (circular)
        sheet   : undefined     // sprite sheet
      },
      behavior : {
        alive : undefined,
        dead  : undefined
      }
    },params);
  },

  // todo: maybe call Campaign / Battle behavior with a list of these things rather than
  // calling Pawn.alive() ?

  // Should the world keep track of this instance?
  alive : function(){ var _=this._;
    if(Behavior.Custom.isDead.call(this)) {
      Behavior.Execute(_.behavior.dead,this);
      return false;
    } else {
      Behavior.Execute(_.behavior.alive,this);
      return true;
    }
  },

  gfx:function(){
    var _=this._; return {
      img     : _.img.sheet,
      imgdx   : _.frame.current*_.img.w,
      imgdy   : _.action*_.img.w,
      worldx  : _.x-(_.img.w>>1),
      worldy  : _.y-_.img.h+1,
      imgw    :  _.img.w,
      imgh    : _.img.h
    };
  }

}); });
