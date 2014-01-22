define [
  'core/Battle/Pawn'
], (Pawn) ->

  class Explosion extends Pawn
    targetable    : false # Don't want to be able to target explosions
    damage        : 0
    damageDecay   : 2     # How much will damage decay if we've splash-damaged a bunch of stuff
    corpsetime    : 1
    frame_current : 0
    constructor : (params) ->
      @[k]  = v for k, v of params
      atom.playSound @sound if @sound?
      @damage = $.R(@minDamage, @maxDamage) if @maxDamage?
      
    getName : ->
      "#{@spriteName}-#{@frame_current}"
    
  class FragExplosion extends Explosion
    # CAVEAT: Nesting objects in the prototype will keep the refs to the same object in the prototype...
    spriteName    : 'explosion2'
    sound         : 'expfrag'
    minDamage     : 28
    maxDamage     : 55
    hDist2        : 400
    frame_last    : 8
      
  class SmallExplosion extends Explosion
    spriteName    : 'explosion1'
    sound         : 'expsmall'
    minDamage     : 12
    maxDamage     : 29
    hDist2        : 160
    damageDecay   : 1
    frame_last    :12
  
  class FlakExplosion extends Explosion
    spriteName  : 'explosion0'
    sound       : 'expsmall'
    minDamage   : 11
    maxDamage   : 30
    hDist2      : 260
    damageDecay : 1
    frame_last  : 6
  
  class HEAPExplosion extends Explosion
    spriteName  : 'explosion3'
    sound       : 'exp2big'
    minDamage   : 65
    maxDamage   : 95
    hDist2      : 460
    damageDecay : 1
    frame_last  : 21
  
  class ChemExplosion extends Explosion
    # todo : no explosion sprite for this yet
    spriteName  : 'explosion4'
    sound       : 'chemspray'
    minDamage   : 11
    maxDamage   : 18
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