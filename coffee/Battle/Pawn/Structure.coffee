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
    
    STATE : STATE
    
    # This number is computed usually by squaring the smallest dimension of the sprite
    hDist2 : 0
    
    targetable  : true
    crumbled    : false # already destroyed?
    corpsetime  : 1
    target      : null
    state       : STATE.GOOD
    
    # adjustments to the projectile origin
    shootDy : 0
    shootDx : 0
    
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
      name = @getName()
      @_halfHeight = GFXINFO[name].height >> 1
      @_setVariableStats
      
    _setVariableStats : ->
      @[stat] = $.R.apply(@, @[stat]) for stat in VARIABLESTATS when @[stat] instanceof Array

    takeDamage : (dmg) ->
      if dmg > 0
        @health_current -= dmg
        
        if @health_current <= 0
          @health_current = 0
          @state = @STATE.WRECK
          
        else if @health_current < 0.6 * @health_max
          @state = @STATE.BAD
  
  class CommCenter extends Structure
    hDist2 : 196
    health_current : [2100, 2500]
    health_max     : [2500, 2600]
  
    reinforce :
      ing  : 0
      time : 10
      
      supplyType    : null
      supplyNumber  : 0
      rallyPoint    : null
      engineerBuild : null
      parentSquad   : null      # the squad which spawned unit belongs to when created
      
      damageThreshold   : 18    # damage taken above this destroys reinforcement supply
      damageChance      : 0.4   # chance the reinforcements will be harmed when > damageThreshold

      types :
        PistolInfantry    : 400
        RocketInfantry    : 600
        EngineerInfantry  : 40
  
  class Barracks extends Structure
    hDist2 : 169
    health_current : [1800, 1950]
    health_max     : [1950, 2500]
      
    reinforce :
      ing   : 0
      time  : 10
      
      supplyType    : null
      supplyNumber  : 0
      rallyPoint    : null
      engineerBuild : null
      parentSquad   : null      # the squad which spawned unit belongs to when created
      
      damageThreshold   : 24    # damage taken above this destroys reinforcement supply
      damageChance      : 0.6   # chance the reinforcements will be harmed when > damageThreshold

      types :
        PistolInfantry    : 300
        EngineerInfantry  : 10
  
  class Scaffold extends Structure
    hDist2 : 64
    
    health_current : [360, 400]
    health_max     : [400, 450]
    
    build :
      type : 'Pillbox'
    
    crew :
      current   : 1
      max : SCAFFOLD_BUILD_REQUIREMENTS
        
      occupied  : 'scaffold'
      empty     : 'scaffold_'
      
      damageThreshold : 5
      damageChance    : 1
  
  
  
  class AmmoDump extends Structure
    hDist2 : 100
    sight  : 6
    health_current : [80,  120]
    health_max     : [130, 150]
    reload :
      ing   : 0
      time  : 500
    supply :
      HomingMissile       : $.R(10,20)
      HomingMissileSmall  : $.R(60,80)
  
  class AmmoDumpSmall extends Structure
    hDist2 : 25
    health_current : [80,  120]
    health_max     : [130, 150]
    reload :
      ing   : 0
      time  : 300
    supply :
      HomingMissileSmall  : $.R(30,40)
    sight : 5
    getName : ->
      "#{@constructor.name.toLowerCase()}-#{@team}"
  
  class MineFieldSmall extends Structure
    corpsetime : 0
    maxMines   : 4
    # todo: have these spawn some mines

  class Depot extends Structure # future.
    hDist2 : 260
  
  class RepairYard extends Structure
    hDist2 : 196
      
  class Helipad extends Structure # future.
    hDist2 : 130
  
  class CommRelay extends Structure # future.
    hDist : 220
    health_current : [560, 600]
    health_max     : [600, 750]
    
  class WatchTower extends Structure # future.
    hDist : 196      
    sight : 13
    health_current : [300, 350]
    health_max     : [360, 400]
  
  # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
  
  class Pillbox extends Structure
    hDist2 : 64
    health_current : [800, 900]
    health_max     : [800, 1100]
    reload :
      ing   : 0
      time  : 50
    ammo :
      clip  : 6
      max   : 6
    shootDy     : -5
    sight       : 3
    projectile  : 'MGBullet'
    crew :
      current   : 0
      max       : 4
      occupied  : 'pillbox'
      empty     : 'pillbox_'
      
      damageThreshold : 23
      damageChance    : 0.2
  
  class SmallTurret extends Structure
    hDist2 : 90
    health_current : [1900, 2100]
    health_max     : [2100, 2300]
    reload :
      ing   : 0
      time  : 90
      
    turn_ing     : 0
    turn_current : 0
    turn_last    : 4
    
    ammo :
      clip  : 1
      max   : 1
    shootDy     : -6
    sight       : 5
    projectile  : 'SmallShell'
    
    getName : ->
      "turret-#{@team}-#{@direction}-#{@state}-#{@turn_current}"
  
  class MissileRack extends Structure
    hDist2 : 64
    sight : 13
    health_current : [200, 280]
    health_max     : [280, 300]
    projectile : 'HomingMissile'
    reload :
      ing   : 240
      time  : 2900

    ammo_clip      : 1
    ammo_max       : 1
    ammo_supply    : 3
    ammo_maxSupply : 3
    
    shootDy : -20
    getName : ->
      if @reload_ing > 40 or @health_current <= 0
        hasAmmo = 0
      else
        hasAmmo = 1
        
      "missilerack-#{@team}-#{@direction}-#{@state}-#{hasAmmo}"
  
  class MissileRackSmall extends Structure
    hDist2 : 18
    sight : 9
    health_current : [100, 180]
    health_max     : [180, 200]
    projectile : 'HomingMissileSmall'
    canTargetAircraft : true
    reload :
      ing   : 60
      time  : 190
    ammo :
      clip      : 1
      max       : 1
      supply    : 12
      maxSupply : 12
    shootDy : -8
    getName : ->
      if @reload_ing > 40 or @health_current <= 0
        hasAmmo = 0
      else
        hasAmmo = 1
        
      "missileracksmall-#{@team}-#{@direction}-#{@state}-#{hasAmmo}"
  
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