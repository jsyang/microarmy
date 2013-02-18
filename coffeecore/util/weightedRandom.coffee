# Weighted randomizer. Selects a key from an obj based on the weight of that key.
define ->
  (obj) ->
    sum = 0
    (sum += v) for k, v of obj
    flipsum = 1 / sum
    r = Math.random()
    (
      if !(intervalEnd?) then intervalEnd = v*flipsum
      if r < intervalEnd
        return k
      else
        intervalEnd += v * flipsum
        lastK = k
    ) for k, v of obj
  
    k
