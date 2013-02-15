define ['core/util/$'], ($) ->
  
  # add terrain to the world.
  (_) ->
    _ = $.extend {
      numPeaks      : $.R(24,30)
      maxPeakHeight : 8
      seaLevel      : 4
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
      } for x in [0.._.w-1]) for y in [0.._.h-1])
      
      # peaks = seeds
      peaks = ({
        x       : $.R(0, _.w-1)
        y       : $.R(0, _.h-1)
        height  : $.R(_.seaLevel, _.maxPeakHeight)
      } for i in [1.._.numPeaks])
      
      # func to draw a "lossy" box around a point
      chanceFill = (x, y, height, distFromCenter) ->
        (
          (
            (
              minHeight = if height < (_.maxPeakHeight>>1) then height    else height-1
              maxHeight = if height < (_.maxPeakHeight>>1) then height+1  else height+3
              map[dy][dx].height += $.R(minHeight, maxHeight)
            ) if (Math.abs(dy-y) == distFromCenter or Math.abs(dx-x) == distFromCenter) and (map[dy]? and map[dy][dx]?)  
          ) for dx in [x-distFromCenter..x+distFromCenter]
        ) for dy in [y-distFromCenter..y+distFromCenter]
        return
      
      # draw lossy boxes successively around peaks to terraform
      (
        dist   = 0
        height = peak.height
        (
          chanceFill peak.x, peak.y, height, dist
          height--
          dist++
        ) while height>0
      ) for peak in peaks
      
      # return the world with terrain bolted on
      $.extend {
        map   
        peaks 
      }, _