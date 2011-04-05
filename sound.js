/********************************************************************************

	Base Attack 2 - Sound and music list for soundmanager2

********************************************************************************/

soundManager.url='./';
soundManager.debugMode=false;
soundManager.onload=function(){

	var r=Math.random();
	var mus=[
		'decept',
		'otp',
		'lof',
		'march',
		'untamed'
	];
	soundManager.createSound(
		'mus',
		'./mus/'+mus[(r*mus.length)>>0]);
	
	var snd=[
		'accomp',
		'die1',
		'die2',
		'die3',
		'die4',
		'exp',
		'rocket',
		'pistol'
	]; for(var i in snd){
		var b=snd[i];
		soundManager.createSound(b,'./snd/'+b);
	}
	
	// play a random track
	//soundManager.play('mus');
};
