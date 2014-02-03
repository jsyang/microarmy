define ->
  
  STATE =
    UNEXPLORED : 0
    # ENEMY      : 3 # Is the enemy occupying this position?
    VISITED    : 1 # Have AI units been here before?
    ACTIVE     : 2 # Are AI structures here now?
    
  
  class AIPlayerVision
  
    # bug: doesn't set the correct rally, always 0
    getNextLocationScout : ->
      scoutLeft  = Infinity
      scoutRight = 0
      centerOfControl = @_calculateCentroid()
      
      if centerOfControl?
        for v, x in @vision
          unless v is STATE.UNEXPLORED
            prev = @vision[x - 1]
            next = @vision[x + 1]
            if prev? and prev is STATE.UNEXPLORED
              x1 = x - $.R(1,200)
              x1 = 0 if x1 < 0
              if x1 < scoutLeft
                scoutLeft = x1
            if next? and next is STATE.UNEXPLORED
              x2 = x + $.R(1,200)
              x2 = @battle.world.w - 1 if x2 >= @battle.world.w
              if x2 > scoutRight
                scoutLeft = x1
            # Pick the farther location to scout, since what it will tell us is more important
            distScoutLeft  = Math.abs(scoutLeft - centerOfControl)
            distScoutRight = Math.abs(scoutRight - centerOfControl)
            if distScoutRight > distScoutLeft
              return scoutRight
            else
              return scoutLeft
      else
        return
    
    # todo:
    getNextLocationAttack : ->
    getNextLocationOperatingBase : ->
    getNextLocationFireBase : ->
    
    addStructure : (p) ->
      x1 = p.x - (p.sight << 6)
      x2 = p.x + (p.sight << 6)
      for x in [x1 .. x2]
        @vision[x] = STATE.ACTIVE
    
    # Called from AIPlayer.removeEntity()
    removeActiveStructure : (p) ->
      x1 = p.x - (p.sight << 6)
      x2 = p.x + (p.sight << 6)
      for x in [x1 .. x2]
        @vision[x] = STATE.VISITED
    
    addUnitVisit : (p) ->
      if @vision[p.x] is STATE.UNEXPLORED
        @vision[p.x] = STATE.VISITED
  
    _calculateCentroid : ->
      sum = 0
      n   = 0
      for v, x in @vision
        unless v is STATE.UNEXPLORED
          sum += v * x
          n++
      centroid = sum / n if n > 0
  
    constructor : (params) ->
      @[k] = v for k, v of params
      # Track where the AI should send scouts / attack
      @vision = new Uint8ClampedArray @battle.world.w