# Break up the game world into horizontal buckets that we'll use for targeting, collision detection, etc.
# Avoids checking on things that are far away from where we want to look.

define ->
  class XHash
    BUCKETWIDTH : 6     # each bucket should be 1<<6 = 64 pixels wide.
    #buckets     : null
    #w           : null
  
    constructor : (params) ->
      @[k] = v for k, v of params
      throw new Error 'missing width!' unless @w?
      @flush()
      
    # replace : (buckets) -> @buckets = buckets
    
    # Make empty buckets for each _BUCKETWIDTH_ sized chunk of the battlefield
    flush : ->
      @buckets = ( [] for i in [0..(@w >> @BUCKETWIDTH)] )
    
    add : (pawn) ->
      targetBucket = @buckets[pawn.x >> @BUCKETWIDTH]
      if targetBucket?
        targetBucket.push(pawn)
      return
      
    addFilterDead : (pawn) ->
      targetBucket = @buckets[pawn.x >> @BUCKETWIDTH]
      if targetBucket? and !pawn.isDead()
        targetBucket.push(pawn)
      return
    
    # Get all the things which are within N buckets distance from x
    # If a ray direction is given then only look in that direction
    getNBucketsByCoord : (pawn, n, ray) ->
      i = pawn.x >> @BUCKETWIDTH
      NBuckets = []
      if ray
        if pawn.direction is 1
          [l, h] = [i, i+n]
        else
          [l, h] = [i-n, i]
          
      else
        [l, h] = [i-n, i+n]
      
      if l < 0 then l = 0
      b = @buckets[l..h]
      
      (NBuckets = NBuckets.concat(bucket)) for bucket in b
      NBuckets

    getNearestEnemy : (pawn, ray) ->
      minDist = Infinity
      pawn.setTarget()
      potentialTargets = @getNBucketsByCoord(pawn, pawn.sight, ray)
      for t in potentialTargets
        dist = Math.abs(pawn.x - t.x)
        if dist < minDist
          if  !(t is pawn)          and
              !t.isAlly(pawn)       and
              !t.isDead()           and
              !t.isPendingRemoval() and
              !t.isCrewDead()
            pawn.setTarget(t)
            minDist = dist
      pawn.target
    
    getCrowdedEnemy : (pawn) ->
      maxEnemies  = 0
      pawn.setTarget()
      potentialTargets = @getNBucketsByCoord(pawn, pawn.sight)
      (
        bucketEnemies   = 0
        (
          if  !(t is pawn)          and
              !t.isAlly(pawn)       and
              !t.isDead()           and
              !t.isPendingRemoval() and
              !t.isCrewDead()       and
              pawn.isAbleToTarget(t)
            bucketEnemies++
            if bucketEnemies > maxEnemies
              pawn.setTarget(t)            
        ) for t in bucket
        
        if bucketEnemies > maxEnemies
          maxEnemies = bucketEnemies
      ) for bucket in potentialTargets
      
      pawn.target
    
    getNearestFriendlyNeedSupply : (pawn) ->
      minDist = Infinity
      pawn.setTarget()
      potentialTargets = @getNBucketsByCoord(pawn, pawn.sight)
      (
        dist = Math.abs(pawn.x - t.x)
        if dist < minDist
          if  t.isAlly(pawn)        and
              !t.isDead()           and
              !t.isCrewDead()       and
              !t.isPendingRemoval() and
              t.isOutOfAmmo()       and
              pawn.isAbleToTarget(t)
            pawn.setTarget(t)
            minDist = dist
      ) for t in potentialTargets
      
      pawn.target
    