// Utilities. //////////////////////////////////////////////////////////////////////////////////////////////////////////
var $={
  r : function(n) { return n?n*Math.random():Math.random(); },

  // Random integer from [min,max] (bound inclusive)
  R : function(min,max) { return min+(Math.random()*(max-min+1))>>0; },

  sum : function(a) { for(var sum=0, i=a.length; i--; sum+=a[i] ); return sum; },

  sumObj : function(a) { var sum=0; for(var i in a) sum+=a[i]; return sum; },

  // Used to reset the DOM for other screens.
  removeWorld : function(){
    world.pause();
    while(document.getElementsByTagName('canvas').length)
      document.body.removeChild(document.getElementsByTagName('canvas')[0]);
    if(document.getElementById('msgbox'))
      document.body.removeChild(document.getElementById('msgbox'));
    world=undefined;
  },

  // Object literal extend.
  extend : function(target,extender) {
    for(var prop in extender)
      target[prop]=extender[prop];
    return target;
  }
};

// Classes. ////////////////////////////////////////////////////////////////////////////////////////////////////////////
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    this.Class = function(){};
    Class.extend = function(prop) {
      var _super = this.prototype;

      initializing = true;
      var prototype = new this();
      initializing = false;

      for (var name in prop) {
        prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?

        (function(name, fn){
          return function() {
            var tmp = this._super;
            this._super = _super[name];
            var ret = fn.apply(this, arguments);
            this._super = tmp;
            return ret;
          };
        })(name, prop[name]) : prop[name];
        }

		function Class() {
			if ( !initializing && this.init )
			this.init.apply(this, arguments);
		}

		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.extend = arguments.callee;
		return Class;
	};
})();

// Graphics. ///////////////////////////////////////////////////////////////////////////////////////////////////////////
CanvasDisplay = Class.extend({
  init:function(params){
    this._=$.extend({
      w: 800,
      h: 600,
      ctx: undefined,
      css: { // Apply CSS to <canvas/>
        'position':             'absolute',
        'top':                  '0px',
        'left':                 '0px',
        '-webkit-touch-callout':'none',
        '-webkit-user-select':  'none',
        '-khtml-user-select':   'none',
        '-moz-user-select':     'none',
        '-ms-user-select':      'none',
        'user-select':          'none'
      }
    },params);
  },

  initDisplay:function(){ var _=this._;
    var canvasElement=document.createElement("canvas");
    canvasElement.width=_.w;
    canvasElement.height=_.h;
    var style=canvasElement.style;
    for(var prop in _.css)
      style[prop]=_.css[prop];
    document.body.appendChild(canvasElement);
    _.ctx=canvasElement.getContext('2d');
    return _.ctx;
  },

  draw:function(gfx){
    if(!gfx.img) return;
    this._.ctx.drawImage(         gfx.img,
        gfx.imgdx,  gfx.imgdy,    gfx.imgw,gfx.imgh,
        gfx.worldx, gfx.worldy,   gfx.imgw,gfx.imgh
    );
  },

  clear:function(){ var _=this._; _.ctx.clearRect(0,0,_.w,_.h); }
});

// Just a static image as the background layer
ImageDisplay = Class.extend({
  init:function(params){
    this._=$.extend({
      element: undefined,
      css: { // Apply CSS to <canvas/>
        'position':             'absolute',
        'top':                  '0px',
        'left':                 '0px',
        '-webkit-touch-callout':'none',
        '-webkit-user-select':  'none',
        '-khtml-user-select':   'none',
        '-moz-user-select':     'none',
        '-ms-user-select':      'none',
        'user-select':          'none'
      }
    },params);
  },
  initDisplay:function(){ var _=this._;
    _.element=document.createElement("img");
    var style=_.element.style;
    for(var prop in _.css)
      style[prop]=_.css[prop];
    document.body.appendChild(_.element);
    return;
  }
});

// XHash. Break up the game world into horizontal buckets that we'll use for targeting, collision detection, etc. //////
// Avoids checking on things that are far away from where we want to look. /////////////////////////////////////////////

XHash = Class.extend({
  init:function(params){
    this._=$.extend({
      bucketWidth: 6, // each bucket should be 1<<6 == 64 pixels wide
      buckets: []
    },params);
    var _=this._;
    for(var i=(_.w>>_.bucketWidth)+1; i--;) _.buckets.push([]);
  },

  // todo: optimize this code: usually we're looking for the closest
  // enemy / friendly to the current entity, so instead of getting the entire
  // range of buckets, we should go for layers, starting from the center...
  // Only the XHash should handle the collision detection / is Pawn touching another Pawn stuff?
  // So, is this function deprecated? no.
  getNBucketsByCoord:function(x,n) { var _=this._;
    for(var bucketsN=[],i=-(n>>1),index=x>>_.bucketWidth; i<(n>>1)+1; i++)
      if(_.buckets[index+i]!=undefined)
        bucketsN=bucketsN.concat(_.buckets[index+i]);
    return bucketsN;
  },

  insert:function(pawn){ var _=this._;
    if(_.buckets[pawn._.x>>_.bucketWidth]) _.buckets[pawn._.x>>_.bucketWidth].push(pawn);
  },

  // Only look for nearest enemy in one direction.
  getNearestEnemyRay:function(pawn){ var _=pawn._;
    var pawnIndex=_.x>>this._.bucketWidth;
    var minDist=Infinity;
    _.target=undefined;
    for(var d=0; d<_.sight; d++) {
      var currentBucket=this._.buckets[pawnIndex+_.direction*d];
      if(!currentBucket) continue;
      for(var i=0; i<currentBucket.length; i++) {
        var a=currentBucket[i];
        if(a._.team==_.team || Behavior.Custom.isDead(a) || (a._.x-_.x)*_.direction<0) continue;
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
    var pawnIndex=_.x>>this._.bucketWidth;
    var minDist=Infinity;
    _.target=undefined;
    // buckets left,right of the starting bucket.
    for(var left=right=pawnIndex, sight=_.sight; sight; left--,right++, sight--) {
      var shell=[];
      if(this._.buckets[left])                shell=shell.concat(this._.buckets[left]);
      if(left!=right && this._.buckets[right]) shell=shell.concat(this._.buckets[right]);

      for(var i=0; i<shell.length; i++) {
        var a=shell[i];
        if(a._.team==_.team || Behavior.Custom.isDead(a) || Behavior.Custom.isCrewed(a) ) continue;
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
    var pawnIndex=_.x>>this._.bucketWidth;
    var maxEnemies=0;
    _.target=undefined;
    // search via direction rays
    for(var dirs=[-1,1], dir=dirs.pop(); dirs.length; dir=dirs.pop()) {
      for(var sight=1; sight<_.sight; sight++) {
        if(this._.buckets[pawnIndex+dir*_.sight]) {
          var b=this._.buckets[pawnIndex+dir*_.sight];
          var bucketEnemies=0;
          for(var i=0; i<b.length; i++) {
            var a=b[i];
            if(a._.team==_.team || Behavior.Custom.isDead(a)) continue;
            bucketEnemies++;
            if(bucketEnemies>maxEnemies) _.target=a;
          }
          if(bucketEnemies>maxEnemies) maxEnemies=bucketEnemies;
        }
      }
    }
  }
});