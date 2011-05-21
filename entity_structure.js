// Structure classes ///////////////////////////////////////////////////////////

function Structure(x,y,type,team)
{
  var _=new Pawn(x,y);
  
  var typeInfo=
  ({//                                                              occupant    
  //type            structure class             maxHealth       width   height  capacity    protection  GFXset              projectileType  sightRange  reloadTime  maxAmmo firingPorts   
    "pillbox":[     Enum.UnitClass.PILLBOX,     RAND(600,680),  14,     8,      2,          0.6,        Enum.GFX.PILLBOX,   PillboxMGBullet,8,          110,        6,      [[3,-4]]        ],
    "barracks":[    Enum.UnitClass.PROPSTRUCT,  RAND(340,360),  36,     20,     20,         0.8,        Enum.GFX.BARRACKS,  undefined,      3,          0,          0,      undefined       ],
    "commcenter":[  Enum.UnitClass.PROPSTRUCT,  RAND(100,140),  36,     20,     20,         0,          Enum.GFX.COMMCENTER,undefined,      0,          0,          0,      undefined       ]
  })[type];

  var i=0;
  _.class=              typeInfo[i++];
  _.health=             typeInfo[i++];
  _.width=              typeInfo[i++];
  _.height=             typeInfo[i++];
  _.capacity=           typeInfo[i++];
  _.protection=         typeInfo[i++];
  _.GFXSET=             typeInfo[i++][team];
  _.projectileType=     typeInfo[i++];
  _.sightRange=         typeInfo[i++];
  _.reloadTime=         typeInfo[i++];
  _.maxAmmo=            typeInfo[i++];
  _.firingPorts=        typeInfo[i++];
  _.type=type;

}
