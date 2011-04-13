/*

    Pick a random terrain set, more specific props and goal oriented
    things may be loaded from here.

*/
var map=(function(){
    var m=[
    
        "spring",
        "afghan",
        "egypt",
        "chechnya"
        
    ]; m=m[(Math.random()*m.length)>>0];
    return [
        "maps/"+m+"_terrain.png",
        "maps/"+m+"_props.png"
    ];
})();