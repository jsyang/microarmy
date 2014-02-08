define ['core/Battle/Pawn'], (Pawn) ->

  ACTION =
    MOVING            : 0
    ATTACK_STANDING   : 1
    ATTACK_CROUCHING  : 2
    ATTACK_PRONE      : 3
    DEATH1            : 4
    DEATH2            : 5
    IDLE              : 6 # IDLE ANIMATIONS

  # Player selected goals.
  GOAL =
    MOVE_TO_RALLY : 0
    ATTACK_TARGET : 1
    SCOUT         : 2

  VARIABLESTATS = [
    'health_current'
    'health_max'
    'berserk_time'
    'berserk_chance'
    'reload_time'
  ]
  
  class Infantry extends Pawn
    ACTION          : ACTION
    GOAL            : GOAL
    hDist2          : 20
    action          : ACTION.MOVING
    corpsetime      : 180
    frame_current   : 0
    frame_first     : 0
    frame_last      : 5
    targetable      : true
    multiselectable : true # Is selected by user selection rect?
    constructor : (params) ->
      @[k]  = v for k, v of params
      @_setHalfDimensions()
      @_setVariableStats VARIABLESTATS
    getName : ->
      "#{@constructor.name.toLowerCase()}-#{@team}-#{@direction}-#{@action}-#{@frame_current}"
    isHit : (pawn) ->
      dx = pawn.x - @x
      dy = pawn.y - @y + @_halfHeight
      dx*dx + dy*dy <= pawn.hDist2 + @hDist2

  class PistolInfantry extends Infantry
    NAMETEXT       : 'Soldier'
    COST           : 150
    projectile     : 'Bullet'
    sight          : 3
    melee_dmg      : 8
    health_current : [30, 70]
    health_max     : 30
    reload_ing     : 0
    reload_time    : 40
    berserk_ing    : 0
    berserk_time   : [10, 26]
    berserk_chance : -> $.r(0.59)
    ammo_current   : 2
    ammo_max       : 2
    #prerequisites  : ['Barracks']
    tech_level     : 1
    # In which attack state frames do we want to spawn projectiles
    SHOTFRAMES :
      '1' : true
      '3' : true

  class RocketInfantry extends Infantry
    NAMETEXT       : 'Elite Soldier'
    COST           : 300
    projectile     : 'SmallRocket'
    sight          : 5
    melee_dmg      : 23
    health_current : [60, 90]
    health_max     : 60
    reload_ing     : 0
    reload_time    : [60, 90]
    berserk_ing    : 0
    berserk_time   : [6, 21]
    berserk_chance : -> $.r(0.25)
    ammo_current   : 1
    ammo_max       : 1
    prerequisites  : ['CommCenter']
    tech_level     : 4
    SHOTFRAMES :
      '3' : true
      
  class EngineerInfantry extends Infantry
    NAMETEXT       : 'Engineer'
    COST           : 500
    sight          : 3
    melee_dmg      : 5
    health_current : [20, 50]
    health_max     : 20
    prerequisites  : ['CommCenter'] # this doesn't work!
    tech_level     : 2

  exportClasses = {
    Infantry
    PistolInfantry
    RocketInfantry
    EngineerInfantry
  }
      
  # Attach all these classes to the "importer" object.
  (importer) -> importer[k] = v for k, v of exportClasses