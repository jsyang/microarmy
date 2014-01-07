define ->
  # Tallies events which involve Battle Pawn instances that happened within a period of game cycles.
  # ex: Bucket 4 ( 64 < battlefieldX <= 128 ) has 45 total deaths for team 0 within last 100 game cycles.
  #     --> Team 0 AI finds location of the most significant events and responds accordingly
  
  # todo: rename this?
  class SimpleHash
    constructor : (_) ->
      if _.w?
        @_ = $.extend {
          BUCKETWIDTH   : 6   # depending on the use of the SimpleHash, this value should coincide with XHash
          PERIOD        : 100
          cycles        : 0
          
          
          weights :
          # how much does it matter that this event happened to this unit type?
            'PistolInfantry'    : 1
            'RocketInfantry'    : 4
            'EngineerInfantry'  : 6
            
          # todo: generalize this so it's useful for any event? not just unit deaths?
          # maybe not such a good idea? use multiple simplehashes vs 1 simplehash for all events?
          # ex: each bucket = {
          #   eventName : {
          #     teamID1 : count for eventName events which happened to units that belong to teamID1
          #     teamID2 : count for eventName events which happened to units that belong to teamID2
          #   }
          # }
          
        }, _
      else
        throw new Error 'no width specified!'
    
    flush : ->
      @_.cycles   = 0
      @_.buckets  = ( {} for i in [0..(@_.w>>@_.BUCKETWIDTH)] )
      @
      
    add : (pawn) ->
      bucket = @_.buckets[pawn._.x>>@_.BUCKETWIDTH]
      
      if bucket?
        team   = pawn._.team
        type   = pawn.constructor.name
        weight = @_.weights[type]
        weight = if weight? then weight else 1
          
        if bucket[team]?
          bucket[team] += weight
        else
          bucket[team] = weight
      
      return
    
    getModeBucket : (team) ->
      maxEvent     = 0
      maxEventIndex = -1
      (
        teamCount = @_.buckets[i][''+team]

        if teamCount > maxEvent
          maxEventIndex = i
          maxEvent      = teamCount
      ) for i in [0...@_.buckets.length]
    
      maxEventIndex
    