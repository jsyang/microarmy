/*******************************************************************************
    
    Base Attack 2 - randomly choose a terrain set.
    
*******************************************************************************/

var terrainSet=[
    ['map/spring_terrain.png','map/spring_props.png'],
    ['map/afghan_terrain.png','map/afghan_props.png'],
    ['map/egypt_terrain.png','map/egypt_props.png'],
    ['map/chechnya_terrain.png','map/chechnya_props.png']
];

terrainSet=terrainSet[(Math.random()*terrainSet.length)>>0];
