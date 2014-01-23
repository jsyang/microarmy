define ['core/Battle/Pawn'], (Pawn) ->

  ACTION =
    MOVING            : 0
    ATTACK_STANDING   : 1
    ATTACK_CROUCHING  : 2
    ATTACK_PRONE      : 3
    DEATH1            : 4
    DEATH2            : 5

  # in which frames do we want to spawn projectiles?
  SHOTFRAME =
    PistolInfantry  : '010100010100'
    RocketInfantry  : '000100000100'
  
  VARIABLESTATS = [
    'health_current'
    'health_max'
    'berserk_time'
    'reload_time'
  ]
  
  class Infantry extends Pawn
    ACTION        : ACTION
    SHOTFRAME     : SHOTFRAME
    hDist2        : 20
    #target       : null
    #squad        : null
    action        : ACTION.MOVING
    corpsetime    : 180
    frame_current : 0
    frame_first   : 0
    frame_last    : 5
    constructor : (params) ->
      @[k]  = v for k, v of params
      @_setHalfDimensions()
      @_setVariableStats()
    getName : ->
      "#{@constructor.name.toLowerCase()}-#{@team}-#{@direction}-#{@action}-#{@frame_current}"
    isHit : (pawn) ->
      dx = pawn.x
      dy = pawn.y
      dx = Math.abs(@x - dx)
      dy = Math.abs(@y - @_halfHeight) - dy
      dx*dx + dy*dy <= pawn.hDist2 + @hDist2
    _setVariableStats : ->
      @[stat] = $.R.apply(@, @[stat]) for stat in VARIABLESTATS when @[stat] instanceof Array
      @[stat] = @[stat]()             for stat in VARIABLESTATS when @[stat] instanceof Function

  class PistolInfantry extends Infantry
    projectile     : 'Bullet'
    sight          : 3
    meleeDmg       : 8
    health_current : [30, 70]
    reload_ing     : 0
    reload_time    : 40
    berserk_ing    : 0
    berserk_time   : [10, 26]
    berserk_chance : -> $.r(0.59)
    ammo_clip      : 2
    ammo_max       : 2

  class RocketInfantry extends Infantry
    projectile     : 'SmallRocket'
    sight          : 6
    meleeDmg       : 23
    health_current : [60, 90]
    reload_ing     : 0
    reload_time    : [60, 90]
    berserk_ing    : 0
    berserk_time   : [6, 21]
    berserk_chance : -> $.r(0.35) + 0.08
    ammo_clip      : 1
    ammo_max       : 1
      
  class EngineerInfantry extends Infantry
    sight          : 4
    meleeDmg       : 15
    build_type     : null
    build_x        : null
    health_current : $.R(20,50)

  exportClasses = {
    Infantry
    PistolInfantry
    RocketInfantry
    EngineerInfantry
  }
      
  # Attach all these classes to the "importer" object.
  (importer) -> importer[k] = v for k, v of exportClasses