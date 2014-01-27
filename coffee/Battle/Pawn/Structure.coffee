define ['core/Battle/Pawn'], (Pawn) ->

  STATE =
    GOOD  : 0
    BAD   : 1
    WRECK : 2
  
  VARIABLESTATS = [
    'health_current'
    'health_max'
  ]

  BUILDMODIFIER =
    
    SPAWN_AT_DOOR : (b) ->
      @x += [-1, 1][@direction] * b.DX_DOOR
    
    SET_RALLY_POINT : (b) ->
      @goal = 0 # Move to rally point.
      @rally =
        x : b.x + $.R(-20, 20)
        y : b.y

  class Structure extends Pawn
    NAMETEXT        : 'Generic structure'
    STATE           : STATE
    hDist2          : 0             # This number is computed usually by squaring the smallest dimension of the sprite
    targetable      : true          # Can enemy units attack this?
    crumbled        : false         # Already destroyed?
    corpsetime      : 1
    state           : STATE.GOOD
    #shoot_dy        : 0            # Where does the projectile origin from, relative to structure
    
    getName : ->
      "#{@constructor.name.toLowerCase()}-#{@team}-#{@direction}-#{@state}"
    
    isHit : (pawn) ->
      dx = pawn.x - @x
      dy = pawn.y - @y + @_halfHeight
      dx*dx + dy*dy <= pawn.hDist2 + @hDist2

    constructor : (params) ->
      @[k]  = v for k, v of params
      @_setHalfDimensions()
      @_setVariableStats VARIABLESTATS

    playConstructedSound : ->
      atom.playSound @construct_sound if @construct_sound?

    setDamage : (dmg) ->
      return unless dmg > 0
      @health_current -= dmg
      if @health_current <= 0
        @health_current = 0
        @state = @STATE.WRECK
      else if @health_current < 0.6 * @health_max
        @state = @STATE.BAD
  
  class CommCenter extends Structure
    NAMETEXT           : 'Fortified HQ'
    construct_sound    : 'compute'
    hDist2             : 196
    sight              : 6
    health_current     : [2400, 2700]
    health_max         : [2700, 3200]
    buildable_type     : 'RocketInfantry'
    build_current      : 0
    build_max          : 60
    build_modifiers    : [
      BUILDMODIFIER.SET_RALLY_POINT
    ]
  
  
  class Barracks extends Structure
    NAMETEXT           : 'Barracks'
    construct_sound    : 'tack'
    hDist2             : 169
    health_current     : [1800, 1950]
    health_max         : [1950, 2500]
    DX_DOOR            : 6
    buildable_type     : 'PistolInfantry'
    build_current      : 0
    build_max          : 30
    build_modifiers    : [
      BUILDMODIFIER.SPAWN_AT_DOOR
      BUILDMODIFIER.SET_RALLY_POINT
    ]
  
  class Scaffold extends Structure
    NAMETEXT        : 'Construction Site'
    construct_sound : 'dropitem'
    hDist2          : 64
    health_current  : [360, 400]
    health_max      : [400, 450]
    build_current   : 0                    # Current build progress
    build_type      : 'Pillbox'            # What are we building?
    constructor : (params) ->
      super params
      @build_max = { # Build times.
        'Pillbox'           : 170
        'MissileRack'       : 300
        'MissileRackSmall'  : 140
        'SmallTurret'       : 300
        'Barracks'          : 10#1200
        'CommCenter'        : 10#2000
      }[@build_type]
  
  class AmmoDump extends Structure
    NAMETEXT       : 'Ammo Dump'
    hDist2         : 100
    sight          : 6
    health_current : [80,  120]
    health_max     : [130, 150]
    reload_ing     : 0
    reload_time    : 500
    constructor : (params) ->
      @supply =
        HomingMissile       : $.R(10,20)
        HomingMissileSmall  : $.R(60,80)
      super params
  
  class AmmoDumpSmall extends Structure
    NAMETEXT       : 'Ammo Crate'
    hDist2         : 25
    sight          : 5
    health_current : [80,  120]
    health_max     : [130, 150]
    reload_ing     : 0
    reload_time    : 300          # Interval between checking for friendly units needing refills
    constructor : (params) ->
      @supply =
        HomingMissileSmall : $.R(20,30)
      super params
    getName : ->
      "#{@constructor.name.toLowerCase()}-#{@team}"
  
  class MineFieldSmall extends Structure
    corpsetime : 0
    maxMines   : 4
    # todo: have these spawn some mines
  
  # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
  
  class Pillbox extends Structure
    NAMETEXT        : 'Pillbox'
    construct_sound : 'sliderack1'
    hDist2          : 64
    sight           : 3
    health_current  : [800, 900]
    health_max      : [800, 1100]
    reload_ing      : 0
    reload_time     : 50
    ammo_current    : 6
    ammo_max        : 6
    shoot_dy        : -5
    projectile      : 'MGBullet'
    crew_current    : 1
    crew_max        : 4
    crew_killDamage : 23   # Damage > this has a chance of killing some crew 
    crew_killChance : 0.2  # Chance 1 crew member is killed
  
  class SmallTurret extends Structure
    NAMETEXT        : 'Turret'
    construct_sound : 'sliderack1'
    hDist2          : 90
    sight           : 5
    health_current  : [1900, 2100]
    health_max      : [2100, 2300]
    reload_ing      : 0
    reload_time     : 90
    turn_ing        : 0
    turn_rate       : 0.25
    turn_last       : 4
    ammo_current    : 1
    ammo_max        : 1
    shoot_dy        : -7
    projectile      : 'SmallShell'
    getName : ->
      "turret-#{@team}-#{@direction}-#{@state}-#{@turn_ing>>0}"
  
  class MissileRack extends Structure
    NAMETEXT        : 'Heavy Missile Launcher'
    hDist2          : 64
    sight           : 13
    health_current  : [200, 280]
    health_max      : [280, 300]
    projectile      : 'HomingMissile'
    reload_ing      : 0
    reload_time     : 2900
    ammo_current    : 1
    ammo_max        : 1
    ammo_supply     : 3
    ammo_supply_max : 3
    shoot_dy        : -20
    getName : ->
      if @health_current <= 0
        hasAmmo = 2
      else if @reload_ing > 40 or @ammo_supply is 0
        hasAmmo = 1
      else
        hasAmmo = 0
      "missilerack-#{@team}-#{@direction}-#{hasAmmo}"
  
  class MissileRackSmall extends Structure
    NAMETEXT          : 'Missile Launcher'
    hDist2            : 18
    sight             : 9
    health_current    : [100, 180]
    health_max        : [180, 200]
    projectile        : 'HomingMissileSmall'
    canTargetAircraft : true
    reload_ing        : 0
    reload_time       : 190
    ammo_current      : 1
    ammo_max          : 1
    ammo_supply       : 12
    ammo_supply_max   : 12
    shoot_dy          : -8
    getName : ->
      if @health_current <= 0
        hasAmmo = 2
      else if @reload_ing > 30 or @ammo_supply is 0
        hasAmmo = 1
      else
        hasAmmo = 0
      "missileracksmall-#{@team}-#{@direction}-#{hasAmmo}"
  
  # future: NOT YET IMPLEMENTED #

  class Depot extends Structure
    hDist2 : 260
  
  class RepairYard extends Structure
    hDist2 : 196
      
  class Helipad extends Structure
    hDist2 : 130
  
  class CommRelay extends Structure
    hDist : 220
    health_current : [560, 600]
    health_max     : [600, 750]
    
  class WatchTower extends Structure
    hDist          : 196      
    sight          : 13
    health_current : [300, 350]
    health_max     : [360, 400]
  
  exportClasses = {
    Structure
    CommCenter
    Barracks
    Scaffold
    CommRelay
    WatchTower
    AmmoDump
    AmmoDumpSmall
    MineFieldSmall
    Depot
    RepairYard
    Helipad
    Pillbox
    SmallTurret
    MissileRack
    MissileRackSmall
  }
    
  # Attach all these classes to the "importer" object.
  (importer) -> importer[k] = v for k, v of exportClasses