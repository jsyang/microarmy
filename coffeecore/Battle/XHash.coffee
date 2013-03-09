# Break up the game world into horizontal buckets that we'll use for targeting, collision detection, etc.
# Avoids checking on things that are far away from where we want to look.

define ->
  class XHash
    constructor : (_) ->
      @_ = $.extend {
        BUCKETWIDTH : 6     # each bucket should be 1<<6 = 64 pixels wide.
        buckets     : null
        w           : null
      }, _
      @emptyBuckets()
      
    setBuckets : (buckets) -> @_.buckets = buckets
    
    # Make empty buckets for each _BUCKETWIDTH_ sized chunk of the battlefield
    emptyBuckets : ->
      @_.buckets = ( [] for i in [0..(@_.w>>@_.BUCKETWIDTH)+1] )
    
    add : (pawn) ->
      targetBucket = @_.buckets[pawn._.x>>@_.BUCKETWIDTH]
      if targetBucket?
        targetBucket.push(pawn)
      return
    
    # Get all the things which are within N buckets distance from x
    # If a ray direction is given then only look in that direction
    getNBucketsByCoord : (pawn, n, ray) ->
      i = pawn._.x>>@_.BUCKETWIDTH
      NBuckets = []
      if ray?
        if ray < 0
          b = @_.buckets[i-n...i+1]
        else
          b = @_.buckets[i...i+n+1]
      else
        b = @_.buckets[i-n...i+n+1]
      
      ( NBuckets = NBuckets.concat(i) ) for bucket in b
      NBuckets
      
    # NOT optimized as per old getNearestEnemy
    getNearestEnemy : (pawn) ->
      index   = pawn._.x>>@_.BUCKETWIDTH
      minDist = Infinity
      
      pawn.setTarget()
      potentialTargets = @getNBucketsByCoord(pawn, pawn._.sight)
      (
        dist = t.distX(pawn)
        if dist < minDist
          if not ( t.isAlly(pawn) or t.isDead() or !t.isCrewed() or (t.isAircraft() and !pawn.isAntiAir()) )
            pawn.setTarget(t)
            minDist = dist
      ) for t in potentialTargets
    
    getCrowdedEnemy : (pawn) ->
      i           = pawn._.x>>@_.BUCKETWIDTH
      maxEnemies  = 0
      pawn.setTarget()
      (
        bucketEnemies   = 0
        (
          if not ( t.isAlly(pawn) or t.isDead() or (t.isAircraft() and !pawn.isAntiAir()) )
            bucketEnemies++
            if bucketEnemies>maxEnemies then pawn.setTarget(t)            
        ) for t in bucket
        
        if bucketEnemies > maxEnemies
          maxEnemies = bucketEnemies
      ) for bucket in @_.buckets[i-pawn._.sight...i+pawn._.sight+1]
      potentialTargets = @getNBucketsByCoord(pawn, pawn._.sight)
    
    
    # todo: Get target
    getNearestFriendlyNeedSupply : (pawn) ->
      index   = pawn._.x>>@_.BUCKETWIDTH
      minDist = Infinity
      
      pawn.setTarget()
      potentialTargets = @getNBucketsByCoord(pawn, pawn._.sight)
      (
        dist = t.distX(pawn)
        if dist < minDist
          if !t.isAlly(pawn) or t.isDead() or !t.isOutOfAmmo() or t.isAircraft()
          else
            pawn.setTarget(t)
            minDist = dist
      ) for t in potentialTargets