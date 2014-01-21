define [
  'core/Battle/Pawn'
], (Pawn) ->

  STATE =
    GOOD  : 0
    BAD   : 1
    WRECK : 2

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
      # todo : need to use GFXINFO[name] for this
      dy = Math.abs(@y - (@img.h>>1)) - dy
      dx*dx + dy*dy

    takeDamage : (dmg) ->
      if dmg > 0
        @health.current -= dmg
        
        if @health.current <= 0
          @health.current = 0
          @state = @STATE.WRECK
          
        else if @health.current < 0.6 * @health.max
          @state = @STATE.BAD

  
  class CommCenter extends Structure
    hDist2 : 196
    
    health :
      # todo : fix these
      current : $.R(2100,2500)
      max     : $.R(2500,2600)
  
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
    
    health :
      current : $.R(1800,1950)
      max     : $.R(1950,2500)
      
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
    
    health :
      current : $.R(360,400)
      max     : $.R(400,450)
    
    build :
      type : 'Pillbox'
    
    crew :
      current   : 1
      max       :
        'Pillbox'           : 4
        'MissileRack'       : 8
        'MissileRackSmall'  : 1
        'SmallTurret'       : 6
        'Barracks'          : 16
        'CommCenter'        : 60
        'MineFieldSmall'    : 1
        'AmmoDumpSmall'     : 1
        'AmmoDump'          : 2
      occupied  : 'scaffold'
      empty     : 'scaffold_'
      
      damageThreshold : 5
      damageChance    : 1
  
  # todo: finish this structure
  class CommRelay extends Structure
    hDist : 220
    health :
      current : $.R(560,600)
      max     : $.R(600,750)
    
  # todo: finish this structure
  class WatchTower extends Structure
    hDist : 196      
    sight : 13
    health :
      current : $.R(300,350)
      max     : $.R(360,400)
  
  class AmmoDump extends Structure
    hDist2 : 100
    sight  : 6
    health :
      current : $.R(80,120)
      max     : $.R(130,150)
    reload :
      ing   : 0
      time  : 500
    supply :
      HomingMissile       : $.R(10,20)
      HomingMissileSmall  : $.R(60,80)
  
  class AmmoDumpSmall extends Structure
    hDist2 : 25
    health :
      current : $.R(80,120)
      max     : $.R(130,150)
    reload :
      ing   : 0
      time  : 300
    supply :
      HomingMissileSmall  : $.R(30,40)
    sight : 5
    
  class MineFieldSmall extends Structure
    corpsetime : 0
    maxMines   : 4
    # todo: have these spawn some mines

  # todo: needs a purpose
  class Depot extends Structure
    hDist2 : 260
  
  # todo: needs a purpose
  class RepairYard extends Structure
    hDist2 : 196
      
  # todo: needs a purpose
  class Helipad extends Structure
    hDist2 : 130
  
  # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
  
  class Pillbox extends Structure
    hDist2 : 64
    health :
      current : $.R(800,900)
      max     : $.R(800,1100)
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
    health :
      current : $.R(1900,2100)
      max     : $.R(2100,2300)
    reload :
      ing   : 0
      time  : 90
    turn :
      ing     : 0
      current : 0
      last    : 4
    ammo :
      clip  : 1
      max   : 1
    shootDy     : -6
    sight       : 5
    projectile  : 'SmallShell'
    
    # todo : convert this
    gfx : ->
      # turning graphics
      imgdy = if @_.state!=@CONST.STATE.WRECK then @_.state*45+@_.img.h*@_.turn.current else 90
      imgdx = if @_.direction>0 then @_.img.w else 0
      {
        img     : @_.img.sheet
        imgdx
        imgdy
          
        worldx  : @_.x-(@_.img.w>>1)
        worldy  : @_.y-@_.img.h+1
        imgw    : @_.img.w
        imgh    : @_.img.h
      }
  
  class MissileRack extends Structure
    hDist2 : 64
    sight : 13
    health :
      current : $.R(200,280)
      max     : $.R(280,300)
    projectile : 'HomingMissile'
    reload :
      ing   : 240
      time  : 2900
    ammo :
      clip      : 1
      max       : 1
      supply    : 3
      maxSupply : 3
    shootDy : -20
    
    # todo : convert this  
    gfx : ->
      imgdy = @_.img.h
      if @_.health.current>0
        if @_.ammo.supply>0 
          if @_.ammo.clip
            imgdy = 0
          else if !@_.ammo.clip and @_.reload.ing<40
            imgdy = 0
      else
        imgdy = @_.img.h<<1
        
      imgdx = if @_.direction>0 then @_.img.w else 0
      
      {
        img     : @_.img.sheet
        imgdx
        imgdy 
        worldx  : @_.x-(@_.img.w>>1)
        worldy  : @_.y-@_.img.h+1
        imgw    : @_.img.w
        imgh    : @_.img.h
      }
  
  class MissileRackSmall extends Structure
    hDist2 : 18
    sight : 9
    health :
      current : $.R(100,180)
      max     : $.R(180,200)
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
    
    # todo : convert this
    gfx : MissileRack.prototype.gfx
  
  exportClasses = {
    Structure # needed for instanceof check in World::add()
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