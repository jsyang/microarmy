# Simple Hash
# Tallies events which happen within a period
# ex: Bucket 4 has 45 deaths within last 30 game cycles.

define ->
  class SimpleHash
    constructor : (_) ->
      if _.w?
        @_ = $.extend {
          BUCKETWIDTH   : 6   # depending on the use of the SimpleHash, this value should coincide with XHash
          PERIOD        : 100
          cycle         : 0
          
          
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
          
        }
    
    flush : ->
      @_.cycles   = 0
      @_.buckets  = ( {} for i in [0..(@_.w>>@_.BUCKETWIDTH)] )
      @
      
    add : (pawn) ->
      bucket = @_.buckets[pawn._.x>>@_.BUCKETWIDTH]
      team   = pawn._.team
      type   = pawn.constructor.name
      
      if bucket[team]?
        bucket[team] += @_.weights[type]
      else
        bucket[team] = @_.weights[type]
      @
    
    getModeBucket : (team) ->
      maxEvent     = 0
      maxEventIndex = -1
      (
        b = @_.buc
        
        if b[team]? and b[team] > maxEvent
          maxEventIndex =
      ) for i in @_.buckets