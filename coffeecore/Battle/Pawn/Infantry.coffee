define [
  'core/Battle/Pawn'
], (Pawn) ->

  class Infantry extends Pawn
    constructor : (_) ->
      @_ = $.extend {
        target      : null
        squad       : null
        direction   : null                              # don't set the direction here
        action      : 'moving'
        corpsetime  : 180
        frame :
          current : 0
          first   : 0
          last    : 5
        
        # todo: set the behavior according to constructor name by default
        behavior    : 'behavior tree name here'
      }, _
      
      super @_

  class PistolInfantry extends Infantry
    constructor : (_) ->
      @_ = $.extend {
        projectile  : 'Bullet'
        sight       : 3
        meleeDmg    : 8
        health :
          current : $.R(30,70)
        reload :
          ing   : 0
          time  : 40
        berserk :
          ing     : 0
          time    : $.R(10,26)
          chance  : $.r(0.59)
        ammo :
          clip  : 2
          max   : 2
      }, _
      
      super @_
      @setSpriteSheet('pistol')
  
  class RocketInfantry extends Infantry
    constructor : (_) ->
      @_ = $.extend {
        projectile  : 'SmallRocket'
        sight       : 6
        meleeDmg    : 23
        health :
          current : $.R(60,90)
        reload :
          ing   : 0
          time  : $.R(60,90)
        berserk :
          ing     : 0
          time    : $.R(6,21)
          chance  : $.r(0.35)+0.08
        ammo :
          clip  : 1
          max   : 1
      }, _
      
      super @_
      @setSpriteSheet('rocket')
      
  class EngineerInfantry extends Infantry
    constructor : (_) ->
      @_ = $.extend {
        sight       : 4
        meleeDmg    : 5
        build :
          type : null
          x    : null
        health :
          current : $.R(20,50)
      }, _
      
      @_.target = @_.build
      super @_
      @setSpriteSheet('engineer')
      
  {
    PistolInfantry
    RocketInfantry
    EngineerInfantry
  }