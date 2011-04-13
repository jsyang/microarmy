/*
    gLayer.js
    Implements a gLayer: abstracted image-loader and canvas drawing context
    object with a callback feature after images are done loading.
    
    April 20, 2010
    jsyang.ca@gmail.com

    Parameters:
    imgs            array of image filenames to load
    fn              callback when done loading imgs
    
    Object members:
    i               array of HTMLImageElements
    e               <canvas> HTMLElement
    c               DrawingContext
	
*/

function gLayer(imgs,size,fn)
{
    
    this.w=size[0];
    this.h=size[1];    
	this.i=[];
	this.iLoaded=0;	
	this.callback=fn;
	
	// <canvas>
	this.e=document.createElement("canvas");
    this.e.width=this.w;
    this.e.height=this.h;
	document.body.appendChild(this.e);
    
	this.c=this.e.getContext('2d');	

    // Check progress of loading event
	this.checkProgress=function(obj,n){ if(++obj.iLoaded==n) obj.callback(obj); };
    
    // Clear the canvas for the gLayer
    this.clear=function() { this.c.clearRect(0,0,this.w,this.h); };
    
    // Load the images
	for(var j in imgs)
	{
		var a=new Image();
		a.src=imgs[j];
		this.i.push(a);
		a.onerror=function(){ alert("Error in loading "+this.src); };
		if(fn) a.onload=this.checkProgress(this,imgs.length);
	}
	
	// If we didn't have any images, do the callback
	if(fn && !imgs.length) fn(this);
}

function getDocumentSize()
{
        var m=Math.max;
        var db=document.body;
        var de=document.documentElement;
        
        return [
            m(db.scrollWidth,db.offsetWidth,de.clientWidth,de.scrollWidth,de.offsetWidth),        
            m(db.scrollHeight,db.offsetHeight,de.clientHeight,de.scrollHeight,de.offsetHeight)
        ];
}