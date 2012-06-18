// XHash. Break up the game world into horizontal buckets that we'll use for targeting, collision detection, etc. //////
// Avoids checking on things that are far away from where we want to look. /////////////////////////////////////////////

XHash = Class.extend({
  init:function(params){
    this._=$.extend({
      BUCKETWIDTH: 6, // each bucket should be 1<<6 == 64 pixels wide
      buckets: []
    },params);
    var _=this._;
    for(var i=(_.w>>_.BUCKETWIDTH)+1; i--;) _.buckets.push([]);
  },

  // todo: optimize this code: usually we're looking for the closest
  // enemy / friendly to the current entity, so instead of getting the entire
  // range of buckets, we should go for layers, starting from the center...
  // Only the XHash should handle the collision detection / is Pawn touching another Pawn stuff?
  // So, is this function deprecated? no.
  getNBucketsByCoord:function(x,n) { var _=this._;
    for(var bucketsN=[],i=-(n>>1),index=x>>_.BUCKETWIDTH; i<(n>>1)+1; i++)
      if(_.buckets[index+i]!=undefined)
        bucketsN=bucketsN.concat(_.buckets[index+i]);
    return bucketsN;
  },

  insert:function(pawn){ var _=this._;
    if(_.buckets[pawn._.x>>_.BUCKETWIDTH]) _.buckets[pawn._.x>>_.BUCKETWIDTH].push(pawn);
  },

  // Only look for nearest enemy in one direction.
  getNearestEnemyRay:function(pawn){ var _=pawn._;
    var pawnIndex=_.x>>this._.BUCKETWIDTH;
    var minDist=Infinity;
    _.target=undefined;
    for(var d=0; d<_.sight; d++) {
      var currentBucket=this._.buckets[pawnIndex+_.direction*d];
      if(!currentBucket) continue;
      for(var i=0; i<currentBucket.length; i++) {
        var a=currentBucket[i];
        if(a._.team==_.team || Behavior.Custom.isDead.call(a) || (a._.x-_.x)*_.direction<0) continue;
        var dist=Math.abs(a._.x-_.x);
        if(dist<minDist) {
          _.target=a;
          minDist=dist;
        }
      }
      if(_.target) break;
    }
  },

  getNearestEnemy:function(pawn){ var _=pawn._;
    var pawnIndex=_.x>>this._.BUCKETWIDTH;
    var minDist=Infinity;
    _.target=undefined;
    // buckets left,right of the starting bucket.
    for(var left=right=pawnIndex, sight=_.sight; sight; left--,right++, sight--) {
      var shell=[];
      if(this._.buckets[left])                  shell=shell.concat(this._.buckets[left]);
      if(left!=right && this._.buckets[right])  shell=shell.concat(this._.buckets[right]);

      for(var i=0; i<shell.length; i++) {
        var a=shell[i];
        if(a._.team==_.team || Behavior.Custom.isDead.call(a) || Behavior.Custom.isCrewed.call(a) ) continue;
        var dist=Math.abs(a._.x-_.x);
        if(dist<minDist){
          _.target=a;
          minDist=dist;
        }
      }
      if(_.target) break;
    }
  },

  // Get enemy crowd, pick a target that is near lots of other enemies
  // to maximize splash damage, priority on farthest first.
  getCrowdedEnemy:function(pawn){ var _=pawn._;
    var pawnIndex=_.x>>this._.BUCKETWIDTH;
    var maxEnemies=0;
    _.target=undefined;
    // search via direction rays
    for(var dir=-1; dir<2; dir+=2) {
      for(var sight=1; sight<_.sight; sight++) {
        var b=this._.buckets[pawnIndex+dir*sight];
        if(b) {          
          var bucketEnemies=0;
          for(var i=0; i<b.length; i++) {
            var a=b[i];
            if(a._.team==_.team || Behavior.Custom.isDead.call(a)) continue;
            bucketEnemies++;
            if(bucketEnemies>maxEnemies) _.target=a;
          }
          if(bucketEnemies>maxEnemies) maxEnemies=bucketEnemies;
        }
      }
    }
  }
});