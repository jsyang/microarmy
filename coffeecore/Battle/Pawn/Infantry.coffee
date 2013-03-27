define [
  'core/Battle/Pawn'
], (Pawn) ->

  class Infantry extends Pawn
    constructor : (_) ->
      @_ = $.extend {
        imgsheet    : null
        target      : null
        squad       : null
        direction   : null           # don't set the direction here
        action      : 'moving'
        corpsetime  : 180
        frame :
          current : 0
          first   : 0
          last    : 5
      }, _
      @setSpriteSheet(@_.imgsheet)
      super @_

  class PistolInfantry extends Infantry
    constructor : (_) ->
      @_ = $.extend {
        imgsheet    : 'pistol'
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

  
  class RocketInfantry extends Infantry
    constructor : (_) ->
      @_ = $.extend {
        imgsheet    : 'rocket'
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
        imgsheet    : 'engineer'
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
      
  # export
  (Classes) ->
    $.extend(Classes, {
      Infantry
      PistolInfantry
      RocketInfantry
      EngineerInfantry
    })