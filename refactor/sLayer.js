/*
    sLayer.js
    Implements an sLayer: abstracted audio-loader and canvas drawing context
    object with a callback feature after images are done loading.
    
    April 7, 2011
    jsyang.ca@gmail.com

    Parameters:
    imgs            array of image filenames to load
    fn              callback when done loading imgs
    
    Object members:
    s               array of Audio objects
	
    Give it an object for instance:
        var snds=
        {
            rocket: { src: "snd/rocket", channels: 3 }  // usually 3 channels are enough
            pistol: { src: "snd/rocket", channels: 3 }
        }
    
    Access it via the sLayer:
        var sLayer1=new sLayer(snds,function(){ alert("Done loading!"); });
        sLayer1.s.rocket.play();
        sLayer1.s.rocket.play();
        sLayer1.s.rocket.play();        
*/

function sLayer(snds,fn)
{
    
	this.s={};
	this.sLoaded=0;	
	this.callback=fn;
	
	// Check progress of loading event
	this.checkProgress=function(obj,n){ if(++obj.sLoaded==n) obj.callback(obj); };
   
    // Count the number of sounds.
    var n=0; for(var i in snds) n++;
    
    // Load the sounds
	for(var i in snds)
	{
        this.s[i]={ channels:[], c:0 };
		for(var j=snds[i].channels; j--;)
            this.s[i].channels.push(new Audio(snds[i].src));
		
        // Bind the play event for all the channels.
        this.s[i].play=function()
        {                                      
            this.channels[this.c].currentTime=0;
            this.channels[this.c].play();            
            if(!this.c) this.c=this.channels.length-1;
            else this.c--;
        };
		if(fn) this.s[i].channels[0].addEventListener("canplaythrough",this.checkProgress(this,n),false);        
	}
}
