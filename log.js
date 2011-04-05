/*******************************************************************************

	Base Attack 2 - ingame console functions
	http://jsyang.ca

*******************************************************************************/

function updateMSGS(msg){
	world.msgs.shift();
	world.msgs.push(msg);
}

function displayMSGS(){
	if(world.logUpdate-->0) return;
	var b="";
	for(var i in world.msgs){
		var a=world.msgs[i];
		b+=a+"<br>";
	}
	world.log.innerHTML=b;
	world.logUpdate=world.logUpdateInterval;
}
