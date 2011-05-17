/*
    Game/stat/state
    
    Object that logs when significant game actions occur and changes the game state accordingly.
    Also logs the battle statistics for various kills, strategic captures, etc.

*/

var game=new (function()
{
    this.inProgress=1;
    
    this.msg=[];
    for(var i=8;i--;this.msg.push(""));

})();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////