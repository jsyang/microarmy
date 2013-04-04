define [
  'core/Battle/Pawn'
], (Pawn) ->

  CONST =
    ACTION :
      MOVING            : 0
      ATTACK_STANDING   : 1
      ATTACK_CROUCHING  : 2
      ATTACK_PRONE      : 3
      DEATH1            : 4
      DEATH2            : 5

    SHOTFRAME :
    # in which frames do we want to spawn projectiles?
      PistolInfantry  : '010100010100'
      RocketInfantry  : '000100000100'
  
  class Infantry extends Pawn
    CONST : CONST
    
    constructor : (_) ->
      @_ = $.extend {
        img         : { w:8, h:8, hDist2:20 }
        imgsheet    : null
        target      : null
        squad       : null
        direction   : null           # don't set the direction here
        action      : @CONST.ACTION.MOVING
        corpsetime  : 180
        frame :
          current : 0
          first   : 0
          last    : 5
      }, _
      @setSpriteSheet(@_.imgsheet)
      super @_

    distHit : (pawn) ->
      [dx, dy] = [pawn._.x, pawn._.y]
      [dx, dy] = [Math.abs(@_.x - dx), Math.abs((@_.y-(@_.img.h>>1)) - dy)]
      
      dx*dx + dy*dy
      
    gfx : ->
      {
        img     : @_.img.sheet                # Sprite sheet
        imgdx   : @_.frame.current*@_.img.w   # X-frames denote action frames
        imgdy   : @_.action*@_.img.h          # Y-frames denote actions
        worldx  : @_.x-(@_.img.w>>1)          # Center sprite horizontally
        worldy  : @_.y-@_.img.h               # Bottom align
        imgw    : @_.img.w
        imgh    : @_.img.h
      }
      
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