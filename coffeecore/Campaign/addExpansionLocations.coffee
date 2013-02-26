# add locations.
define [
  'core/util/$'
  'core/util/weightedRandom'
], ($, $WR) ->
  (_) ->
    expandedLocs = [];
    
    if !_.map? or !_.locations
      throw new Error 'input needs generated terrain!'
    else
    
      getTile = (x,y) ->
        if _.map[y]? and _.map[y][x]? then _.map[y][x] else undefined
    
      # try and build a location if terrain is suitable
      expandLocation = (origin) ->
        [x, y] = [origin.x, origin.y]
        (
          if $.R(0,1)
            x += if $.R(0,1) then 1 else -1
          else
            y += if $.R(0,1) then 1 else -1
          
          tile = getTile x, y
          
          if tile? and tile.height>=_.seaLevel and !(tile.location?)
            # Weighted random assign expansion purposes
            switch origin.type
              when 'city'
                expansionType = $WR {
                  'oilwell' : 1
                  'farm'    : 4
                  'factory' : 1
                  'mine'    : 2
                }
              when 'base'
                expansionType = $WR {
                  'oilwell' : 2
                  'farm'    : 1
                  'factory' : 3
                  'mine'    : 1
                }
            
            # Build the new location
            expansionLoc = {
              x
              y
              type : expansionType
            }
            
            tile.location = expansionLoc
            tile.road     = true
            
            expandedLocs.push expansionLoc
        ) for i in [0..4] # try to build 4 times in random direction
        return
      
      # Build expansion territories for each 
      expandLocation(loc) for loc in _.locations
      
      _.locations = _.locations.concat expandedLocs
      _
      