

function startBot(){
    window.adsController = null;

    console.log('retrieving net');
    var net = createNet(getNet('c_elegans'));
    console.log('net loaded');
    
    window.onmousemove = function(){};
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

    /*function distL1(x1, y1, x2, y2){
	return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }*/
    
    function botLoop(){
	s = window.snake;
	if(!s) return;

	/*// get vector pointing to greatest food density
	var x = 0;
	var y = 0;
	for(var i = 0; i != foods.length; i++){
	    var f = foods[i];
	    if(!f)
		continue;
	    var dx = (f.rx - s.pts[s.pts.length-1].xx);
	    var dy = (f.ry - s.pts[s.pts.length-1].yy);
	    var size = f.sz;
	    f.rad = size / 5; // just for visuals
	    x += size / dx;
	    y += size / dy;
	}

	
	
	var scale = getThreshold() / Math.abs(x); // normalize input
	x *= scale;
	y *= scale;
	*/

	// turn left or right?
	var l = 0;
	var r = 0;
	var rat = ym / xm;
	var myAngle = Math.atan(rat);
	var PI = Math.PI;
	var twoPI = PI + PI;

	for(var i = 0; i != foods.length; i++){
	    var f = foods[i];
	    if(!f)
		continue;
	    var dx = (f.rx - s.pts[s.pts.length-1].xx);
	    var dy = (f.ry - s.pts[s.pts.length-1].yy);
	    var d = Math.pow(dx * dx + dy * dy, 0.5); // consider L1
	    var size = f.sz;
	    var fangle = Math.atan(dy / dx);
	    var da = fangle - myAngle;
	    if(da < 0)
		da += twoPI;
	    else if(da >= twoPI)
		da -= twoPI;
	    if(da < PI)
		l += size / d;
	    else
		r += size / d;
	    f.rad = size / 5; // just for visuals
	}	
	// pass vector to net
	if(l > r)
	    net.setInput([0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0]);
	else
	    net.setInput([0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1]);

	//var NUM_STEPS = 10; // number of timesteps the net experiences per game timestep
	//for(var i=0; i!=NUM_STEPS; i++)
	net.step();
	
	// read output
	vec = net.getOutput();
	var sum = 0;
	for(var i = 0; i != vec.length; i++)
	    sum += (i & 1)? vec[i] : -vec[i]; // odd spots are right muscles, even are left muscles

	var TURN_AMT = 0.15;
	
	if(sum > 0) // turn right
	    myAngle = (myAngle + TURN_AMT) % twoPI;
	else // turn left
	    myAngle = (twoPI + myAngle - TURN_AMT) % twoPI;

	rat = Math.tan(myAngle);
	var scale = 256 / (rat?rat:0.01);
	xm = scale;
	ym = scale * rat;
	/*
	x = vec[0];
	y = vec[1];
	var m = Math.max(x, y);
	var scale = 100 / Math.abs(m?m:0.1);
	xm = vec[0] * scale;
	ym = vec[1] * scale;
	*/
	//console.log(foods[0]);
	//console.log(minS, maxS);
    }

    console.log('starting bot loop');
    setDelayInterval(botLoop, 100);
}


console.log('injecting bot script');
test(); // test net.js methods
var script = document.createElement('script');
//script.src = 'bot.js';
script.appendChild(document.createTextNode(createNet.toString() + getThreshold.toString() + getNet.toString() + startBot.toString() + 'startBot();'));
console.log(script);
document.body.appendChild(script);
console.log(script);
