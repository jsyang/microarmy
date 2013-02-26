# add locations.
define [
  'core/util/$'
  'core/util/weightedRandom'
], ($, $WR) ->
  (_) ->
    _ = $.extend {
      numLocations : 10
    }, _
    
    if !_.map? or !_.peaks?
      throw new Error 'input needs generated terrain!'
    else
    
      getTile = (x,y) ->
        if _.map[y]? and _.map[y][x]? then _.map[y][x] else undefined
    
      # R^2 distance^2
      dist2 = (p1, p2) ->
        if p1? and p2?
          [dx,dy] = [p2.x-p1.x, p2.y-p1.y]
          dx*dx + dy*dy
        else
          0
      
      # try to find a good origin
      findOrigin = (origin0) ->
        (
          origin1 = $.pickRandom _.peaks
          if dist2(origin0,origin1) < distThreshold
            return origin1
        ) for i in [0..3]
        return
      
      # try and build a location if terrain is suitable
      buildLocation = (origin) ->
        [tx,ty] = [_.w*0.2*($.r()-$.r()), _.h*0.2*($.r()-$.r())]
        [x, y ] = [origin.x             , origin.y]
        (
          [x,y] = [(x+tx)>>0, (y+ty)>>0]
          tile = getTile x, y
          # todo: add distinctions in terms of contained resources for cities / farms / mines / oil wells
          loc =
            type : $WR {
                'city'  : 4
                'base'  : 1
              }
          
          if tile? and tile.height>=_.seaLevel
            loc = $.extend {
              x
              y
              peak : origin
            }, loc
            
            tile.location = loc
            tile.road     = true
            
            return loc
            
        ) for i in [0..9] # try 10 times to build a location
        return
      
      locs = []
      
      # Co-locate in a decreasing neighborhood of peaks
      distThreshold = _.w*_.h*0.6
      (
        lastOrigin = findOrigin lastOrigin
        if lastOrigin?
          loc = buildLocation lastOrigin
          if loc? then locs.push loc 
        
        # reduce the neighborhood size of available next origins
        distThreshold *= 0.98
      ) until locs.length == _.numLocations
      
      _.locations = locs 
      _
      