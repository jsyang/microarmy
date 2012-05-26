// Battle -- microarmy's real-time tactical side. //////////////////////////////////////////////////////////////////////
BattleView = Class.extend({
  init:function(params){
    this._=$.extend({
      BG: new ImageDisplay
    },params);
    var _=this._;
    _.FG=new CanvasDisplay({ w: _.w, h: _.h });
    _.BG.initDisplay();
    _.FG.initDisplay();
  },

  drawBG:function(BGbase64){
    _.BG._.element.src=BGbase64;
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
    //_.view.drawBG(BGbase64);
  },
  
  initWorld:function(){
    
  },

  // was processPawns(), it's really a cycle of the battle, since it manipulates view as well
  cycle:function(){ var _=this._;
    var newXHash=new XHash({ w: _.w });
    // How large is the viewport?
    var vx=document.body.scrollLeft;
    var vw=window.innerWidth;
    _.FG.clear();

    for(var type in _.pawns) {
      var old=_.pawns[type];
      for(var i=0, newPawns=[]; i<old.length; i++) {
        var a=old[i];
        if(a instanceof PawnController) {
          if(a.alive())               newPawns.push(a);
        } else {
          if(a.alive())               newXHash.insert(a);
          if(a._.corpsetime>0)        newPawns.push(a);
          if(a._.x>vx && a._.x<vx+vw) _.FG.draw(a.gfx()); // don't draw things outside of viewport
        }
      }
      _.pawns[type]=newPawns;
    }
    _.xHash=newXHash;
  },

  add:function(pawn) { var _=this._;
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

// Generate stuff. /////////////////////////////////////////////////////////////////////////////////////////////////////
Generate = {
  
};



  var canvasElement=document.createElement("canvas");
  canvasElement.width=w; canvasElement.height=h;
  var FG=canvasElement.getContext('2d');

  // to avoid having 2 canvases, use a single one to
  // generate the background and then clear it for FG
  var imgElement=document.createElement("img");
  imgElement.className="BG";

  FG.putImageData(Generate.BG(FG,w,h),0,0);
  var terrain=Generate.FG(FG,w,h);
  FG.putImageData(terrain.imgdata_,0,0);
  imgElement.src=canvasElement.toDataURL("image/png");
  document.body.appendChild(imgElement);
  document.body.appendChild(canvasElement);
  FG.clearRect(0,0,w,h);

  var heightmap=terrain.heightmap_;

  // reset the structure heights
  for(var i=0; i<terrain.structs_.length; i++) {
    terrain.structs_[i].y=heightmap[terrain.structs_[i].x];
    structures.push(terrain.structs_[i]);
  }
  // add the controllers.
  controllers=terrain.control_.slice(0);
