define ->
  class AIPlayerSquad
    SQUADSIZE  : 5
    MAXSQUADS  : 6
    SQUADCYCLE : 50 # Period the squad is updated
    
    cycle : 0
  
    _updateSquadGoals : ->
      squadList = []
      for oldSquad in @squads
        newSquad = []
        oldSquadSize = oldSquad
        membersWithoutGoal = 0
        for p in oldSquad
          unless p.isDead() or p.isPendingRemoval()
            membersWithoutGoal++ unless p.goal?
            newSquad.push p
        
        if newSquad.length > 0 and membersWithoutGoal is oldSquadSize
          @idle_squads.push newSquad
      return
  
    _updateSquads : (type = 'squads') ->
      squadList = []
      for oldSquad in @[type]
        newSquad = []
        for p in oldSquad
          unless p.isDead() or p.isPendingRemoval()
            newSquad.push p
        
        if newSquad.length > 0
          squadList.push newSquad
      @[type] = squadList
  
    _updateIdleUnits : ->
      newIdleUnits = []
      for p in @idle_units
        unless p.isDead() or p.isPendingRemoval()
          newIdleUnits.push p
      @idle_units = newIdleUnits

    _setSquadRally : (squad, x) ->
      for p in squad
        unless p.isDead() or p.isPendingRemoval()
          p.goal = p.GOAL.MOVE_TO_RALLY
          p.rally_x = x
          p.behavior = 'AIInfantry'
      return

    # jsyang : not used yet
    dissolve : (squad) ->
      for p in squad
        unless p.isDead() or p.isPendingRemoval()
          @idle_units.push p
  
    form : (type) ->
      return unless type?
      return if @idle_units.length < @SQUADSIZE

      squad = []
      for p in @idle_units
        if p instanceof @battle.world.Classes[type]
          if squad.length < @SQUADSIZE
            squad.push p
          else
            break
      
      if squad.length > 0
        @idle_squads.push squad
      return squad
  
    addUnit : (p) ->
      @idle_units.push p
  
    sendIdleSquadToScout : (x) ->
      squad = @idle_squads.shift()
      @_setSquadRally(squad, x) if squad?
  
    tick : ->
      if @cycle > 0
        @cycle--
      else
        @_updateSquads()
        @_updateSquads 'idle_squads'
        @_updateIdleUnits()
        @_updateSquadGoals()
        @cycle = @SQUADCYCLE
  
    constructor : (params) ->
      @[k] = v for k, v of params
      @idle_units = []
      @idle_squads = []
      @squads = []
      