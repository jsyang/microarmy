/*******************************************************************************

	Base Attack 2 - Infantry classes
	http://jsyang.ca

*******************************************************************************/

function Infantry(x,y,type,direction){
	this.x=x;
	this.y=y;
	this.type=type;
	this.direction=direction;
	this.side=(type>1)?1:0;				// allegiance
	this.target=undefined;				// attack this
	
	if(type%2){
		// rocket
		this.health=((Math.random()*20)>>0)+60;
		this.sight=8;
		this.maxreloadtime=160;
		this.maxberserktime=((Math.random()*15)>>0)+3;
		this.berserk=Math.random()*0.3;		// berserk potential
	}else{		
		// pistol
		this.health=((Math.random()*40)>>0)+30;
		this.sight=7;
		this.maxreloadtime=25;
		this.maxberserktime=((Math.random()*40)>>0)+10;
		this.berserk=Math.random()*0.7;		// berserk potential
	}
	
	
	// animations
	this.frame=0;
	this.action=0;
	this.reloadtime=this.maxreloadtime;
	this.berserktime=0;
	this.corpsetime=180;				// ;)
	
	this.resetTarget=function(){
		this.action=0;
		this.target=undefined;
	};
		
	this.checkTarget=function(scan){
		// vision is always set to check only the 3 closest
		// oldhitScan (scanner) segments
		
		var i=this.x>>8;
		var scanner=scan[i].slice(0);
		if(i>0) scanner.concat(scan[i-1].slice(0));
		if(i<scan.length-1) scanner.concat(scan[i+1].slice(0));
		
		// look for enemies in these segments
		var potentialTargets=[];
		for(var a in scanner){
			var b=scanner[a];
			if((b.side-this.side)&&(b.health>0)){
				potentialTargets.push(b);
			}
		}
		
		// sort by min dist
		var b=16384;
		for(var a in potentialTargets){
			var c=Math.abs(potentialTargets[a].x-this.x);
			if(b>c){
				b=c;
				this.target=potentialTargets[a];
			}
		}

		// check if we have a target, if not: exit, keep looking
		if(this.target==undefined) return;
					
		// head in direction of target
		this.direction=(this.target.x>this.x)?1:-1;
	};
	
	this.move=function(){
		var r=Math.random;
		var startFrame,endFrame;
		
		switch(this.action){
			case 0:	//------------------------------------- movement
				startFrame=	(this.direction>0)?6:0;
				endFrame=	(this.direction>0)?11:5;
				
				if(this.frame<endFrame) this.frame++;
				else this.frame=startFrame;
								
				this.x+=this.direction;
				
				// check if out of bounds
				if(!(this.x<world.size[0]) || (this.x<0)){
					if((!(this.x<world.size[0]) && (this.type>1))
					|| ((this.x<0) && !(this.type>1))
					){

						// mission accomplished!

						this.x-=this.direction;
						soundManager.play('accomp');
						clearInterval(world.runTimer);

						updateMSGS("---------------------------------------------");
						updateMSGS(((this.side)?"Green ":"Blue ")+"objective met. Mission accomplished.");
						updateMSGS("Blue losses: "+world.deaths[0]);
						updateMSGS("Green losses: "+world.deaths[1]);
						updateMSGS("---------------------------------------------");

						world.logUpdate=0;
						break;
					}else{
						
						// retreated back to base
						
						this.health=0;
						this.corpsetime=0;
						break;
					}					
				}
				
				this.y=world.heightmap[this.x];
				break;
			
			case 1: //------------------------------ standing attack
			case 2: //-------------------------------- crouch attack
			case 3: //--------------------------------- prone attack
				// bullet origin
				if(this.action==1) var a=-4;
				if(this.action==2) var a=-4;
				if(this.action==3) var a=-2;
				var b=(this.direction>0)?5:-5;
			
				var fDist=Math.abs(this.target.x-this.x);
				// melee case, don't fire projectile, just KILL
				if(fDist<9){
					if(r()<this.berserk){
						this.target.health=0;
						this.target=undefined;
						this.action=0;
						updateMSGS(((this.side)?"Green ":"Blue ")+" unit engaged in hand-to-hand combat.");
						break;		// KILLED
					}
				}
								
				endFrame=(this.direction>0)?11:5;
				startFrame=(this.direction>0)?6:0;
				if(this.type%2){
					var isShotFrame=(this.frame==endFrame-2);
					if(isShotFrame) soundManager.play('rocket');
					var range=90;
					var pType=1;
					
					var accuracy=[1,1];	// base, bonus target				
					if(fDist>10){
						accuracy=[0.1,0.8];
						if(fDist>40){
						accuracy=[0.1,0.6];
						if(fDist>80){
						accuracy=[0.1,0.4];
						if(fDist>120){
						accuracy=[0.08,0.2];
						if(fDist>150){
						accuracy=[0.04,0.2];
						}}}}
					}
					
				}else{
					var isShotFrame=(this.frame==endFrame-2)||
							(this.frame==endFrame-4);
					if(this.frame==endFrame-4) soundManager.play('pistol');
					var range=35;
					var pType=0;
					
					var accuracy=[1,1];	// base, bonus target				
					if(fDist>10){
						accuracy=[0.1,0.5];
						if(fDist>40){
						accuracy=[0.08,0.3];
						if(fDist>80){
						accuracy=[0.07,0.2];
						if(fDist>120){
						accuracy=[0.03,0.1];
						if(fDist>150){
						accuracy=[0.02,0.1];
						}}}}
					}
					
				}
				
				if(this.frame<endFrame){
					if(isShotFrame){
						projectiles.push(new Bullet(pType,this.x+b,this.y+a,range,((this.target.y-this.y)<<2)/fDist,this.direction<<2,this.side,accuracy,this.target));
					}
					this.frame++;
				}else{
					if(!(this.reloadtime-->0)){
						this.frame=startFrame;this.reloadtime=this.maxreloadtime;
						if(r()<this.berserk){
							this.resetTarget();
							this.berserktime=this.maxberserktime;
						}
					}
				}
				break;

				
			case 4: //--------------------------------------- death1
			case 5:	//--------------------------------------- death2
				if(this.frame==5||this.frame==11){
					this.corpsetime--;
				}else{
					this.frame++;
				}
				break;
		}
	};

	this.alive=function(scan){
		var a=Math.abs;
		var r=Math.random;

		if(this.health>0){
			// check for berserker
			if(this.berserktime>0){
				this.berserktime--;
			}else{
				if(this.target==undefined){
					this.checkTarget(scan);
				}else{
					if(this.target.health>0){					
						if(this.action==0){
							if(!(a(this.target.x-this.x)>>this.sight)){
								this.action=((r()*3)>>0)+1;
							}
						}
					}else{
						this.resetTarget(); 
					}
				}
			}
					
		}else if(this.action<4){
			// play death animation
			this.action=((r()*2)>>0)+4;
			this.frame=(this.direction>0)?6:0;
			
			// death sound
			var b=(Math.random()*4)>>0;
			if(b==0) soundManager.play('die1');
			if(b==1) soundManager.play('die2');
			if(b==2) soundManager.play('die3');
			if(b==3) soundManager.play('die4');
			
			updateMSGS(((this.side)?"Green ":"Blue ")+" unit lost.");
			world.deaths[this.side]++;
		}
		this.move();
	};
}
