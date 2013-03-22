define ->
  # add terrain to the world.
  (_) ->
    _ = $.extend {
      maxHeight     : 4
      numPeaks      : $.R(_.w>>1,_.w<<1)
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
        road    : false
      } for x in [0..._.w]) for y in [0..._.h])
      
      # peaks = seeds
      peaks = ({
        x       : $.r(_.w) >> 0
        y       : $.r(_.h) >> 0
        height  : $.R(_.seaLevel, _.maxPeakHeight)
      } for i in [1.._.numPeaks])
      
      # func to draw a "lossy" box around a point
      chanceFill = (peak, distFromCenter) ->
        [x, y]  = [peak.x, peak.y]
        dheight = peak.height - distFromCenter
        if dheight < 2
          dheight = 1
        (
          (
            if (Math.abs(dy-y) == distFromCenter or Math.abs(dx-x) == distFromCenter) and (map[dy]? and map[dy][dx]?)  
              map[dy][dx].height += dheight
              if map[dy][dx].height>_.maxHeight then map[dy][dx].height = _.maxHeight
          ) for dx in [x-distFromCenter..x+distFromCenter]
        ) for dy in [y-distFromCenter..y+distFromCenter]
        return
      
      # draw lossy boxes successively around peaks to terraform
      (
        (
          chanceFill peak, dist
        ) for dist in [0...peak.height]
      ) for peak in peaks
      
      # return the world with terrain bolted on
      $.extend {
        map   
        peaks 
      }, _