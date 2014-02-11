define [
  'core/util/SimpleHash'
  'core/Battle/Player'
  'core/Battle/Player.Build'
  'core/Battle/Player.AI.Vision'
  'core/Battle/Player.AI.Squad'
  'core/Battle/Player.AI.Construct'
], (SimpleHash, Player, PlayerBuild, AIVision, AISquad, AIConstruct) ->
  
  TRAIT = # Strategic
    AGGRESSIVE : 0 # Stops at nothing to destroy enemy. Scouts often, at first opportunity.
    PASSIVE    : 1 # Does nothing.
    DEFENSIVE  : 2 # Scouts occasionally cash permitting.
  
  SKILL = # Tactical
    INFANTRY     : 0 # Manages Infantry squads well
    STRUCTURE    : 1 # Manages Structures well
    INDIRECT     : 2 # Bias toward indirect fire weapons
    BASE_DEFENSE : 3 # Bias toward fortifying existing bases
    CHEAP        : 4 # Bias toward cheapest means of victory
  
  BUILD_PRIORITY =
    AGGRESSIVE :
      PistolInfantry : 4
      RocketInfantry : 1
  
  class AIPlayer extends Player
    AI    : true
    
    TRAIT : TRAIT.AGGRESSIVE
    SKILL : SKILL.CHEAP
    
    BUILD_IDLE_UNIT : ->
      # todo: make this not so random later
      #type = $.AR(@buildable_units)
      type = $.WR BUILD_PRIORITY.AGGRESSIVE
      @build(type, null, null, true) if type?
    
    FORM_SQUAD : ->
      # todo: hard coded for now. the squad should be mixed later
      type = $.WR BUILD_PRIORITY.AGGRESSIVE
      @squad.form type
    
    SEND_SCOUT_SQUAD : ->
      @squad.sendIdleSquadToScout @vision.getNextLocationScout()
    
    # todo: move this into AIConstruct
    CONSTRUCT_INITIAL_BASE : ->
      for k, v of @starting_inventory
        temp_instance = new @battle.world.Classes[k] { team : @team }
        x = @build_x
        until @_checkBuildLocationValid(x, temp_instance) or x < 0
          x += @dx * $.R(1,8)
          
        unless x < 0
          entity = @battle.MODE.ConstructBase::addEntityToWorld.call(@, k, x)
          @addEntity entity
          @commands.push 'CONSTRUCT_INITIAL_BASE'
          @build_x = x
          @starting_inventory[k]--
          delete @starting_inventory[k] if @starting_inventory[k] is 0
          return
      return

    _checkBuildLocationValid : (x, t) ->
      cb = @battle.MODE.ConstructBase
      check1 = cb::checkLocationTerrain.call @, x, t
      check2 = cb::checkLocationEmptyOfExistingStructure.call @, x, t
      check1 and check2

    _processNextCommand : ->
      if @commands.length > 0
        command = @commands.shift()
        @[command]()
      else
        if $.r() < 0.7 # Make AI player less aggressive for now
          if $.r() < $.r(0.01)
            @commands.push 'BUILD_IDLE_UNIT'
          else if $.r() < $.r(0.03)
            @commands.push 'FORM_SQUAD'
          else if $.r() < $.r(0.05)
            @commands.push 'SEND_SCOUT_SQUAD' 
  
    tick : ->
      @_processNextCommand()
      @squad.tick()
      @buildsystem.tick()
      @superweapon.tick()

    build_x : 0
    
    addEntity : (p) ->
      p.AI = true
      if p instanceof @battle.world.Classes.Structure
        @structures.push p
        @_addBuildCapability p
        @vision.addStructure p
      else
        @units.push p
        @squad.addUnit p

    constructor : (params) ->
      super params
      
      @direction = 0
      @dx = [-1, 1][@direction]
      @build_x = @battle.world.w - $.R(20,80)
      @LOCATIONVALIDTHRESHOLD = @battle.MODE.ConstructBase::LOCATIONVALIDTHRESHOLD
      
      childrenParams =
        player : @
        battle : @battle
      
      @squad       = new AISquad     childrenParams
      @vision      = new AIVision    childrenParams
      @construct   = new AIConstruct childrenParams
      
      # Queuing  
      @buildsystem = new PlayerBuild childrenParams