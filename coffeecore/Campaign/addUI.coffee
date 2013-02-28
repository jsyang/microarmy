define [
  'core/util/autoscroll'
], (Autoscroll) ->
  ->
    views   = @views
    _       = @_
    factor  = 1 / 24  # dimension of tiles (~ microarmy.css)
    
    if views?
      
      # click handler for map tiles
      views.Map?.onclick = (e) ->
        [sx, sy] = [views.Map.scrollLeft, views.Map.scrollTop]
        [x,y] = [e.pageX+sx, e.pageY+sy]
        [x,y] = [x*factor, y*factor]
        [x,y] = [Math.floor(x),   Math.floor(y)]
        
        views.Inventory?.show _.world.map[y][x]
        return
      
      Autoscroll views.Map

    else
      throw new Error 'views must be set up prior to adding UI'
    
    @
  