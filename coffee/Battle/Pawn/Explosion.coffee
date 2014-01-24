define [
  'core/Battle/Pawn'
], (Pawn) ->

  VARIABLESTATS = [
    'damage'
  ]

  class Explosion extends Pawn
    targetable    : false # Don't want to be able to target explosions
    damage        : 0
    damageDecay   : 2     # How much will damage decay if we've splash-damaged a bunch of stuff
    corpsetime    : 1
    frame_current : 0
    constructor : (params) ->
      @[k]  = v for k, v of params
      atom.playSound @sound if @sound?
      @_setVariableStats(VARIABLESTATS)
      
    getName : ->
      "#{@spriteName}-#{@frame_current}"
    
  class FragExplosion extends Explosion
    spriteName  : 'explosion1'
    sound       : 'expfrag'
    damage      : [28, 55]
    hDist2      : 400
    frame_last  : 12
      
  class SmallExplosion extends Explosion
    spriteName  : 'explosion2'
    sound       : 'expsmall'
    damage      : [12, 29]
    hDist2      : 160
    damageDecay : 2
    frame_last  : 8
  
  class FlakExplosion extends Explosion
    spriteName  : 'explosion0'
    sound       : 'expsmall'
    damage      : [11, 30]
    hDist2      : 260
    damageDecay : 1
    frame_last  : 6
  
  class HEAPExplosion extends Explosion
    spriteName  : 'explosion3'
    sound       : 'exp2big'
    damage      : [65, 95]
    hDist2      : 460
    damageDecay : 1
    frame_last  : 21
  
  class ChemExplosion extends Explosion
    # todo : no explosion sprite for this yet
    spriteName  : 'explosion4'
    sound       : 'chemspray'
    damage      : [11, 18]
    hDist2      : 360
    damageDecay : 1
    frame_last  : 3
      
  class ChemCloud extends Explosion
    # todo: no sprites for this yet
    spriteName  : 'chemcloud'
    sound       : 'chemspray'
    hDist2      : 400
    frame_last  : 2
    damage      : 4
    damageDecay : 0
    constructor : ->
      super @
      @cycles  = $.R(100,200)
      @driftdx = $.R(0,1)
      @frame_current = $.R(0,2)
  
# Smoke (explosions that don't have any effects) # # # # # # #

  class SmokeCloud extends Explosion
    spriteName  : 'smokelarge'
    frame_last  : 6
        
  class SmokeCloudSmall extends Explosion
    spriteName  : 'smokesmall'
    frame_last  : 3
  
  class Flame extends Explosion
    frame_first : 0
    halign      : 'center'
    valign      : 'bottom'
    constructor : (params) ->
      super params
      
      flameType = $.r(40)
      if flameType < 4
        @spriteName     = 'firesmall0'
        @cycles         = $.R(1,4)
        @frame_last     = 64
        @frame_current  = $.R(0,64)
        
      else if flameType < 7
        @spriteName     = 'firesmall1'
        @cycles         = $.R(2,14)
        @frame_current  = $.R(0,14)
        @frame_last     = 14
        
      else
        variant         = $.R(0,2)
        @spriteName     = "firetiny#{variant}"
        @cycles         = $.R(2,20)
        @frame_current  = $.R(0,4)
        @frame_last     = 4
  
  exportClasses = {
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
  }
  
  # Attach all these classes to the "importer" object.
  (importer) -> importer[k] = v for k, v of exportClasses