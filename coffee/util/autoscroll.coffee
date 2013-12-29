define ['core/util/animation'], (Animation) ->
  # Scroll the elements contents if mouse cursor goes near the 
  (el) ->
    origin =
      x : el.offsetTop
      y : el.offsetLeft
      w : el.offsetWidth
      h : el.offsetHeight
      content :
        els : el.children
        el  : el.children[0]
        # Uncomment these if the content scrolling is not working properly.
        w   : el.children[0].scrollWidth #.offsetWidth    
        h   : el.children[0].scrollHeight #.offsetHeight
    
    bShift = 3
    margin = 40
    
    radius =
      x : (el.offsetWidth   >> bShift)+margin
      y : (el.offsetHeight  >> bShift)+margin
      
    el.onmousemove = (e) ->
      [sx, sy] = [el.scrollLeft+0,    el.scrollTop+0]
      [mx, my] = [e.pageX - origin.x, e.pageY - origin.y]
      
      bounds =
        left    : mx - radius.x
        right   : mx + radius.x
        top     : my - radius.y
        bottom  : my + radius.y
  
      animate = {}
      
      # Horizontal scrolling
      if bounds.left < 0 and sx > 0
        animate.scrollLeft = sx + bounds.left
      else if bounds.right > origin.w and sx + origin.w < origin.content.w
        animate.scrollLeft = sx + bounds.right - origin.w
        
      # Vertical scrolling
      if bounds.top < 0 and sy > 0
        animate.scrollTop = sy + bounds.top
      else if bounds.bottom > origin.h and sy + origin.h < origin.content.h
        animate.scrollTop = sy + bounds.bottom - origin.h
      
      # Only animate if we've moved around
      if animate.scrollTop? or animate.scrollLeft?
        Animation el, animate
      return
    el