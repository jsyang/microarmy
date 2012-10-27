// Battle -- microarmy's real-time tactical side. //////////////////////////////////////////////////////////////////////
BattleView = Class.extend({
  init:function(params){
    this._=$.extend({
      BG: new CanvasDisplay({ w: params.w, h: params.h }),
      FG: new CanvasDisplay({ w: params.w, h: params.h })
    },params);
    this._.BG.initDisplay();
    this._.FG.initDisplay();
  },

  initBG:function(){
    var _=this._;
    var imgData=_.BG._.ctx.createImageData(_.w,_.h);
    var d=imgData.data;

    var skyGradient=[ // [RGB1, RGB2, ... hex colors]
      ["112111", "acacac"],
      ["442151", "ffac2c"],
      ["F2F8F8", "848B9A"]
    ];
    skyGradient=skyGradient[$.R(0,skyGradient.length-1)];

    // hard coded with only a 2 color gradient for now
    var rgb1={
      r:parseInt(skyGradient[0].substr(0,2),16),
      g:parseInt(skyGradient[0].substr(2,2),16),
      b:parseInt(skyGradient[0].substr(4,2),16)
    };
    var rgb2={
      r:parseInt(skyGradient[1].substr(0,2),16),
      g:parseInt(skyGradient[1].substr(2,2),16),
      b:parseInt(skyGradient[1].substr(4,2),16)
    };

    // delta RGB, current RGB
    var hInverse=1/_.h;
    var dR=(rgb2.r-rgb1.r)*hInverse, cR=rgb1.r;
    var dG=(rgb2.g-rgb1.g)*hInverse, cG=rgb1.g;
    var dB=(rgb2.b-rgb1.b)*hInverse, cB=rgb1.b;

    for(var y=0; y<_.h; y++,cR+=dR,cG+=dG,cB+=dB) {
      for(var x=0; x<_.w; x++) {
        var c=4*(y*_.w+x);
        d[c+0]=Math.round(cR);//+$.R(-3,3);
        d[c+1]=Math.round(cG);//+$.R(-3,3);
        d[c+2]=Math.round(cB);//+$.R(-3,3);
        d[c+3]=0xFF;
      }
    }
    
    _.BG._.ctx.putImageData(imgData,0,0);
  },
  
  initTerrain:function(heightmap){
    var _=this._;
    var imgData=_.BG._.ctx.getImageData(0,0,_.w,_.h);
    var d=imgData.data;

    var colors={
      moss:   "7DA774",
      topsoil:"5D3825",
      bedrock:"8498A4",
      steeps: "ADA159",
      sand:   "9F9973"
    };
    for(var i in colors) {
      var j=colors[i];
      colors[i]={
        r:parseInt(j.substr(0,2),16),
        g:parseInt(j.substr(2,2),16),
        b:parseInt(j.substr(4,2),16)
      };
    }

    var color=[colors.bedrock,colors.moss,colors.topsoil,colors.sand,colors.steeps][$.R(0,4)];
    for(var terrainGradient=[], h_=0; _.h-h_; h_++) {
      terrainGradient.push(color.r-h_);
      terrainGradient.push(color.g-h_);
      terrainGradient.push(color.b-h_);
    }

    for(var x=0; x<_.w; x++) {
      for(var height=heightmap[x],i=0; height<_.h; height++,i++) {
        var c=4*((height+1)*_.w+x);
        d[c+0]=terrainGradient[3*i+0];
        d[c+1]=terrainGradient[3*i+1];
        d[c+2]=terrainGradient[3*i+2];
      }
    }
    
    _.BG._.ctx.putImageData(imgData,0,0);
  }
});

