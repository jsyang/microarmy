// GIANT TODO
////////////////////////////////////////////////////////////////////////////////
var SALVAGE={
  CONDITION:{
    TERRIBLE  :0,
    BAD       :1,
    FAIR      :2,
    GOOD      :3,
    PRISTINE  :4
  },
  
  TYPE:{
    SUPPLY:   0,  // too generic?
    FACILITY: 1,  // can this act directly upon some other resource, instead of
                  // being just another { qty: ### }
    PERSONNEL:2,  // reclaim defectors? PRISONERS?
    EQUIPMENT:3   // items necessary to equip various types of armed forces
                  // different from supply
  }
};

Salvageable = Class.extend({
  init:function(params){
    this._=$.extend({
      condition:  SALVAGE.CONDITION.FAIR, // how useful is the salvageable material
      value:      100,                    // game currency?
      fungible:   false,                  // interchangeable with other elements? (special facilities --> no)
      qty:        0,
      type:       SALVAGE.TYPE.SUPPLY
    },params);
    this.setDirection();
    this.setSpriteSheet(this._.img.sheet); // sheet is a string before here.
  },
  
  gfx:function(){
    var _=this._; return {
      img:    _.img.sheet,
      imgdx:  _.frame.current*_.img.w,
      imgdy:  _.action*_.img.w,
      imgw:   _.img.w,
      imgh:   _.img.h
    };
  }
});

////////////////////////////////////////////////////////////////////////////////
