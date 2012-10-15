// Like XHash. But only for counts (death event count) check every so often
// todo rename this as death hash?

SimpleHash = Class.extend({
  init:function(params){
    this._=$.extend({
      BUCKETWIDTH       : 6,
      buckets           : [],
      CYCLESBEFOREFLUSH : 100,
      cycles            : 0,
      totalDeaths       : 0
    },params);
    
    this.flush();
  },

  flush:function() {
    var _     = this._;
    _.buckets = [];
    _.cycles  = 0;
    for(var i=(_.w>>_.BUCKETWIDTH)+1; i--;) _.buckets.push({});
  },

  insert:function(pawn){
    var _=this._;
    if(_.buckets[pawn._.x>>_.BUCKETWIDTH]) {
      _.totalDeaths++;
      
      if(!_.buckets[pawn._.x>>_.BUCKETWIDTH][pawn._.team]) {
        _.buckets[pawn._.x>>_.BUCKETWIDTH][pawn._.team] = 1;
      } else {
        // Rocket Infantry deaths matter more
        if(pawn instanceof RocketInfantry) {
          _.buckets[pawn._.x>>_.BUCKETWIDTH][pawn._.team]+=10;
        } else {
          _.buckets[pawn._.x>>_.BUCKETWIDTH][pawn._.team]++;
        }
      }
    }
  },

  getAreaOfMaxDeaths:function(team) {
    var _             = this._;
    var teamDeaths    = 0;
    var maxDeathIndex = -1;
    for(var i=0; i<_.buckets.length; i++) {
      if(_.buckets[i][team] && _.buckets[i][team]>teamDeaths){
        teamDeaths    = _.buckets[i][team];
        maxDeathIndex = i;
      }
    }
    
    return {
      boundary: this.getBucketBoundary(maxDeathIndex),
      severity: teamDeaths
    };
  },

  getBucketBoundary:function(index) {
    var _     = this._;
    var width = 1<<_.BUCKETWIDTH;
    return index<0? [] : [width*index, width*(index+1)];
  },
  
  cycle:function(){
    var _ = this._;
    if(_.cycles<_.CYCLESBEFOREFLUSH) {
      _.cycles++;
    } else {
      
      // todo -- remove hardcoded
      
      var blueCommander   = world._.pawns.commander[TEAM.BLUE]._;
      var greenCommander  = world._.pawns.commander[TEAM.GREEN]._;
      
      var blueSituation   = this.getAreaOfMaxDeaths(TEAM.BLUE);
      var greenSituation  = this.getAreaOfMaxDeaths(TEAM.GREEN);
      
      blueCommander.attention   = blueSituation.boundary;
      blueCommander.urgency     = blueSituation.severity;
      
      greenCommander.attention  = greenSituation.boundary
      greenCommander.urgency    = greenSituation.severity;
      
      this.flush();
      
      console.log('Casualties '+_.totalDeaths);
    }
  }
});