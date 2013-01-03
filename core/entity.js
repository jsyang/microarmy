// Basic abstract gamepiece.
Pawn = Class.extend({
  
  init:function(params){
    this._=$.extend({
      x:          undefined,
      y:          undefined,
      team:       undefined,
      corpsetime: undefined,
      img: {
        w:      undefined,
        h:      undefined,
        hDist2: undefined,    // hit radius^2 for collision testing (circular)
        sheet:  undefined     // sprite sheet
      },
      behavior: {
        alive:  undefined,
        dead:   undefined
      }
    },params);
  },

  // Should the world keep track of this instance?
  alive : function(){ var _=this._;
    if(Behavior.Custom.isDead.call(this)) {
      Behavior.Execute(_.behavior.dead,this);
      return false;
    } else {
      Behavior.Execute(_.behavior.alive,this);
      return true;
    }
  },

  gfx:function(){
    var _=this._; return {
      img:    _.img.sheet,
      imgdx:  _.frame.current*_.img.w,
      imgdy:  _.action*_.img.w,
      worldx: _.x-(_.img.w>>1),
      worldy: _.y-_.img.h+1,
      imgw:   _.img.w,
      imgh:   _.img.h
    };
  }
});

// todo.

// Win/loss event handler //////////////////////////////////////////////////////

var MISSION={
  EVENT:{
    DESTROYED:0,
    BUILT:1,
    CAPTURED:2,
    EXITEDMAPLEFT:3,
    EXITEDMAPRIGHT:4,
    REPAIRED:5,
    PANICKED:6,

    VAR_ISZERO:7
  },
  RESULT:{
    NONE:0,
    WIN:1,
    LOSE:2,
    INCREMENT:3,
    DECREMENT:4
  }
};

function Team(){
  var missionvars={
    status:MISSION.RESULT.NONE,
    unitsremaining:30
  };

  var won=false;
  var lost=false;

  var objective=[ // collection of event results (condition for win/loss/score)
    {trigger:MISSION.EVENT.DESTROYED, type:Infantry, missionvar:'unitsremaining', result: MISSION.RESULT.DECREMENT},
    {trigger:MISSION.EVENT.VAR_ISZERO, type:Infantry, missionvar:'unitsremaining', result: MISSION.RESULT.LOSE}
  ];

  var events=[];

  this.addEvent=function(e){ events.push(e); return events.length; };
  /*  ex: Event firing for a PistolInfantry death
          world.team[TEAM.NAMES[this.team]].addEvent(
            {type:PistolInfantry, event:MISSION.EVENT.DESTROYED}
          )
  */
  this.processEvents=function(){
    while(events.length){
      var e=events.shift();
      for(var j=0;j<objective.length; j++) {
        var o=objective[j];
        if(e.type instanceof o.type)
          if( (o.trigger==e.event) ||
              (o.trigger==MISSION.EVENT.VAR_ISZERO &&
               missionvars[o.missionvar]===0)
          ) {
            switch(o.result) {
              case MISSION.RESULT.DECREMENT:
                missionvars[o.missionvar]--; break;
              case MISSION.RESULT.INCREMENT:
                missionvars[o.missionvar]++; break;
              case MISSION.RESULT.WIN:
              case MISSION.RESULT.LOSE:
                missionvars['status']=o.result; break;
                // may want to return here if the team has won/lost
              default:
                alert("unexpected event result!"); break;
            }
          }
      }
    }
  };
}