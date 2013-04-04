define [
  'core/Battle/Pawn'
], (Pawn) ->

  STATE =
    GOOD  : 0
    BAD   : 1
    WRECK : 2

  class Structure extends Pawn
    # todo: might have to modify these so the prototype can be mutated by a
    #       team upon research bonus / experience bonus
    
    constructor : (_) ->
      @_ = $.extend {
        targetable  : true
        corpsetime  : 1
        target      : null
        state       : STATE.GOOD
        # adjustments to the projectile origin
        shootDy     : 0
        shootDx     : 0
      }, _
      super @_
      @setSpriteSheet()
    
    gfx : ->
      {
        img     : @_.img.sheet
        imgdx   : if @_.direction>0 then @_.img.w else 0
        imgdy   : @_.state*@_.img.h
        worldx  : @_.x-(@_.img.w>>1)
        worldy  : @_.y-@_.img.h+1
        imgw    : @_.img.w
        imgh    : @_.img.h
      }

  
  class CommCenter extends Structure
    constructor : (_) ->
      @_ = $.extend {
        img : { w:28, h:28, hDist2:196, sheet:'comm' }
        health :
          current : $.R(2100,2500)
          max     : $.R(2500,2600)
          
        reinforce :
          ing   : 0
          time  : 10
          
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
      }, _
      super @_
  
  class Barracks extends Structure
    constructor : (_) ->
      @_ = $.extend {
        img : { w:32, h:12, hDist2:169, sheet:'barracks' }
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
      }, _
      super @_
  
  class Scaffold extends Structure
    # todo: assign a build cost for each structure for the scaffold.
    constructor : (_) ->
      @_ = $.extend {
        img : { w:16, h:8, hDist2:64, sheet:'scaffold_' }
        health :
          current : $.R(360,400)
          max     : $.R(400,450)
        build :
          type : null
        crew :
          current   : 1
          max       : 2
          occupied  : 'scaffold'
          empty     : 'scaffold_'
          
          damageThreshold : 5
          damageChance    : 1
      }, _
      super @_
      soundManager.play('tack')
  
  class CommRelay extends Structure
    # todo: this structure needs a purpose!
    constructor : (_) ->
      @_ = $.extend {
        img : { w:15, h:27, hDist2:220, sheet:'relay' }
        health :
          current : $.R(560,600)
          max     : $.R(600,750)
      }, _
      super @_
  
  class WatchTower extends Structure
    constructor : (_) ->
      @_ = $.extend {
        img : { w:13, h:21, hDist2:196, sheet:'watchtower' }
        health :
          current : $.R(300,350)
          max     : $.R(360,400)
        sight : 13
      }, _
      super @_
  
  # todo: look up how to bind code sniplets
  
  class AmmoDump extends Structure
    constructor : (_) ->
      @_ = $.extend {
        img : { w:18, h:9, hDist2:100, sheet:'ammodump' }
        health :
          current : $.R(80,120)
          max     : $.R(130,150)
        reload :
          ing   : 0
          time  : 500
        supply :
          HomingMissile       : $.R(10,20)
          HomingMissileSmall  : $.R(60,80)
        sight : 6
      }, _
      @_.totalSupply = $.sum(@_.supply)
      super @_
  
  class AmmoDumpSmall extends Structure
    constructor : (_) ->
      @_ = $.extend {
        img : { w:4, h:6, hDist2:25, sheet:'ammodumpsmall' }
        health :
          current : $.R(80,120)
          max     : $.R(130,150)
        reload :
          ing   : 0
          time  : 300
        supply :
          HomingMissileSmall  : $.R(30,40)
        sight : 5
      }, _
      @_.totalSupply = $.sum(@_.supply)
      super @_
  
  class MineFieldSmall extends Structure
    # todo: have these spawn some mines
    constructor : (_) ->
      @_ = $.extend {
        img : { w:200, h: 1 }
        corpsetime : 0
        maxMines : $.R(3,4)
      }, _
      super @_
  
  
  # todo: needs a purpose
  class Depot extends Structure
    constructor : (_) ->
      @_ = $.extend {
        img : { w:39, h:16, hDist2:260, sheet:'depot' }
      }, _
      super @_
  
  # todo: needs a purpose
  class RepairYard extends Structure
    constructor : (_) ->
      @_ = $.extend {
        img : { w:28, h:14, hDist2:196, sheet:'repair' }
      }, _
      super @_
      
  # todo: needs a purpose
  class Helipad extends Structure
    constructor : (_) ->
      @_ = $.extend {
        img : { w:28, h:11, hDist2:130, sheet:'helipad' }
      }, _
      super @_
  
  # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
  
  class Pillbox extends Structure
    constructor : (_) ->
      @_ = $.extend {
        img : { w:19, h:8, hDist2:64, sheet:'pillbox_' }
        health :
          current : $.R(800,900)
          max     : $.R(800,1100)
        reload :
          ing   : 0
          time  : 50
        ammo :
          clip  : 6
          max   : 6
        shootDy     : 5
        sight       : 3
        projectile  : 'MGBullet'
        crew :
          current   : 0
          max       : 4
          occupied  : 'scaffold'
          empty     : 'scaffold_'
          
          damageThreshold : 23
          damageChance    : 0.2
      }, _
      super @_
  
  # CLASS MUTATOR EX # # # # # # # # # # # #
  # class SmallTurret extends Structure
  #   properties :
  #     health :
  #       current : $.R(1900,2100)
  #       max     : $.R(2100,2300)
  #     reload :
  #       ing   : 0
  #       time  : 90
  #     ...
  #   constructor : (_) ->
  #     @_ = $.extend @properties, _
  #
  # class SmallTurret_0_Fortified extends SmallTurret
  # $.extend SmallTurret_Fortified.prototype, {
  #   extraProperties / overridingProperties
  # }
  # 
  # or modify the original
  # or maybe come up with a better way to do this
  
  class SmallTurret extends Structure
    constructor : (_) ->
      @_ = $.extend {
        img : { w:22, h:9, hDist2:90, sheet:'turret' }
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
        shootDy     : 6
        sight       : 5
        projectile  : 'SmallShell'
      }, _
      super @_
    
    gfx : ->
      # turning graphics
      imgdy = if @_.state!=STATE.WRECK then @_.state*45+@_.img.h*@_.turn.current else 90
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
    constructor : (_) ->
      @_ = $.extend {
        img : { w:5, h:9, hDist2:64, sheet:'missilerack' }
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
        shootDy : 3
      }, _
      super @_
      
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
  
  class MissileRackSmall extends MissileRack
    constructor : (_) ->
      @_ = $.extend {
        img : { w:4, h:7, hDist2:18, sheet:'missileracksmall' }
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
        shootDy : 2
      }, _
      super @_
  
  # export
  (Classes) ->
    $.extend(Classes, {
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
    })