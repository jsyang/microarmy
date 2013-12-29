define ->
  # Animation substitute for jQuery.animate
  (el, prop, duration=200, useStyle=false) ->
    # if el.animating then return
    clearInterval el.animationInterval
      
    cycleTime             = 10
    _cycleTime            = 0.1    # 1 / cycleTime
    cyclesLeft            = duration * _cycleTime
    
    el.animating          = true
    el.animationInterval  = null
    
    objProp = if useStyle then el.style else el
    oldProp = {}
    (oldProp[k] = parseInt(el[k])) for k,v of prop
    steps = {}
    (steps[k] = parseInt(_cycleTime*(prop[k]-oldProp[k]))) for k,v of oldProp
    
    # Linear step function
    step = ->
      (objProp[k] += v) for k,v of steps
      cyclesLeft--
      if cyclesLeft <= 0
        clearInterval el.animationInterval
        el.animating = false
      return
    
    el.animationInterval = setInterval step, cycleTime
    return
