define ['core/Battle/Pawn'], (Pawn) ->

  ACTION =
    MOVING            : 0
    ATTACK_STANDING   : 1
    ATTACK_CROUCHING  : 2
    ATTACK_PRONE      : 3
    DEATH1            : 4
    DEATH2            : 5

  GOAL =
    MOVETOPOINT : 0
    GUARDTARGET : 1
    GUARDPOINT  : 2
    SCOUT       : 3

  VARIABLESTATS = [
    'health_current'
    'health_max'
    'berserk_time'
    'berserk_chance'
    'reload_time'
  ]
  
  class Infantry extends Pawn
    ACTION        : ACTION
    hDist2        : 20
    #target       : null
    #squad        : null
    action        : ACTION.MOVING
    corpsetime    : 180
    frame_current : 0
    frame_first   : 0
    frame_last    : 5
    targetable    : true
    constructor : (params) ->
      @[k]  = v for k, v of params
      @_setHalfDimensions()
      @_setVariableStats VARIABLESTATS
    getName : ->
      "#{@constructor.name.toLowerCase()}-#{@team}-#{@direction}-#{@action}-#{@frame_current}"
    isHit : (pawn) ->
      dx = @x - pawn.x
      dy = @y - @_halfHeight - pawn.y
      dx*dx + dy*dy <= pawn.hDist2 + @hDist2

  class PistolInfantry extends Infantry
    projectile     : 'Bullet'
    sight          : 3
    melee_dmg      : 8
    health_current : [30, 70]
    reload_ing     : 0
    reload_time    : 40
    berserk_ing    : 0
    berserk_time   : [10, 26]
    berserk_chance : -> $.r(0.59)
    ammo_clip      : 2
    ammo_max       : 2
    # In which attack state frames do we want to spawn projectiles
    SHOTFRAMES :
      '1' : true
      '3' : true

  class RocketInfantry extends Infantry
    projectile     : 'SmallRocket'
    sight          : 6
    melee_dmg      : 23
    health_current : [60, 90]
    reload_ing     : 0
    reload_time    : [60, 90]
    berserk_ing    : 0
    berserk_time   : [6, 21]
    berserk_chance : -> $.r(0.35) + 0.08
    ammo_clip      : 1
    ammo_max       : 1
    SHOTFRAMES :
      '3' : true
      
  class EngineerInfantry extends Infantry
    sight          : 4
    melee_dmg      : 5
    build_type     : null
    build_x        : null
    health_current : [20, 50]

  exportClasses = {
    Infantry
    PistolInfantry
    RocketInfantry
    EngineerInfantry
  }
      
  # Attach all these classes to the "importer" object.
  (importer) -> importer[k] = v for k, v of exportClasses