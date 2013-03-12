define ->
  # See if we're running tests or the game
  if GLOBAL
    globalscope = GLOBAL
  else if window
    globalscope = window
  else
    throw new Error 'could not find a global scope to attach $'
  
  # Don't redef $ if something's there already.
  if globalscope['$']? then return new Error '$ already exists globally!'

  # Globally defined $ utility namespace.
  globalscope['$'] =
    
    r : (n=1) -> n*Math.random()
    
    R : (l,h) -> Math.floor(
      l + (Math.random()*(h-l+1))
    )
    
    # Randomly choose an element from an array.
    AR : (a) -> a[ Math.floor(Math.random()*a.length) ]
    
    # Weighted object random. Selects a key from an obj based on the weight (value) of that key.
    WR : (o, sum=0) ->
      (sum += v) for k,v of o
      sum_ = 1/sum
      r = Math.random()
      (
        if !(intervalEnd?) then intervalEnd = v*sum_
        if r < intervalEnd
          return k
        else
          intervalEnd += v*sum_
          lastK = k
      ) for k, v of o
      k
    
    sum : (o, sum=0) ->
      if o instanceof Array
        sum += v for v in a
      else
        sum += v for k,v of a
      sum
    
    extend : (target, extender) ->
      target[k] = v for k,v of extender
      target
    