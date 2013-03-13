# Break up the game world into horizontal buckets that we'll use for targeting, collision detection, etc.
# Avoids checking on things that are far away from where we want to look.

define ->
  class XHash
    constructor : (_) ->
      if _.w?
        @_ = $.extend {
          BUCKETWIDTH : 6     # each bucket should be 1<<6 = 64 pixels wide.
          buckets     : null
          w           : null
        }, _
        @flush()
      else
        throw new Error 'no width given!'
        
    # replace : (buckets) -> @_.buckets = buckets
    
    # Make empty buckets for each _BUCKETWIDTH_ sized chunk of the battlefield
    flush : ->
      @_.buckets = ( [] for i in [0..(@_.w>>@_.BUCKETWIDTH)] )
    
    add : (pawn) ->
      targetBucket = @_.buckets[pawn._.x>>@_.BUCKETWIDTH]
      if targetBucket?
        targetBucket.push(pawn)
      return
      
    addFilterDead : (pawn) ->
      targetBucket = @_.buckets[pawn._.x>>@_.BUCKETWIDTH]
      if targetBucket? and !pawn.isDead()
        targetBucket.push(pawn)
      return
    
    # Get all the things which are within N buckets distance from x
    # If a ray direction is given then only look in that direction
    getNBucketsByCoord : (pawn, n, ray) ->
      i = pawn._.x>>@_.BUCKETWIDTH
      NBuckets = []
      if ray?
        if ray < 0
          [l, h] = [i-n, i+1]
        else
          [l, h] = [i, i+n+1]
      else
        [l, h] = [i-n, i+n+1]
      
      if l<0 then l = 0
      b = @_.buckets[l...h]
      
      ( NBuckets = NBuckets.concat(bucket) ) for bucket in b
      NBuckets

    getNearestEnemy : (pawn) ->
      minDist = Infinity
      pawn.setTarget()
      potentialTargets = @getNBucketsByCoord(pawn, pawn._.sight)
      (
        dist = t.distX(pawn)
        if dist < minDist
          if  !(t is pawn)    and
              !t.isAlly(pawn) and
              !t.isDead()     and
              !t.isCrewDead() and
              pawn.isAbleToTarget(t)
            pawn.setTarget(t)
            minDist = dist
      ) for t in potentialTargets
      
      pawn._.target
    
    getCrowdedEnemy : (pawn) ->
      maxEnemies  = 0
      pawn.setTarget()
      potentialTargets = @getNBucketsByCoord(pawn, pawn._.sight)
      (
        bucketEnemies   = 0
        (
          if  !(t is pawn)    and
              !t.isAlly(pawn) and
              !t.isDead()     and
              !t.isCrewDead() and
              pawn.isAbleToTarget(t)
            bucketEnemies++
            if bucketEnemies > maxEnemies
              pawn.setTarget(t)            
        ) for t in bucket
        
        if bucketEnemies > maxEnemies
          maxEnemies = bucketEnemies
      ) for bucket in potentialTargets
      
      pawn._.target
    
    getNearestFriendlyNeedSupply : (pawn) ->
      minDist = Infinity
      pawn.setTarget()
      potentialTargets = @getNBucketsByCoord(pawn, pawn._.sight)
      (
        dist = t.distX(pawn)
        if dist < minDist
          if  t.isAlly(pawn)  and
              !t.isDead()     and
              !t.isCrewDead() and
              t.isOutOfAmmo() and
              pawn.isAbleToTarget(t)
            pawn.setTarget(t)
            minDist = dist
      ) for t in potentialTargets
      
      pawn._.target
    