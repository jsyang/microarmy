// Win/loss event handler //////////////////////////////////////////////////////
// todo

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