Battle = Class.extend({
  init:function(params){
    this._=$.extend({
      w: 3200,               // Battle world dimensions in pixels.
      h: 480,
      pawns: {
        pawncontroller: [],  // Commanders / Squads -- higher level AI
        commander     : [],
        aircraft      : [],
        structure     : [],
        vehicle       : [],
        infantry      : [],
        projectile    : [],
        explosion     : []
      },
      heightmap: [],
      timer: undefined
    },params);

    var _         = this._;
    _.xHash       = new XHash     ({ w: _.w });
    _.deathHash   = new SimpleHash({ w: _.w });
    _.view        = new BattleView({ w: _.w, h: _.h });
  },



/***********************************************************************************************************************
Flatten terrain.

          [ structure ]
               x
     |---------'---------|
                   ^ structure radius = Math.ceil(_.img.w / 2)

        |---,---|         struct 1
              |---,---|   struct 2
              |=|         overlapping area that needs to be flattened.

        |-------------|   merged area.

***********************************************************************************************************************/

  defineFlatRegions : function(structureList) {
    var _=this._;
    structureList.sort(function(a,b){return a._.x-b._.x;});

    var radiusPadding = 36; // padding.    
    var flatRegions=[];
    for( var i=0; i<structureList.length; i++) {
      var s=structureList[i];
      var start = s._.x - Math.ceil(s._.img.w*0.5) - radiusPadding;
      var end =   s._.x + Math.ceil(s._.img.w*0.5) + radiusPadding;
      
      for(var j=i;
          j<structureList.length &&
          end >= structureList[j]._.x - Math.ceil(structureList[j]._.img.w*0.5) - radiusPadding; j++){
        end = structureList[j]._.x + Math.ceil(structureList[j]._.img.w*0.5) + radiusPadding;
        i=j;
      }
      
      flatRegions.push({ start: start, end: end });
    }
    
    return flatRegions;
  },

  flattenPeaks : function(peaks, region) {
    var start=  region.start;
    var end=    region.end;
    
    for(var i=0;peaks[i] && peaks[i].x<start;i++); i--;
    for(var j=i;j<peaks.length && peaks[j].x<end;j++);
    if(i==j) return;
    
    var avgHeight;
    if(!peaks[j]) {
      avgHeight=peaks[i].height;
    } else {
      avgHeight=(peaks[i].height+peaks[j].height)>>1; 
    }
    peaks.splice(i+1, 0,{ x: start, height: avgHeight, flat:true });
    peaks.splice(j+1,   0,{ x: end,   height: avgHeight, flat:true });
    while(!peaks[i+2].flat)
      peaks.splice(i+2, 1);
  },
  
  removeDupPeaks : function(peaks) {
    for(var i=1; i<peaks.length; i++) {
      if(peaks[i-1].x === peaks[i].x) {
        peaks.splice(i,1);
        i=1;
      }
    }
  },
  
  smoothRoughPeaks : function(peaks) {    
    var maxSlope = 1.8;
    for(var i=0; i<peaks.length; i++) {
      if(i==0 || (peaks[i].flat && peaks[i-1].flat)) continue;
      
      // assuming ascending order X
      var dX = peaks[i].x-peaks[i-1].x;
      var dY = Math.abs(peaks[i].height-peaks[i-1].height);
      while(dY>maxSlope*dX) {
        if(peaks[i].height>peaks[i-1].height) {
          if(!peaks[i].flat)    peaks[i].height   -= dY>>2;
          if(!peaks[i-1].flat)  peaks[i-1].height += dY>>2;
        } else {
          if(!peaks[i].flat)    peaks[i].height   += dY>>2;
          if(!peaks[i-1].flat)  peaks[i-1].height -= dY>>2;
        }
        old_dY = dY;
        dY = Math.abs(peaks[i].height-peaks[i-1].height);
        
        if(dX<2) break; // don't stall on close peaks
      }
    }
  },

  // todo : break this off into util/peakGenerator.js
  generatePeaksAndHeightMap : function(params) {
    var _=$.extend({
      flatRegions:        [],

      numMinor:           9,
      peakMajor:          function(x){ return { x: x, height: $.R(20,270) }; },
      peakMajorStep:      function(){ return $.R(100,400); },

      peakMinor:          function(x, majorHeight){ return { x:x, height: majorHeight+$.R(-12,16) }; },
      peakMinorStep:      function(){ return $.R(10,50); }

    }, params);

    // Make some peaks
    for(var peaks=[], x=_.peakMinorStep(); x<_.w; x+=_.peakMajorStep()) {
      var major = _.peakMajor(x);
      peaks.push(major);
      x+=_.peakMinorStep();
      for(var i=$.R(2,_.numMinor); i--; x+=_.peakMinorStep())
        if(x<_.w)
          peaks.push(_.peakMinor(x, major.height));
    }

    for(var i=0; i<_.flatRegions.length; i++)
      this.flattenPeaks(peaks, _.flatRegions[i]);
    peaks.sort(function(a,b){return a.x-b.x;});

    this.removeDupPeaks(peaks);
    this.smoothRoughPeaks(peaks);

    this._.heightmap=[];
    var currentPeak=peaks.shift();
    var currentHeight=currentPeak.height;
    for(var x=0, j=0, dy=0; x<_.w; x++) {
      if(x>=currentPeak.x) {
        if(peaks.length) {
          var currentPeak=peaks.shift();
          dy=(currentPeak.height-currentHeight)/(currentPeak.x-x);
        } else {
          dy=0;
        }
      }
      this._.heightmap.push(_.h-Math.round(currentHeight));
      currentHeight+=dy;
    }
  },

  // todo : break this off into util/baseGenerator.js
  generateBase:function(t){
    var _=this._;
    var baseDistFromEdge = 200;
    
    var base = function(raw){
      for(var pruned=[], i=0; i<raw.length; i++)
        if(raw[i].num)
          pruned.push(raw[i]);
      return pruned;
    }([
      {type:AmmoDump,         num:$.R(0,1)},
      {type:MissileRack,      num:$.R(0,3)},
      {type:SmallTurret,      num:$.R(0,1)},
      {type:CommCenter,       num:$.R(0,2)},
      {type:AmmoDump,         num:$.R(0,1)},
      {type:MissileRack,      num:$.R(0,3)},
      {type:CommRelay,        num:$.R(0,1)},
      {type:MissileRackSmall, num:$.R(0,4)},
      {type:Barracks,         num:$.R(1,5)},
      {type:WatchTower,       num:$.R(0,1)},
      {type:AmmoDumpSmall,    num:$.R(0,6)},
      {type:MissileRackSmall, num:$.R(0,4)},
      {type:SmallTurret,      num:$.R(0,1)},
      {type:Barracks,         num:$.R(0,2)},
      {type:Pillbox,          num:$.R(0,2)},
      {type:MineFieldSmall,   num:$.R(0,4)}
    ]);

    var x = t==TEAM.GREEN? _.w - baseDistFromEdge : baseDistFromEdge;
    for(var i=0, newBase=[]; i<base.length; i++)
      for(var p=base[i]; p.num>0; p.num--) {
        newBase.push(
          new p.type({
            'x':    x,
            'team': t
          })
        );

        if((p.type == MissileRack || p.type == MissileRackSmall) && p.num>1) {
          x+=TEAM.GOALDIRECTION[t]*3;
        } else if(p.type == AmmoDumpSmall && p.num>1) {
          x+=TEAM.GOALDIRECTION[t]*$.R(4,6);
        } else {
          x+=TEAM.GOALDIRECTION[t]*$.R(36,50);
        }
      }

    return newBase;
  },

  initWorld:function(){
    var _=this._;
    
    _.view.initBG();
    
    var greenBase = this.generateBase(TEAM.GREEN);
      for(var greenDepots=[], i=0; i<greenBase.length; i++){
        if(greenBase[i] instanceof CommCenter || greenBase[i] instanceof Barracks)
          greenDepots.push(greenBase[i]);
      }
    var greenCmdr = new Commander({
      depot:greenDepots,
      team: TEAM.GREEN
    });
    
    var blueBase  = this.generateBase(TEAM.BLUE);
      for(var blueDepots=[], i=0; i<blueBase.length; i++){
        if(blueBase[i] instanceof CommCenter || blueBase[i] instanceof Barracks)
          blueDepots.push(blueBase[i]);
      }
    var blueCmdr = new Commander({
      depot:blueDepots,
      team: TEAM.BLUE
    });
    
    var startingStructures = greenBase.concat(blueBase); 
    
    this.generatePeaksAndHeightMap({
      flatRegions: this.defineFlatRegions(startingStructures),
      w: _.w,
      h: _.h
    });
    
    for(var i=0; i<startingStructures.length; i++)
      startingStructures[i]._.y = this.height(startingStructures[i]._.x);
    for(var i=0; i<startingStructures.length; i++)
      this.add(startingStructures[i]);
    
    this.add(greenCmdr);
    this.add(blueCmdr);
    
    // todo remove this hardcoded stuff
    _.pawns.commander[TEAM.BLUE]  = blueCmdr;
    _.pawns.commander[TEAM.GREEN] = greenCmdr;
    
    _.view.initTerrain(_.heightmap);
  },

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Inits done. /////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // was processPawns(), it's really a cycle of the battle, since it manipulates view as well
  cycle:function(){ var _=this._;
    var newXHash=new XHash({ w: _.w });
    // How large is the viewport?
    var vx=document.body.scrollLeft;
    var vw=window.innerWidth;
    _.view._.FG.clear();

    for(var type in _.pawns) {
      var old=_.pawns[type];
      for(var i=0, newPawns=[]; i<old.length; i++) {
        var a=old[i];
        if(a instanceof PawnController) {
          if(a.alive())               newPawns.push(a);
        } else {
          if(a.alive())               newXHash.insert(a);
          if(a._.corpsetime>0)        newPawns.push(a);
          if(a._.x>vx && a._.x<vx+vw) _.view._.FG.draw(a.gfx()); // don't draw things outside of viewport
        }
      }
      _.pawns[type]=newPawns;
    }
    _.xHash=newXHash;
    _.deathHash.cycle();
  },

  add:function(pawn) { var _=this._.pawns;
    if(pawn instanceof Vehicle)         return _.vehicle.push(pawn);
    if(pawn instanceof Structure)       return _.structure.push(pawn);
    if(pawn instanceof Infantry)        return _.infantry.push(pawn);
    if(pawn instanceof Projectile)      return _.projectile.push(pawn);
    if(pawn instanceof Explosion)       return _.explosion.push(pawn);
    if(pawn instanceof Aircraft)        return _.aircraft.push(pawn);
    if(pawn instanceof PawnController)  return _.pawncontroller.push(pawn);
    return false;
  },

  height:function(x){ var _=this._; return (x>=0 && x<_.w) ? _.heightmap[x>>0] : 0; },
  isOutside:function(pawn){ var _=this._;
    var x=pawn._.x>>0, y=pawn._.y>>0;
    return x<0 || x>=_.w || y>_.heightmap[x];
  },

  go:function(){
    var self=this;
    this._.timer=setInterval(function(){self.cycle()},40);
  },
  pause:function(){ clearInterval(this._.timer); setTimeout(this.reloadPage,4000); },
  reloadPage:function(){ window.location = window.location.href; }

});