define ['core/Battle/Pawn'], (Pawn) ->

  STATE =
    GOOD  : 0
    BAD   : 1
    WRECK : 2
    
  SCAFFOLD_BUILD_REQUIREMENTS =
    'Pillbox'           : 4
    'MissileRack'       : 8
    'MissileRackSmall'  : 1
    'SmallTurret'       : 6
    'Barracks'          : 16
    'CommCenter'        : 60
    'MineFieldSmall'    : 1
    'AmmoDumpSmall'     : 1
    'AmmoDump'          : 2

  VARIABLESTATS = [
    'health_current'
    'health_max'
  ]

  class Structure extends Pawn
    STATE       : STATE
    hDist2      : 0             # This number is computed usually by squaring the smallest dimension of the sprite
    targetable  : true          # Can enemy units attack this?
    crumbled    : false         # Already destroyed?
    corpsetime  : 1
    state       : STATE.GOOD
    shoot_dy    : 0             # Where does the projectile origin from, relative to structure
    shoot_dx    : 0
    
    getName : ->
      "#{@constructor.name.toLowerCase()}-#{@team}-#{@direction}-#{@state}"
    
    distHit : (pawn) ->
      dx = pawn.x
      dy = pawn.y
      dx = Math.abs(@x - dx)
      dy = Math.abs(@y - @_halfHeight) - dy
      dx*dx + dy*dy

    constructor : (params) ->
      @[k]  = v for k, v of params
      if not @constructor::_halfHeight?
        name = @getName()
        @constructor::_halfHeight = GFXINFO[name].height >> 1
      @_setVariableStats
      
    _setVariableStats : ->
      @[stat] = $.R.apply(@, @[stat]) for stat in VARIABLESTATS when @[stat] instanceof Array

    takeDamage : (dmg) ->
      return unless dmg > 0
      @health_current -= dmg
      if @health_current <= 0
        @health_current = 0
        @state = @STATE.WRECK
      else if @health_current < 0.6 * @health_max
        @state = @STATE.BAD
  
  class CommCenter extends Structure
    hDist2             : 196
    sight              : 6
    health_current     : [2400, 2700]
    health_max         : [2700, 3200]
    ai_reinforce_ing   : 0     
    ai_reinforce_time  : 10               # Speed of AI building a squad from here
    crew_current       : 40
    crew_max           : 40
    crew_killDamage    : 70               # Damage > this has a chance of killing some crew 
    crew_killChance    : 0.05             # Chance 1 crew member is killed
    crew_type          : 'RocketInfantry' # Crew type if crew exits the building
    
  class Barracks extends Structure
    hDist2             : 169
    health_current     : [1800, 1950]
    health_max         : [1950, 2500]
    ai_reinforce_ing   : 0
    ai_reinforce_time  : 10
    crew_current       : 40
    crew_max           : 80
    crew_killDamage    : 40               # Damage > this has a chance of killing some crew 
    crew_killChance    : 0.1              # Chance 1 crew member is killed
    crew_type          : 'PistolInfantry' # Crew type if crew exits the building
  
  class Scaffold extends Structure
    hDist2          : 64
    health_current  : [360, 400]
    health_max      : [400, 450]
    build_type      : 'Pillbox'            # What are we building?
    crew_current    : 1
    crew_max        : 80
    crew_killDamage : 6                    # Damage > this has a chance of killing some crew 
    crew_killChance : 0.8                  # Chance 1 crew member is killed
    constructor : (params) ->
      super params
      @build_crew = SCAFFOLD_BUILD_REQUIREMENTS[@build_type]
  
  class AmmoDump extends Structure
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
    hDist2          : 64
    sight           : 3
    health_current  : [800, 900]
    health_max      : [800, 1100]
    reload_ing      : 0
    reload_time     : 50
    ammo_clip       : 6
    ammo_max        : 6
    shoot_dy        : -5
    projectile      : 'MGBullet'
    crew_current    : 0
    crew_max        : 4
    crew_killDamage : 23   # Damage > this has a chance of killing some crew 
    crew_killChance : 0.2  # Chance 1 crew member is killed
  
  class SmallTurret extends Structure
    hDist2         : 90
    sight          : 5
    health_current : [1900, 2100]
    health_max     : [2100, 2300]
    reload_ing     : 0
    reload_time    : 90
    turn_ing       : 0
    turn_current   : 0
    turn_last      : 4
    ammo_clip      : 1
    ammo_max       : 1
    shoot_dy        : -6
    projectile     : 'SmallShell'
    getName : ->
      "turret-#{@team}-#{@direction}-#{@state}-#{@turn_current}"
  
  class MissileRack extends Structure
    hDist2          : 64
    sight           : 13
    health_current  : [200, 280]
    health_max      : [280, 300]
    projectile      : 'HomingMissile'
    reload_ing      : 0
    reload_time     : 2900
    ammo_clip       : 1
    ammo_max        : 1
    ammo_supply     : 3
    ammo_maxSupply  : 3
    shoot_dy        : -20
    getName : ->
      if @reload_ing > 40 or @health_current <= 0
        hasAmmo = 0
      else
        hasAmmo = 1
      "missilerack-#{@team}-#{@direction}-#{hasAmmo}"
  
  class MissileRackSmall extends Structure
    hDist2            : 18
    sight             : 9
    health_current    : [100, 180]
    health_max        : [180, 200]
    projectile        : 'HomingMissileSmall'
    canTargetAircraft : true
    reload_ing        : 0
    reload_time       : 190
    ammo_clip         : 1
    ammo_max          : 1
    ammo_supply       : 12
    ammo_maxSupply    : 12
    shoot_dy          : -8
    getName : ->
      if @reload_ing > 30 or @health_current <= 0
        hasAmmo = 0
      else
        hasAmmo = 1
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