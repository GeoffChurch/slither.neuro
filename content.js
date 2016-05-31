

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

    function getTarget(){
	var tX = 0;
	var tY = 0;
	
	for(var i = 0; i != foods.length; i++){
	    var f = foods[i];
	    if(!f)
		continue;
	    var dx = (f.rx - snake.xx);//s.pts[s.pts.length - 1].xx); // dx > 0 -> food is to our right
	    var dy = (f.ry - snake.yy);//s.pts[s.pts.length - 1].yy); // dy > 0 -> food is below us
	    var d = Math.pow(dx * dx + dy * dy, 0.5); // L2
	    //var d = Math.abs(dx) + Math.abs(dy); // L1
	    var size = f.sz;
	    var val = size / (d * d);
	    // TODO ignore food that's too close
	    tX += dx * val;
	    tY += dy * val;
	    //var fangle = Math.atan2(dy, dx); // fangle > 0 -> food is below us
	    //var dangle = fangle - mangle; // abs(dangle) > pi -> turn right
	    //sum += (Math.abs(dangle) - PI) * size / d;

	    f.rad = size / 5; // just for visuals
	}
	return [tX, tY];
    }

    function normATAN(y, x){ // return atan in range [0, 2*PI]
	var ret = Math.atan2(y, x);
	return ret >= 0 ? ret : Math.PI - ret;
    }
    
    function botLoop(){
	s = window.snake;
	if(!s){ // not currently in game, so start one
	    document.getElementById('nick').value = 'Wormulus';
	    document.getElementById('playh').children[0].click();
	    return;
	}

	// reset zoom and acceleration
	window.gsc = 0.4;
	setAcceleration(0);

	// get target point
	var target = getTarget();
	var tX = target[0];
	var tY = target[1];

	var PI = Math.PI;
	var twoPI = PI + PI;
	
	// get current angle
	var mangle = Math.atan2(window.ym, window.xm);
	
	// get target angle
	var tangle = Math.atan2(tY, tX); // tangle < PI -> food is below us

	// get turn
	var dangle = tangle - mangle; // abs(dangle) > pi -> turn right
	if(dangle > PI)
	    var t = dangle - twoPI;
	else if(dangle <= -PI)
	    var t = dangle + twoPI;
	else
	    var t = dangle;

	
	// pass turn to net
	//console.log((t < 0 ? 'food to right' : 'food to left'), t);
	//if(Math.abs(t) < 1)
	if(t < 0){
	    t = -t;
	    var inputVec = [0,0,0,0,0,0,0,0,0,0,0,t,0,t,0,t,0,t];
	}else{
	    var inputVec = [0,0,0,0,0,0,0,0,0,0,t,0,t,0,t,0,t,0];
	}
	
	// run net
	var NUM_STEPS = 10; // number of timesteps the net experiences per game timestep
	for(var i=0; i!=NUM_STEPS; i++){
	    net.setInput(inputVec);
	    net.step();
	}
	
	// read output
	var vec = net.getOutput();

	var lefts = 0;
	for(var i = 0; i < vec.length; i+=2) // get even (left) muscles
	    lefts += vec[i];
	var rights = 0;
	for(var i = 1; i < vec.length; i+=2) // get odd (right) muscles
	    rights += vec[i];

	var accThresh =200;
	if(lefts > accThresh || rights > accThresh){
	    console.log('accelerating');
	    console.log('sumL:', lefts);
	    console.log('sumR:', rights);
	    setAcceleration(1);
	}
	
	var sum = rights - lefts;

	var TURN_AMT = 0.2;
	
	//console.log(sum > 0 ? 'turn right' : 'turn left');

	mangle += sum * TURN_AMT;
	if(mangle > PI)
	    mangle -= twoPI;
	else if(mangle < 0){
	    mangle += twoPI;
	}
	

	// convert angle to vector
	xm = Math.cos(mangle);
	ym = Math.sin(mangle);
	var max = Math.max(xm, ym);
	var scale = Math.abs(257 / (max ? max : 0.001)); // if our vector is less than 256 slither.io disregards it
	xm *= scale;
	ym *= scale;
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
