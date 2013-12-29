define [
  'core/Battle/Pawn'
], (Pawn) ->

  class Explosion extends Pawn
    constructor : (_) ->
      @_ = $.extend {
        targetable  : false # Don't want to be able to target explosions
        damage      : 0
        damageDecay : 2     # How much will damage decay if we've splash-damaged a bunch of stuff
        corpsetime  : 1
      }, _
      soundManager.play(@_.sound) if @_.sound?
      super @_
    
    gfx : ->
      {
        img     : @_.img.sheet
        imgdx   : @_.frame.current*@_.img.w
        imgdy   : 0
        worldx  : @_.x-(@_.img.w>>1)
        worldy  : @_.y-(@_.img.h>>1)
        imgw    : @_.img.w
        imgh    : @_.img.h
      }

  class FragExplosion extends Explosion
    constructor : (_) ->
      @_ = $.extend {
        sound   : 'expfrag'
        damage  : $.R(28,55)
        frame   : { current : 0, last : 8 }
        img     : { w : 41, h : 35, hDist2 : 400, sheet : preloader.getFile('exp1') }
      }, _
      super @_
      
  class SmallExplosion extends Explosion
    constructor : (_) ->
      @_ = $.extend {
        sound       : 'expsmall'
        damage      : $.R(12,29)
        damageDecay : 1
        frame       : { current : 0, last : 12 }
        img         : { w : 25, h : 17, hDist2 : 160, sheet : preloader.getFile('exp2') }
      }, _
      super @_
  
  class FlakExplosion extends Explosion
    constructor : (_) ->
      @_ = $.extend {
        sound       : 'expsmall'
        damage      : $.R(11,47)
        damageDecay : 4
        frame       : { current : -1, last : 6 }
        img         : { w : 24, h : 17, hDist2 : 260, sheet : preloader.getFile('exp0') }
      }, _
      super @_
  
  class HEAPExplosion extends Explosion
    constructor : (_) ->
      @_ = $.extend {
        sound       : 'exp2big'
        damage      : $.R(65,95)
        damageDecay : 1
        frame       : { current : -1, last : 22 }
        img         : { w : 41, h : 28, hDist2 : 460, sheet : preloader.getFile('exp2big') }
      }, _
      super @_
  
  class ChemExplosion extends Explosion
    constructor : (_) ->
      @_ = $.extend {
        sound       : 'chemspray'
        damage      : $.R(11,18)
        damageDecay : 1
        frame       : { current : -1, last : 3 }
        img         : { w : 20, h : 20, hDist2 : 360, sheet : preloader.getFile('chemexp') }
      }, _
      super @_
      
  class ChemCloud extends Explosion
    constructor : (_) ->
      @_ = $.extend {
        damage      : 4
        damageDecay : 0
        cycles      : $.R(100,200)
        driftdx     : $.R(0,1)
        frame       : { current : $.R(0,2), last : 2 }
        img         : { w : 20, h : 20, hDist2 : 400, sheet : preloader.getFile('chemcloud') }
      }, _
      super @_
  
# Smoke (explosions that don't have any effects) # # # # # # #

  class SmokeCloud extends Explosion
    constructor : (_) ->
      @_ = $.extend {
        damage      : 0
        frame       : { current : -1, last : 6 }
        img         : { w : 19, h : 17, sheet : preloader.getFile('smoke') }
      }, _
      super @_
  
  class SmokeCloudSmall extends Explosion
    constructor : (_) ->
      @_ = $.extend {
        damage      : 0
        frame       : { current : -1, last : 3 }
        img         : { w : 8, h : 13, sheet : preloader.getFile('smokesmall') }
      }, _
      super @_
  
  class Flame extends Explosion
    chooseFlame : ->
      flameType = $.r(40)
      if flameType < 4
        flame =
          img   : { w : 10, h : 11, sheet : preloader.getFile('firemedium0') }
          frame : { current : $.R(0,64), last : 64 }
          cycles: $.R(1,4)
      else if flameType < 7
        flame =
          img   : { w : 23, h : 23, sheet : preloader.getFile('firemedium1') }
          frame : { current : $.R(0,14), last : 14 }
          cycles: $.R(2,14)
      else
        flame =
          img   : { w : 6, h : 4, sheet : preloader.getFile('firesmall'+$.R(0,2)) }
          frame : { current : $.R(0,4), last : 4 }
          cycles: $.R(2,20)
  
    constructor : (_) ->
      @_ = $.extend @chooseFlame(), _
      super @_
  
  # export
  (Classes) ->
    $.extend(Classes, {
      Explosion
      FragExplosion
      SmallExplosion
      FlakExplosion
      HEAPExplosion
      ChemExplosion
      
      SmokeCloud
      SmokeCloudSmall
      Flame
      ChemCloud
    })