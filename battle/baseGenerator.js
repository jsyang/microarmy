// Generate starting bases /////////////////////////////////////////////////////////////////////////////////////////////
// Either randomly by default or via tile information

Battle.generateBase = function(params) { var _ = params;
  var baseDistFromEdge = 200; // margin for each
  
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
          'team': 
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
};
