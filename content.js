

function startBot(){
    window.adsController = null;

    console.log('retrieving net');
    var net = createNet(getNet('c_elegans'));
    console.log('net loaded');
    
    // window.onmousemove = function(){};
    function setDelayInterval(f, t){
	console.log('starting bot loop');
	function delayInterval(){
	    setTimeout(function(){
		f();
		delayInterval();
	    }, t);
	};
	delayInterval();
    }
    
    function botLoop(){
	s = window.snake;
	if(!s) return; // not currently in game

	var yoverx = ym / xm;
	var mangle = Math.atan2(ym, xm); // in range [-pi, pi]
	var PI = Math.PI;
	console.log('mangle:', mangle / PI,'/ PI');
	var twoPI = PI + PI; // TODO do we need this?
	var halfPI = PI / 2;
	
	// turn left or right?
	var sum = 0;

	for(var i = 0; i != foods.length; i++){
	    var f = foods[i];
	    if(!f)
		continue;
	    
	    var dx = (f.rx - s.pts[s.pts.length-1].xx); // dx > 0 -> food is to our right
	    var dy = (f.ry - s.pts[s.pts.length-1].yy); // dy > 0 -> food is below us
	    var d = Math.pow(dx * dx + dy * dy, 0.5); // consider L1
	    var size = f.sz;
	    var fangle = Math.atan(dy, dx); // fangle > 0 -> food is below us
	    var dangle = fangle - mangle; // abs(dangle) > pi -> turn right
	    sum += (Math.abs(dangle) > PI) ? size / d : -size / d;

	    f.rad = size / 5; // just for visuals
	}	
	// pass vector to net
	console.log((sum > 0 ? 'food to right' : 'food to left'), Math.abs(sum));
	if(sum > 0)
	    net.setInput([0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1]);
	else
	    net.setInput([0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0]);

	//var NUM_STEPS = 10; // number of timesteps the net experiences per game timestep
	//for(var i=0; i!=NUM_STEPS; i++)
	net.step();
	
	// read output
	vec = net.getOutput();
	var sum = 0;
	for(var i = 0; i != vec.length; i++)
	    sum += (i & 1)? vec[i] : -vec[i]; // odd spots are right muscles, even are left muscles

	// get new angle
	var TURN_AMT = 0.15;
	
	console.log(sum > 0 ? 'turn right' : 'turn left');	

	if(sum > 0){ // turn right
	    mangle += TURN_AMT;
	    if(mangle > twoPI)
		mangle -= twoPI;
	}else{ // turn left
	    mangle -= TURN_AMT;
	    if(mangle < 0)
		mangle += twoPI;
	}

	// convert angle to vector
	xm = Math.cos(mangle);
	ym = Math.sin(mangle);
	var max = Math.max(xm, ym);
	var scale = Math.abs(257 / (max ? max : 0.001)); // if our vector is less than 256 slither.io disregards it
	xm *= scale;
	ym *= scale;
	
	console.log(xm, ym);
    }

    console.log('starting bot loop');
    setDelayInterval(botLoop, 100);
}


console.log('injecting bot script');
var script = document.createElement('script');
//script.src = 'bot.js';
script.appendChild(document.createTextNode(createNet.toString() + getThreshold.toString() + getNet.toString() + startBot.toString() + 'startBot();'));
console.log(script);
document.body.appendChild(script);
console.log(script);
