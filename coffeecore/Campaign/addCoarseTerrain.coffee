define ->
  # add terrain to the world.
  (_) ->
    _ = $.extend {
      maxHeight     : 4
      numPeaks      : $.R(_.w>>2,_.w<<1)
      maxPeakHeight : 4
      seaLevel      : 1
    }, _

    if !_.w? or !_.h?
      throw new Error 'width or height not set!'

    else
      # 2D map array
      map = (({
        x       : x
        y       : y
        height  : 0
      } for x in [0..._.w]) for y in [0..._.h])
      
      # peaks = seeds
      peaks = ({
        x       : $.r(_.w) >> 0
        y       : $.r(_.h) >> 0
        height  : $.R(0, _.maxPeakHeight)
      } for i in [1.._.numPeaks])
      
      # func to draw a box around a point
      rectFill = (peak) ->
        w = $.R(peak.height>>1, peak.height<<1)
        h = $.R(peak.height>>1, peak.height<<1)
        [x, y]  = [peak.x, peak.y]
        height2 = peak.height*peak.height
        height_ = 1/height2
        
        height2 = peak.height*1.5
        height2 *= height2
        
        (
          (
            [x2, y2] = [dx-x, dy-y]
            x2 *= x2
            y2 *= y2
            if map[dy]? and map[dy][dx]? and x2+y2<height2
              dheight = 3-((x2+y2)*height_)
              map[dy][dx].height += dheight>>0
              if map[dy][dx].height>_.maxHeight then map[dy][dx].height = _.maxHeight
                
          ) for dx in [x-w..x+w]
        ) for dy in [y-h..y+h]
        return
      
      # do this for all peaks
      rectFill(peak) for peak in peaks
      
      # return the world with terrain bolted on
      $.extend {
        coarsemap : map
        peaks 
      }, _