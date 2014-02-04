define ->
  
  # Mission Conditions
  WIN =
    EXTERMINATE : ->
      @battle.enemy.structures.length + @battle.enemy.units.length is 0
      
    #DEFEND_TIMER : ->
  
  LOSE =
    ALL_UNITS_AND_STRUCTURES_DESTROYED : ->
      @battle.player.structures.length + @battle.player.units.length is 0
    
    COMMCENTER_DESTROYED : ->
      unless 'CommCenter' of @battle.player.built_structures
        for s in @battle.player.structures
          if s instanceof @battle.world.Classes.CommCenter
            return true
      return false
  
  class BattleMission
    WIN  : WIN
    LOSE : LOSE
    
    CYCLES_PER_TICK : 200
    cycle : 0

    _checkMissionConditions : (type) ->
      for condition in @[type]
        if @[type.toUpperCase()][condition].call(@) is true
          return true
      false
    
    # todo: pause the game / whatever?
    _handleWin : ->
      @battle.EVA.clear()
      @battle.EVA.MISSION_ACCOMPLISHED()
      @stop()
      
    _handleLose : ->
      @battle.EVA.clear()
      @battle.EVA.MISSION_FAILED()
      @stop()
    
    start : -> @cycle = 0
    stop  : -> @cycle = Infinity
      
    
    tick : ->
      if @cycle > 0
        @cycle--
      else
        @cycle = @CYCLES_PER_TICK
        @_handleLose() if @_checkMissionConditions 'lose'
        @_handleWin()  if @_checkMissionConditions 'win'
  
    constructor : (params) ->
      @[k] = v for k, v of params
      @stop()