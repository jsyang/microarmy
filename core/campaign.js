// Campaign -- microarmy's strategy side.
CampaignView = Class.extend({
  init:function(params){
    this._=$.extend({
      display: new CanvasDisplay,
      w: 12,
      h: 12,
      N: 24, // N edge length, 4:3 ~ N:E
      E: 18  // E edge length
    },params);
    var _=this._;
    _.N2=_.N>>1;
    _.E2=_.E>>1;

    this.initWorld();
  },
  initWorld:function(){ var _=this._;
    var ctx=_.display.initDisplay();
    ctx.fillStyle='#dee88a';
    ctx.strokeStyle='#000';
    ctx.lineWidth=1;
    this.drawTileQuad(0.5,0.5); // +0.5 for crisp edges.
  },
  drawTileQuad:function(x,y){ var _=this._;
    for(var i=0; i<_.h; y+=_.E, i++)
      this.drawTileRow(_.w,x,y);
  },
  drawTileRow:function(width,x,y){ var _=this._;
    var ctx=_.display._.ctx;
    for(var i=0, offset=[_.E2,-_.E2]; i<width; x+=_.E2+_.N, y+=offset[i%2], i++)
      this.drawTile(ctx,x,y);
  },
  drawTile:function(ctx,x,y){ var _=this._;
    var N=_.N; var N2=_.N2;
    var E=_.E; var E2=_.E2;
    ctx.moveTo(x+E2,y);
    ctx.beginPath();            // drawn edges:
    ctx.lineTo(x+E2+N,y);       // N
    ctx.lineTo(x+E2+N+E2,y+E2); // NE
    ctx.lineTo(x+E2+N,y+E);     // SE
    ctx.lineTo(x+E2,y+E);       // S
    ctx.lineTo(x,y+E2);         // SW
    ctx.lineTo(x+E2,y);         // NW
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },
  
  colorHighlight:function(){
    this._.display._.ctx.fillStyle='#33e833';
  },
  
  colorNormal:function(){
    this._.display._.ctx.fillStyle='#dee88a';
  },
  
  highlight:function(rx,ry){ var _=this._;
    var d=_.display;
    var ctx=d._.ctx;
    d.clear();
    
    // Find out which hex is highlighted, based on raw X,Y
    var hX=(rx/_.N)>>0;
    var hY=(ry/_.E)>>0;    
    console.log(hX,hY);
    
    for(var i=0, y=0; i<_.h; y+=_.E, i++) {
      for(var j=0, offset=[_.E2,-_.E2], x=0; j<_.w; x+=_.E2+_.N, y+=offset[j%2], j++) {
        if(hX==j && hY==i) {
          this.colorHighlight();
        } else {
          this.colorNormal();
        }
        this.drawTile(ctx,x,y);
      }
    }
  }
});

/*
 1. generate map, terrain, etc
 2. generate bases, locations of interest, foliage, resource centers, ore mines, etc
 3. generate forces tied to locations of interest.

 (4.) campaign commander?
 (5.) patrol routes to defend?
 (6.) areas to

*/

Campaign = Class.extend({
  init:function(params){
    this._=$.extend({
      mode: MOUSEMODE.SELECT,
      view: new CampaignView
      // world stuff
    },params);
  }
});


var dsdfsddfCampaign=new function () {
/* campaign map has elements:
  cities - civilian centers, funding, research
  factories -  heavy / special weapon production site
  bases - contain supplies for your operations, adjacent bases to mission will
          determine what you can use in the mission, all cities and factories
          are bases by default.




*/
  this.map;

  this.research

  this.City=function(x,y,team){
    this.x=x;
    this.y=y;
    this.team=team;
    this.funding=10;
    this.research=10;
  };

  this.makeMap=function(){
    //gffdggdd
  };

};

var MapTile={
  Heights:{
    Mountain:4,
    Hill:2,
    Plain:0,
    Valley:-2
  },
  Locations:{

    CityBlock:{},   // can be turned into any team location except missile pad
    Village:{},     // can only be turned into a forward base

    // Team specific locations

    Supply:{},      // mass-storage of resources, personnel
    Forward:{},     // small-storage of units, light artillery
    Production:{},  // vehicle creation and repair
    AirPort:{},     // aircraft and suborbital craft production / maintenance

    MissilePad:{},  // long range superweapon
    Fortress:{}     // leadership stronghold
  },
};

var Resources={
  // your supply of usable troops is limited by your supply of small arms
  SmallArms:{},

  Fabricon:{},    // materials to create / repair new structures,
                  // 1 x Fabricon = 20 x Producium
  Producium:{},   // materials to create new vehicles and non-structures

  Combatant:{},   //
  Fanatics:{},    //
  Engineer:{},    // retool factories, install upgrades, used to construct
  FieldAgent:{}   // report on enemy positions / productions / attack plans
};