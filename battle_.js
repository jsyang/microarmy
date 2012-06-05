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
      w: 2490,              // Battle world dimensions in pixels.
      h: 480,
      pawns: {
        projectile: [],
        explosion: [],
        infantry: [],
        vehicle: [],
        aircraft: [],
        structure: [],
        pawncontroller: []  // Commanders / Squads -- higher level AI
      },
      heightmap: [],
      timer: undefined
    },params);

    var _=this._;
    _.xHash=new XHash({ w: _.w });
    _.view=new BattleView({ w: _.w, h: _.h });
  },


  generatePeaksAndHeightMap:function(params) {
    var _=$.extend({
      startingStructures: [],

      numMinor:           12,

      peakMajor:          function(x){ return { x: x, height: $.R(20,370) }; },
      peakMajorStep:      function(){ return $.R(100,400); },

      peakMinor:          function(x, majorHeight){ return { x:x, height: majorHeight+$.R(-12,16) }; },
      peakMinorStep:      function(){ return $.R(10,50); },

      radius:             72
      /*
            [ structure ]
                 x
       |---------'---------|
                     ^ structure radius

          |---,---|         struct 1
                |---,---|   struct 2
                |=|         overlapping area that needs to be flattened.

          |-------------|   merged area.

      */
    }, params);

    // Make some peaks
    for(var peaks=[], x=$.R(10,80); x<_.w; x+=_.peakMajorStep()) {
      var major = _.peakMajor(x);
      peaks.push(major);
      for(var i=$.R(1,_.numMinor); i--; x+=_.peakMinorStep())
        if(x<_.w)
          peaks.push(_.peakMinor(x, major.height));
    }


    function mergeFlatAreas(structs) {
      structs.sort(function(a,b){return a._.x-b._.x;});
      for(var i=0, flats=[]; i<structs.length; i++) {
        var s=structs[i];
        var start = s._.x - _.radius;
        var end =   s._.x + _.radius;
        for(var j=i; j<structs.length && s._.x+72>=structs[j]._.x-72; j++){
          end=structs[j]._.x + _.radius;
          i=j;
        }
        if(!structs.length || structs[structs.length-1].start!=start)
          flats.push({ start: start, end: end });
      }
      return flats;
    }

    function flattenPeaks(p,start,end) { // p = peaks[]
      for(var i=0;p[i].x<start;i++);
      for(var j=i;j<p.length && p[j].x<end;j++);
      j++;
      var avgHeight;
      if(!p[j]) avgHeight=p[i].height;
      else      avgHeight=(p[i].height+p[j].height)>>1;
      p.splice(i,   0,{ x: start, height: avgHeight, flat:true });
      p.splice(j,   0,{ x: end,   height: avgHeight, flat:true });
      p.splice(i+1,j-i-1);
    }

    for(var i=0, flats=mergeFlatAreas(_.startingStructures); i<flats.length; i++)
      flattenPeaks(peaks, flats[i].start, flats[i].end);

    // todo: delete slopes that are too steep -- do this better
    // removes peaks that are too close together and too steep
    for(var i=0; i<peaks.length-1; i++)
      if( (!peaks[i].flat) && // don't touch the flat regions
          (Math.abs(peaks[i].x-peaks[i+1].x)<32) &&
          (1.6*Math.abs(peaks[i].x-peaks[i+1].x) <
           Math.abs(peaks[i].height-peaks[i+1].height))
        )
        peaks[i].height=Infinity;
    for(var i=0, newPeaks=[]; i<peaks.length; i++)
      if(isFinite(peaks[i].height))
        newPeaks.push(peaks[i]);
    peaks=newPeaks;

    this._.heightmap=[];
    var current={height:peaks[0].height, peak:peaks[0]};
    for(var x=0, j=0, dy=0; x<_.w; x++) {
      if(current.peak.x==x) {
        if(++j<peaks.length) {
          current.peak=peaks[j];
          dy=(current.peak.height-current.height)/(current.peak.x-x);
        } else {
          dy=0;
        }
      }
      this._.heightmap.push(_.h-Math.round(current.height));
      current.height+=dy;
    }
  },

  initBase:function(t){
    var base = function(raw){
      for(var pruned=[], i=0; i<raw.length; i++)
        if(raw[i].num)
          pruned.push(raw[i]);
      return pruned;
    }([
      {type:SmallTurret,  num:$.R(0,1)},
      {type:CommCenter,   num:$.R(0,2)},
      {type:MissileRack,  num:$.R(0,2)},
      {type:MissileRack,  num:$.R(0,2)},
      {type:MissileRack,  num:$.R(0,2)},
      {type:CommRelay,    num:$.R(0,1)},
      {type:Barracks,     num:$.R(1,5)},
      {type:SmallTurret,  num:$.R(0,1)},
      {type:Pillbox,      num:$.R(0,2)},
      {type:SmallMine,    num:$.R(0,8)}
    ]);

    var x = t==TEAM.GREEN? 2490 - 200 : 200; // Which edge of the world do we start building the base from?
    for(var i=0, newBase=[]; i<base.length; i++)
      for(var p=base[i]; p.num>0; p.num--) {
        newBase.push(
          new p.type({
            'x':    x,
            'team': t
          })
        );

        if(p.type == MissileRack && p.num>1) {
          x+=TEAM.GOALDIRECTION[t]*3;

        } else if(p.type == SmallMine && p.num>1) {
          x+=TEAM.GOALDIRECTION[t]*$.R(8,20);

        } else {
          x+=TEAM.GOALDIRECTION[t]*$.R(36,50);
        }
      }

    return newBase;
  },

  initWorld:function(){
    var _=this._;
    
    _.view.initBG();
    
    var greenBase = this.initBase(TEAM.GREEN);
    var blueBase  = this.initBase(TEAM.BLUE);
    var startingStructures = greenBase.concat(blueBase); 
    
    this.generatePeaksAndHeightMap({
      'startingStructures': startingStructures,
      w: this._.w,
      h: this._.h
    });
    
    for(var i=0; i<startingStructures.length; i++)
      startingStructures[i]._.y = this.height(startingStructures[i]._.x);
    for(var i=0; i<startingStructures.length; i++)
      this.add(startingStructures[i]);
    
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
    var x=obj._.x>>0, y=obj._.y>>0;
    return x<0 || x>=_.w || y>_.heightmap[x];
  },

  go:function(){ this._.timer=setInterval(this.cycle,40); },
  pause:function(){ clearInterval(this._timer); }

});