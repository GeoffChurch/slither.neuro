function createNet(s){
    console.log('creating net');
    var THRESHOLD = getThreshold();
    // parse net
    var net = null;
    if(!s)
	net = {
	    inputs: [],
	    outputs: [],
	    nodes: {}
	};
    else if (typeof s === 'string' || s instanceof String)
	net = JSON.parse(s);
    else
	net = s;
    //
    
    // replace names with pointers
    var nodes = net.nodes;
    var undefs = [];
    for(var name of Object.keys(nodes)){
	var node = nodes[name];
	var edges = node.edges;
	
	for(var i in edges){
	    var edge = edges[i];
	    if(!nodes[edge.dst]){
		undefs.push(edge.dst);
		edge.dst = nodes[edge.dst] = {
		    value: [0, 0],
		    edges: []
		};

		// add a self-loop to conserve energy
		edge.dst.edges.push({
		    dst: edge.dst,
		    value: getThreshold()
		});
	    }else
		edge.dst = nodes[edge.dst];
	}
    }

    if(undefs){
	console.warn('The following nodes were not defined:\n', undefs);
    }
    
    var inputs = net.inputs;
    for(var index in inputs)
	inputs[index] = nodes[inputs[index]];
    
    var outputs = net.outputs;
    for(var index in outputs)
	outputs[index] = nodes[outputs[index]];
    //
    
    // set up clock
    if(!net.T)
	net.T = 0;
    //

    // add net methods
    net.step = function(){
	for(var i in this.nodes)
	    nodes[i].step(this.T);
	for(var i in this.nodes)
	    nodes[i].tick(this.T);
	this.T ^= 1;
    };

    net.setInput = function(input){
	//console.log('input:', input);
	var THRESHOLD = getThreshold();
	for(var i in input)
	    this.inputs[i].value[this.T] += THRESHOLD * input[i];
    }

    net.getOutput = function(){
	var output = [];
	output.length = this.outputs.length;
	for(var i in this.outputs){
	    var value = this.outputs[i].value;
	    output[i] = value[this.T];
	    value[this.T] = 0;
	    //if(value[0] || value[1]) alert('value:', value[0], value[1]);
	}
	//console.log('output:',output);
	return output
    }
    //
    
    // add node methods
    for(var i in nodes){
	nodes[i].step = function(T){
	    if(this.value[T] >= THRESHOLD){
		for(var i in this.edges){
		    this.edges[i].step(T);
		}
		this.value[T] -= THRESHOLD;
	    }
	}
	
	nodes[i].tick = function(T){
	    this.value[T^1] += this.value[T];
	    this.value[T] = 0;
	}
    }
    //
    
    // add edge methods
    for(var i in nodes){
	var edges = nodes[i].edges;
	for(var j in edges){
	    edges[j].step = function(T){
		this.dst.value[T^1] += this.value;
		// TODO plasticity
	    }
	}
    }
    //
    
    return net;
}

function test(){
    console.log('running tests');
    
    var net = createNet(getNet('test'));
    net.setInput([120]);
    for(var i = 0; i!=20; ++i){
	console.log('step',i);
	console.log(net.nodes.delta.value[net.T]);
	net.setInput([1]);
	net.step();
	console.log(net.getOutput());
    }
};

function getThreshold(){
    return 30;
}

function getNet(name){

    var test = {
	inputs: ['alpha', 'beta'],
	outputs: ['gamma', 'delta'],
	nodes: {
	    alpha: {
		value: [0, 0],
		edges: [{
		    dst: 'beta',
		    value: 4,
		},{
		    dst: 'gamma',
		    value: 3,
		}]
	    },
	    beta: {
		value: [20, 89],
		edges: [{
		    dst: 'gamma',
		    value: 4
		},{
		    dst: 'delta',
		    value: -2
		}]
	    },
	    gamma: {
		value: [1, 0],
		edges: [{
		    dst: 'delta',
		    value: -8
		}]
	    },
	    delta: {
		value: [100, 0],
		edges: [{
		    dst: 'alpha',
		    value: 10
		}]
	    }
	},
    }; // end test

    var c_elegans = {
	inputs: [
	    // 10 bump-detecting neurons
	    "FLPL",  "FLPR",
	    "ASHL",  "ASHR",
	    "IL1VL", "IL1VR",
	    "OLQDL", "OLQDR",
	    "OLQVL", "OLQVR",
	    // 8 food-detecting neurons
	    "ADFL", "ADFR",
	    "ASGL", "ASGR",
	    "ASIL", "ASIR",
	    "ASJL", "ASJR"],
	
	outputs: [
	    // 68 muscle neurons (slither.io has no use for MVULVA).
	    /*
	      "MDL01", "MDR01",
	      "MDL02", "MDR02",
	      "MDL03", "MDR03",
	      "MDL04", "MDR04",
	      "MDL05", "MDR05",
	      "MDL06", "MDR06",
	    */

	    // 34 dorsal muscles
	    "MDL07", "MDR07",
	    "MDL08", "MDR08",
	    "MDL09", "MDR09",
	    "MDL10", "MDR10",
	    "MDL11", "MDR11",
	    "MDL12", "MDR12",
	    "MDL13", "MDR13",
	    "MDL14", "MDR14",
	    "MDL15", "MDR15",
	    "MDL16", "MDR16",
	    "MDL17", "MDR17",
	    "MDL18", "MDR18",
	    "MDL19", "MDR19",
	    "MDL20", "MDR20",
	    "MDL21", "MDR21",
	    "MDL22", "MDR22",
	    "MDL23", "MDR23",

	    // 34 ventral muscles
	    "MVL07", "MVR07",
	    "MVL08", "MVR08",
	    "MVL09", "MVR09",
	    "MVL10", "MVR10",
	    "MVL11", "MVR11",
	    "MVL12", "MVR12",
	    "MVL13", "MVR13",
	    "MVL14", "MVR14",
	    "MVL15", "MVR15",
	    "MVL16", "MVR16",
	    "MVL17", "MVR17",
	    "MVL18", "MVR18",
	    "MVL19", "MVR19",
	    "MVL20", "MVR20",
	    "MVL21", "MVR21",
	    "MVL22", "MVR22",
	    "MVL23", "MVR23",
	],
	
	nodes: {
	    ADAL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 2
		    },
		    {
			dst: 'ADFL',
			value: 1
		    },
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AIBR',
			value: 2
		    },
		    {
			dst: 'ASHL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 4
		    },
		    {
			dst: 'AVBR',
			value: 7
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVJR',
			value: 5
		    },
		    {
			dst: 'FLPR',
			value: 1
		    },
		    {
			dst: 'PVQL',
			value: 1
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RICR',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 3
		    }, 
		    {
			dst: 'RIPL',
			value: 1
		    },
		    {
			dst: 'SMDVR',
			value: 2
		    }]},

	    ADAR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 1
		    },
		    {
			dst: 'ADFR',
			value: 1
		    },
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'ASHR',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 5
		    },
		    {
			dst: 'AVDL',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 3
		    },
		    {
			dst: 'PVQR',
			value: 1
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RIMR',
			value: 5
		    },
		    {
			dst: 'RIPR',
			value: 1
		    },
		    {
			dst: 'RIVR',
			value: 1
		    },
		    {
			dst: 'SMDVL',
			value: 2
		    }]},

	    ADEL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 1
		    },
		    {
			dst: 'ADER',
			value: 1
		    },
		    {
			dst: 'AINL',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVAR',
			value: 3
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVKR',
			value: 1
		    },
		    {
			dst: 'AVL',
			value: 1
		    },
		    {
			dst: 'BDUL',
			value: 1
		    },
		    {
			dst: 'CEPDL',
			value: 1
		    },
		    {
			dst: 'FLPL',
			value: 1
		    },
		    {
			dst: 'IL1L',
			value: 1
		    },
		    {
			dst: 'IL2L',
			value: 1
		    },
		    {
			dst: 'MDL05',
			value: 1
		    },
		    {
			dst: 'OLLL',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 1
		    },
		    {
			dst: 'RIFL',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 5
		    },
		    {
			dst: 'RIGR',
			value: 3
		    },
		    {
			dst: 'RIH',
			value: 2
		    },
		    {
			dst: 'RIVL',
			value: 1
		    },
		    {
			dst: 'RIVR',
			value: 1
		    },
		    {
			dst: 'RMDL',
			value: 2
		    },
		    {
			dst: 'RMGL',
			value: 1
		    },
		    {
			dst: 'RMHL',
			value: 1
		    },
		    {
			dst: 'SIADR',
			value: 1
		    },
		    {
			dst: 'SIBDR',
			value: 1
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    },
		    {
			dst: 'URBL',
			value: 1
		    }]},

	    ADER: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 1
		    },
		    {
			dst: 'ADEL',
			value: 2
		    },
		    {
			dst: 'ALA',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 5
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'AVJR',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'AVKR',
			value: 1
		    },
		    {
			dst: 'CEPDR',
			value: 1
		    },
		    {
			dst: 'FLPL',
			value: 1
		    },
		    {
			dst: 'FLPR',
			value: 1
		    },
		    {
			dst: 'OLLR',
			value: 2
		    },
		    {
			dst: 'PVR',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 7
		    },
		    {
			dst: 'RIGR',
			value: 4
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 2
		    },
		    {
			dst: 'SAAVR',
			value: 1
		    }]},

	    ADFL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 2
		    },
		    {
			dst: 'AIZL',
			value: 12
		    },
		    {
			dst: 'AUAL',
			value: 5
		    },
		    {
			dst: 'OLQVL',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 15
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RIR',
			value: 2
		    },
		    {
			dst: 'SMBVL',
			value: 2
		    }]},

	    ADFR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 2
		    },
		    {
			dst: 'AIAR',
			value: 1
		    },
		    {
			dst: 'AIYR',
			value: 1
		    },
		    {
			dst: 'AIZR',
			value: 8
		    },
		    {
			dst: 'ASHR',
			value: 1
		    },
		    {
			dst: 'AUAR',
			value: 4
		    },
		    {
			dst: 'AWBR',
			value: 1
		    },
		    {
			dst: 'PVPR',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 16
		    },
		    {
			dst: 'RIGR',
			value: 3
		    },
		    {
			dst: 'RIR',
			value: 3
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    },
		    {
			dst: 'SMBVR',
			value: 2
		    },
		    {
			dst: 'URXR',
			value: 1
		    }]},

	    ADLL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADLR',
			value: 1
		    },
		    {
			dst: 'AIAL',
			value: 6
		    },
		    {
			dst: 'AIBL',
			value: 7
		    },
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'ALA',
			value: 2
		    },
		    {
			dst: 'ASER',
			value: 3
		    },
		    {
			dst: 'ASHL',
			value: 2
		    },
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVAR',
			value: 3
		    },
		    {
			dst: 'AVBL',
			value: 2
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 4
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AVJR',
			value: 3
		    },
		    {
			dst: 'AWBL',
			value: 2
		    },
		    {
			dst: 'OLQVL',
			value: 1
		    },
		    {
			dst: 'OLQVL',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 1
		    },
		    {
			dst: 'RMGL',
			value: 1
		    }]},

	    ADLR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADLL',
			value: 1
		    },
		    {
			dst: 'AIAR',
			value: 10
		    },
		    {
			dst: 'AIBR',
			value: 10
		    },
		    {
			dst: 'ASER',
			value: 1
		    },
		    {
			dst: 'ASHR',
			value: 3
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'AVDL',
			value: 5
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVJR',
			value: 1
		    },
		    {
			dst: 'AWCR',
			value: 3
		    },
		    {
			dst: 'OLLR',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RICR',
			value: 1
		    }]},

	    AFDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AFDR',
			value: 1
		    },
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AINR',
			value: 1
		    },
		    {
			dst: 'AIYL',
			value: 7
		    }]},

	    AFDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AFDL',
			value: 1
		    },
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AIYR',
			value: 13
		    },
		    {
			dst: 'ASER',
			value: 1
		    }]},

	    AIAL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 1
		    },
		    {
			dst: 'AIAR',
			value: 1
		    },
		    {
			dst: 'AIBL',
			value: 10
		    },
		    {
			dst: 'AIML',
			value: 2
		    },
		    {
			dst: 'AIZL',
			value: 1
		    },
		    {
			dst: 'ASER',
			value: 3
		    },
		    {
			dst: 'ASGL',
			value: 1
		    },
		    {
			dst: 'ASHL',
			value: 1
		    },
		    {
			dst: 'ASIL',
			value: 2
		    },
		    {
			dst: 'ASKL',
			value: 3
		    },
		    {
			dst: 'AWAL',
			value: 1
		    },
		    {
			dst: 'AWCR',
			value: 1
		    },
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'RIFL',
			value: 1
		    },
		    {
			dst: 'RMGL',
			value: 1
		    }]},

	    AIAR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 1
		    },
		    {
			dst: 'ADFR',
			value: 1
		    },
		    {
			dst: 'ADLR',
			value: 2
		    },
		    {
			dst: 'AIAL',
			value: 1
		    },
		    {
			dst: 'AIBR',
			value: 14
		    },
		    {
			dst: 'AIZR',
			value: 1
		    },
		    {
			dst: 'ASER',
			value: 1
		    },
		    {
			dst: 'ASGR',
			value: 1
		    },
		    {
			dst: 'ASIR',
			value: 2
		    },
		    {
			dst: 'AWAR',
			value: 1
		    },
		    {
			dst: 'AWAR',
			value: 1
		    },
		    {
			dst: 'AWCL',
			value: 1
		    },
		    {
			dst: 'AWCR',
			value: 3
		    },
		    {
			dst: 'RIFR',
			value: 2
		    }]},

	    AIBL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AFDL',
			value: 1
		    },
		    {
			dst: 'AIYL',
			value: 1
		    },
		    {
			dst: 'ASER',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 5
		    },
		    {
			dst: 'DVC',
			value: 1
		    },
		    {
			dst: 'FLPL',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 4
		    },
		    {
			dst: 'RIFL',
			value: 1
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RIGR',
			value: 3
		    },
		    {
			dst: 'RIML',
			value: 2
		    },
		    {
			dst: 'RIMR',
			value: 13
		    },
		    {
			dst: 'RIMR',
			value: 1
		    },
		    {
			dst: 'RIVL',
			value: 1
		    },
		    {
			dst: 'SAADL',
			value: 2
		    },
		    {
			dst: 'SAADR',
			value: 2
		    },
		    {
			dst: 'SMDDR',
			value: 4
		    }]},

	    AIBR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AFDR',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 3
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'DB1',
			value: 1
		    },
		    {
			dst: 'DVC',
			value: 2
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 4
		    },
		    {
			dst: 'RIGL',
			value: 3
		    },
		    {
			dst: 'RIML',
			value: 16
		    },
		    {
			dst: 'RIML',
			value: 1
		    },
		    {
			dst: 'RIMR',
			value: 1
		    },
		    {
			dst: 'RIS',
			value: 1
		    },
		    {
			dst: 'RIVR',
			value: 1
		    },
		    {
			dst: 'SAADL',
			value: 1
		    },
		    {
			dst: 'SMDDL',
			value: 3
		    },
		    {
			dst: 'SMDVL',
			value: 1
		    },
		    {
			dst: 'VB1',
			value: 3
		    }]},

	    AIML: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAL',
			value: 5
		    },
		    {
			dst: 'ALML',
			value: 1
		    },
		    {
			dst: 'ASGL',
			value: 2
		    },
		    {
			dst: 'ASKL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'AVFL',
			value: 4
		    },
		    {
			dst: 'AVFR',
			value: 1
		    },
		    {
			dst: 'AVHL',
			value: 2
		    },
		    {
			dst: 'AVHR',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'PVQL',
			value: 1
		    },
		    {
			dst: 'RIFL',
			value: 1
		    },
		    {
			dst: 'SIBDR',
			value: 1
		    },
		    {
			dst: 'SMBVL',
			value: 1
		    }]},

	    AIMR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAR',
			value: 5
		    },
		    {
			dst: 'ASGR',
			value: 2
		    },
		    {
			dst: 'ASJR',
			value: 2
		    },
		    {
			dst: 'ASKR',
			value: 3
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVFL',
			value: 1
		    },
		    {
			dst: 'AVFR',
			value: 1
		    },
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'HSNR',
			value: 2
		    },
		    {
			dst: 'OLQDR',
			value: 1
		    },
		    {
			dst: 'PVNR',
			value: 1
		    },
		    {
			dst: 'RIFR',
			value: 1
		    },
		    {
			dst: 'RMGR',
			value: 1
		    }]},

	    AINL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADEL',
			value: 1
		    },
		    {
			dst: 'AFDR',
			value: 5
		    },
		    {
			dst: 'AINR',
			value: 2
		    },
		    {
			dst: 'ASEL',
			value: 3
		    },
		    {
			dst: 'ASGR',
			value: 1
		    },
		    {
			dst: 'ASGR',
			value: 1
		    },
		    {
			dst: 'AUAR',
			value: 1
		    },
		    {
			dst: 'AUAR',
			value: 1
		    },
		    {
			dst: 'BAGL',
			value: 3
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 2
		    }]},

	    AINR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AFDL',
			value: 4
		    },
		    {
			dst: 'AFDR',
			value: 1
		    },
		    {
			dst: 'AIAL',
			value: 2
		    },
		    {
			dst: 'AIBL',
			value: 2
		    },
		    {
			dst: 'AINL',
			value: 2
		    },
		    {
			dst: 'ASEL',
			value: 1
		    },
		    {
			dst: 'ASER',
			value: 1
		    },
		    {
			dst: 'ASGL',
			value: 1
		    },
		    {
			dst: 'AUAL',
			value: 1
		    },
		    {
			dst: 'AUAR',
			value: 1
		    },
		    {
			dst: 'BAGR',
			value: 3
		    },
		    {
			dst: 'RIBL',
			value: 2
		    },
		    {
			dst: 'RID',
			value: 1
		    }]},

	    AIYL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIYR',
			value: 1
		    },
		    {
			dst: 'AIZL',
			value: 13
		    },
		    {
			dst: 'AWAL',
			value: 3
		    },
		    {
			dst: 'AWCL',
			value: 1
		    },
		    {
			dst: 'AWCR',
			value: 1
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 7
		    },
		    {
			dst: 'RIBL',
			value: 4
		    },
		    {
			dst: 'RIML',
			value: 1
		    }]},

	    AIYR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADFR',
			value: 1
		    },
		    {
			dst: 'AIYL',
			value: 1
		    },
		    {
			dst: 'AIZR',
			value: 8
		    },
		    {
			dst: 'AWAR',
			value: 1
		    },
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 6
		    },
		    {
			dst: 'RIBR',
			value: 2
		    },
		    {
			dst: 'RIMR',
			value: 1
		    }]},

	    AIZL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAL',
			value: 3
		    },
		    {
			dst: 'AIBL',
			value: 2
		    },
		    {
			dst: 'AIBR',
			value: 8
		    },
		    {
			dst: 'AIZR',
			value: 2
		    },
		    {
			dst: 'ASEL',
			value: 1
		    },
		    {
			dst: 'ASGL',
			value: 1
		    },
		    {
			dst: 'ASHL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 5
		    },
		    {
			dst: 'DVA',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 8
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 4
		    },
		    {
			dst: 'SMBDL',
			value: 9
		    },
		    {
			dst: 'SMBVL',
			value: 7
		    },
		    {
			dst: 'VB2',
			value: 1
		    }]},

	    AIZR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAR',
			value: 1
		    },
		    {
			dst: 'AIBL',
			value: 8
		    },
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AIZL',
			value: 2
		    },
		    {
			dst: 'ASGR',
			value: 1
		    },
		    {
			dst: 'ASHR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 4
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'AWAR',
			value: 1
		    },
		    {
			dst: 'DVA',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 7
		    },
		    {
			dst: 'RIMR',
			value: 4
		    },
		    {
			dst: 'SMBDR',
			value: 5
		    },
		    {
			dst: 'SMBVR',
			value: 3
		    },
		    {
			dst: 'SMDDR',
			value: 1
		    }]},

	    ALA: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADEL',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 2
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'RID',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 1
		    }]},

	    ALML: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVM',
			value: 1
		    },
		    {
			dst: 'BDUL',
			value: 6
		    },
		    {
			dst: 'CEPDL',
			value: 3
		    },
		    {
			dst: 'CEPVL',
			value: 2
		    },
		    {
			dst: 'PVCL',
			value: 2
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'PVR',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 1
		    },
		    {
			dst: 'RMGL',
			value: 1
		    },
		    {
			dst: 'SDQL',
			value: 1
		    }]},

	    ALMR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVM',
			value: 1
		    },
		    {
			dst: 'BDUR',
			value: 5
		    },
		    {
			dst: 'CEPDR',
			value: 1
		    },
		    {
			dst: 'CEPVR',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 3
		    },
		    {
			dst: 'RMDDL',
			value: 1
		    },
		    {
			dst: 'SIADL',
			value: 1
		    }]},

	    ALNL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'SAAVL',
			value: 3
		    },
		    {
			dst: 'SMBDR',
			value: 2
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    },
		    {
			dst: 'SMDVL',
			value: 1
		    }]},

	    ALNR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADER',
			value: 1
		    },
		    {
			dst: 'RMHR',
			value: 1
		    },
		    {
			dst: 'SAAVR',
			value: 2
		    },
		    {
			dst: 'SMBDL',
			value: 2
		    },
		    {
			dst: 'SMDDR',
			value: 1
		    },
		    {
			dst: 'SMDVL',
			value: 1
		    }]},

	    AQR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 3
		    },
		    {
			dst: 'AVBL',
			value: 3
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 4
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 2
		    },
		    {
			dst: 'AVKR',
			value: 1
		    },
		    {
			dst: 'BAGL',
			value: 2
		    },
		    {
			dst: 'BAGR',
			value: 2
		    },
		    {
			dst: 'PVCR',
			value: 2
		    },
		    {
			dst: 'PVPL',
			value: 1
		    },
		    {
			dst: 'PVPL',
			value: 7
		    },
		    {
			dst: 'PVPR',
			value: 9
		    },
		    {
			dst: 'RIAL',
			value: 3
		    },
		    {
			dst: 'RIAR',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 2
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'URXL',
			value: 1
		    }]},

	    AS1: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 3
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'DA1',
			value: 2
		    },
		    {
			dst: 'MDL05',
			value: 3
		    },
		    {
			dst: 'MDL08',
			value: 3
		    },
		    {
			dst: 'MDR05',
			value: 3
		    },
		    {
			dst: 'MDR08',
			value: 4
		    },
		    {
			dst: 'VA3',
			value: 1
		    },
		    {
			dst: 'VD1',
			value: 5
		    },
		    {
			dst: 'VD2',
			value: 1
		    }]},

	    AS2: {
		value: [0, 0],
		edges: [
		    {
			dst: 'DA2',
			value: 1
		    },
		    {
			dst: 'DB1',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 1
		    },
		    {
			dst: 'MDL07',
			value: 3
		    },
		    {
			dst: 'MDL08',
			value: 2
		    },
		    {
			dst: 'MDR07',
			value: 3
		    },
		    {
			dst: 'MDR08',
			value: 3
		    },
		    {
			dst: 'VA4',
			value: 2
		    },
		    {
			dst: 'VD2',
			value: 10
		    }]},

	    AS3: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'DA2',
			value: 1
		    },
		    {
			dst: 'DA3',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 1
		    },
		    {
			dst: 'MDL09',
			value: 3
		    },
		    {
			dst: 'MDL10',
			value: 3
		    },
		    {
			dst: 'MDR09',
			value: 3
		    },
		    {
			dst: 'MDR10',
			value: 3
		    },
		    {
			dst: 'VA5',
			value: 2
		    },
		    {
			dst: 'VD2',
			value: 1
		    },
		    {
			dst: 'VD3',
			value: 15
		    }]},

	    AS4: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS5',
			value: 1
		    },
		    {
			dst: 'DA3',
			value: 1
		    },
		    {
			dst: 'MDL11',
			value: 2
		    },
		    {
			dst: 'MDL12',
			value: 2
		    },
		    {
			dst: 'MDR11',
			value: 3
		    },
		    {
			dst: 'MDR12',
			value: 2
		    },
		    {
			dst: 'VD4',
			value: 11
		    }]},

	    AS5: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'DD2',
			value: 1
		    },
		    {
			dst: 'MDL11',
			value: 2
		    },
		    {
			dst: 'MDL14',
			value: 3
		    },
		    {
			dst: 'MDR11',
			value: 2
		    },
		    {
			dst: 'MDR14',
			value: 3
		    },
		    {
			dst: 'VA7',
			value: 1
		    },
		    {
			dst: 'VD5',
			value: 9
		    }]},

	    AS6: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DA5',
			value: 2
		    },
		    {
			dst: 'MDL13',
			value: 3
		    },
		    {
			dst: 'MDL14',
			value: 2
		    },
		    {
			dst: 'MDR13',
			value: 3
		    },
		    {
			dst: 'MDR14',
			value: 2
		    },
		    {
			dst: 'VA8',
			value: 1
		    },
		    {
			dst: 'VD6',
			value: 13
		    }]},

	    AS7: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 6
		    },
		    {
			dst: 'AVAR',
			value: 5
		    },
		    {
			dst: 'AVBL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'MDL13',
			value: 2
		    },
		    {
			dst: 'MDL16',
			value: 3
		    },
		    {
			dst: 'MDR13',
			value: 2
		    },
		    {
			dst: 'MDR16',
			value: 3
		    }]},

	    AS8: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 4
		    },
		    {
			dst: 'AVAR',
			value: 3
		    },
		    {
			dst: 'MDL15',
			value: 2
		    },
		    {
			dst: 'MDL18',
			value: 3
		    },
		    {
			dst: 'MDR15',
			value: 2
		    },
		    {
			dst: 'MDR18',
			value: 3
		    }]},

	    AS9: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 4
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'DVB',
			value: 7
		    },
		    {
			dst: 'MDL17',
			value: 2
		    },
		    {
			dst: 'MDL20',
			value: 3
		    },
		    {
			dst: 'MDR17',
			value: 2
		    },
		    {
			dst: 'MDR20',
			value: 3
		    }]},

	    AS10: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'MDL19',
			value: 3
		    },
		    {
			dst: 'MDL20',
			value: 2
		    },
		    {
			dst: 'MDR19',
			value: 3
		    },
		    {
			dst: 'MDR20',
			value: 2
		    }]},

	    AS11: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDL21',
			value: 1
		    },
		    {
			dst: 'MDL22',
			value: 1
		    },
		    {
			dst: 'MDL23',
			value: 1
		    },
		    {
			dst: 'MDL24',
			value: 1
		    },
		    {
			dst: 'MDR21',
			value: 1
		    },
		    {
			dst: 'MDR22',
			value: 1
		    },
		    {
			dst: 'MDR23',
			value: 1
		    },
		    {
			dst: 'MDR24',
			value: 1
		    },
		    {
			dst: 'PDA',
			value: 1
		    },
		    {
			dst: 'PDB',
			value: 1
		    },
		    {
			dst: 'PDB',
			value: 2
		    },
		    {
			dst: 'VD13',
			value: 2
		    }]},

	    ASEL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADFR',
			value: 1
		    },
		    {
			dst: 'AIAL',
			value: 3
		    },
		    {
			dst: 'AIBL',
			value: 7
		    },
		    {
			dst: 'AIBR',
			value: 2
		    },
		    {
			dst: 'AIYL',
			value: 13
		    },
		    {
			dst: 'AIYR',
			value: 6
		    },
		    {
			dst: 'AWCL',
			value: 4
		    },
		    {
			dst: 'AWCR',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 1
		    }]},

	    ASER: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AFDL',
			value: 1
		    },
		    {
			dst: 'AFDR',
			value: 2
		    },
		    {
			dst: 'AIAL',
			value: 1
		    },
		    {
			dst: 'AIAR',
			value: 3
		    },
		    {
			dst: 'AIBL',
			value: 2
		    },
		    {
			dst: 'AIBR',
			value: 10
		    },
		    {
			dst: 'AIYL',
			value: 2
		    },
		    {
			dst: 'AIYR',
			value: 14
		    },
		    {
			dst: 'AWAR',
			value: 1
		    },
		    {
			dst: 'AWCL',
			value: 1
		    },
		    {
			dst: 'AWCR',
			value: 1
		    }]},

	    ASGL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAL',
			value: 9
		    },
		    {
			dst: 'AIBL',
			value: 3
		    },
		    {
			dst: 'AINR',
			value: 1
		    },
		    {
			dst: 'AINR',
			value: 1
		    },
		    {
			dst: 'AIZL',
			value: 1
		    },
		    {
			dst: 'ASKL',
			value: 1
		    }]},

	    ASGR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAR',
			value: 10
		    },
		    {
			dst: 'AIBR',
			value: 2
		    },
		    {
			dst: 'AINL',
			value: 1
		    },
		    {
			dst: 'AIYR',
			value: 1
		    },
		    {
			dst: 'AIZR',
			value: 1
		    }]},

	    ASHL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 1
		    },
		    {
			dst: 'ADAL',
			value: 1
		    },
		    {
			dst: 'ADFL',
			value: 3
		    },
		    {
			dst: 'AIAL',
			value: 7
		    },
		    {
			dst: 'AIBL',
			value: 5
		    },
		    {
			dst: 'AIZL',
			value: 1
		    },
		    {
			dst: 'ASHR',
			value: 1
		    },
		    {
			dst: 'ASKL',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 6
		    },
		    {
			dst: 'AVDL',
			value: 2
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'RIAL',
			value: 4
		    },
		    {
			dst: 'RICL',
			value: 2
		    },
		    {
			dst: 'RIML',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 1
		    },
		    {
			dst: 'RMGL',
			value: 1
		    }]},

	    ASHR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 3
		    },
		    {
			dst: 'ADFR',
			value: 2
		    },
		    {
			dst: 'AIAR',
			value: 10
		    },
		    {
			dst: 'AIBR',
			value: 3
		    },
		    {
			dst: 'AIZR',
			value: 1
		    },
		    {
			dst: 'ASHL',
			value: 1
		    },
		    {
			dst: 'ASKR',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 5
		    },
		    {
			dst: 'AVBR',
			value: 3
		    },
		    {
			dst: 'AVDL',
			value: 5
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 3
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'PVPR',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 2
		    },
		    {
			dst: 'RICR',
			value: 2
		    },
		    {
			dst: 'RMGR',
			value: 2
		    },
		    {
			dst: 'RMGR',
			value: 1
		    }]},

	    ASIL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAL',
			value: 2
		    },
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AIYL',
			value: 2
		    },
		    {
			dst: 'AIZL',
			value: 1
		    },
		    {
			dst: 'ASER',
			value: 1
		    },
		    {
			dst: 'ASIR',
			value: 1
		    },
		    {
			dst: 'ASKL',
			value: 2
		    },
		    {
			dst: 'AWCL',
			value: 1
		    },
		    {
			dst: 'AWCR',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 1
		    }]},

	    ASIR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAL',
			value: 1
		    },
		    {
			dst: 'AIAR',
			value: 3
		    },
		    {
			dst: 'AIAR',
			value: 2
		    },
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'ASEL',
			value: 2
		    },
		    {
			dst: 'ASHR',
			value: 1
		    },
		    {
			dst: 'ASIL',
			value: 1
		    },
		    {
			dst: 'AWCL',
			value: 1
		    },
		    {
			dst: 'AWCR',
			value: 1
		    }]},

	    ASJL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ASJR',
			value: 1
		    },
		    {
			dst: 'ASKL',
			value: 4
		    },
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'PVQL',
			value: 14
		    }]},

	    ASJR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ASJL',
			value: 1
		    },
		    {
			dst: 'ASKR',
			value: 4
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'PVQR',
			value: 13
		    }]},

	    ASKL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAL',
			value: 11
		    },
		    {
			dst: 'AIBL',
			value: 2
		    },
		    {
			dst: 'AIML',
			value: 2
		    },
		    {
			dst: 'ASKR',
			value: 1
		    },
		    {
			dst: 'PVQL',
			value: 5
		    },
		    {
			dst: 'RMGL',
			value: 1
		    }]},

	    ASKR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAR',
			value: 11
		    },
		    {
			dst: 'AIMR',
			value: 1
		    },
		    {
			dst: 'ASHR',
			value: 1
		    },
		    {
			dst: 'ASKL',
			value: 1
		    },
		    {
			dst: 'AWAR',
			value: 1
		    },
		    {
			dst: 'CEPVR',
			value: 1
		    },
		    {
			dst: 'PVQR',
			value: 4
		    },
		    {
			dst: 'RIFR',
			value: 1
		    },
		    {
			dst: 'RMGR',
			value: 1
		    }]},

	    AUAL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AINR',
			value: 1
		    },
		    {
			dst: 'AUAR',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 3
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 3
		    },
		    {
			dst: 'AWBL',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 5
		    },
		    {
			dst: 'RIBL',
			value: 9
		    }]},

	    AUAR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AINL',
			value: 1
		    },
		    {
			dst: 'AIYR',
			value: 1
		    },
		    {
			dst: 'AUAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 4
		    },
		    {
			dst: 'AWBR',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 6
		    },
		    {
			dst: 'RIBR',
			value: 13
		    },
		    {
			dst: 'URXR',
			value: 1
		    }]},

	    AVAL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS1',
			value: 3
		    },
		    {
			dst: 'AS10',
			value: 3
		    },
		    {
			dst: 'AS11',
			value: 4
		    },
		    {
			dst: 'AS2',
			value: 1
		    },
		    {
			dst: 'AS3',
			value: 3
		    },
		    {
			dst: 'AS4',
			value: 1
		    },
		    {
			dst: 'AS5',
			value: 4
		    },
		    {
			dst: 'AS6',
			value: 1
		    },
		    {
			dst: 'AS7',
			value: 14
		    },
		    {
			dst: 'AS8',
			value: 9
		    },
		    {
			dst: 'AS9',
			value: 12
		    },
		    {
			dst: 'AVAR',
			value: 7
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVHL',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 2
		    },
		    {
			dst: 'DA1',
			value: 4
		    },
		    {
			dst: 'DA2',
			value: 4
		    },
		    {
			dst: 'DA3',
			value: 6
		    },
		    {
			dst: 'DA4',
			value: 10
		    },
		    {
			dst: 'DA5',
			value: 8
		    },
		    {
			dst: 'DA6',
			value: 21
		    },
		    {
			dst: 'DA7',
			value: 4
		    },
		    {
			dst: 'DA8',
			value: 4
		    },
		    {
			dst: 'DA9',
			value: 3
		    },
		    {
			dst: 'DB5',
			value: 2
		    },
		    {
			dst: 'DB6',
			value: 4
		    },
		    {
			dst: 'FLPL',
			value: 1
		    },
		    {
			dst: 'LUAL',
			value: 2
		    },
		    {
			dst: 'PVCL',
			value: 12
		    },
		    {
			dst: 'PVCR',
			value: 11
		    },
		    {
			dst: 'PVPL',
			value: 1
		    },
		    {
			dst: 'RIMR',
			value: 3
		    },
		    {
			dst: 'SABD',
			value: 4
		    },
		    {
			dst: 'SABVR',
			value: 1
		    },
		    {
			dst: 'SDQR',
			value: 1
		    },
		    {
			dst: 'URYDL',
			value: 1
		    },
		    {
			dst: 'URYVR',
			value: 1
		    },
		    {
			dst: 'VA1',
			value: 3
		    },
		    {
			dst: 'VA10',
			value: 6
		    },
		    {
			dst: 'VA11',
			value: 7
		    },
		    {
			dst: 'VA12',
			value: 2
		    },
		    {
			dst: 'VA2',
			value: 5
		    },
		    {
			dst: 'VA3',
			value: 3
		    },
		    {
			dst: 'VA4',
			value: 3
		    },
		    {
			dst: 'VA5',
			value: 8
		    },
		    {
			dst: 'VA6',
			value: 10
		    },
		    {
			dst: 'VA7',
			value: 2
		    },
		    {
			dst: 'VA8',
			value: 19
		    },
		    {
			dst: 'VA9',
			value: 8
		    },
		    {
			dst: 'VB9',
			value: 5
		    }]},

	    AVAR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADER',
			value: 1
		    },
		    {
			dst: 'AS1',
			value: 3
		    },
		    {
			dst: 'AS10',
			value: 2
		    },
		    {
			dst: 'AS11',
			value: 6
		    },
		    {
			dst: 'AS2',
			value: 2
		    },
		    {
			dst: 'AS3',
			value: 2
		    },
		    {
			dst: 'AS4',
			value: 1
		    },
		    {
			dst: 'AS5',
			value: 2
		    },
		    {
			dst: 'AS6',
			value: 3
		    },
		    {
			dst: 'AS7',
			value: 8
		    },
		    {
			dst: 'AS8',
			value: 9
		    },
		    {
			dst: 'AS9',
			value: 6
		    },
		    {
			dst: 'AVAL',
			value: 6
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 2
		    },
		    {
			dst: 'AVER',
			value: 2
		    },
		    {
			dst: 'DA1',
			value: 8
		    },
		    {
			dst: 'DA2',
			value: 4
		    },
		    {
			dst: 'DA3',
			value: 5
		    },
		    {
			dst: 'DA4',
			value: 8
		    },
		    {
			dst: 'DA5',
			value: 7
		    },
		    {
			dst: 'DA6',
			value: 13
		    },
		    {
			dst: 'DA7',
			value: 3
		    },
		    {
			dst: 'DA8',
			value: 9
		    },
		    {
			dst: 'DA9',
			value: 2
		    },
		    {
			dst: 'DB3',
			value: 1
		    },
		    {
			dst: 'DB5',
			value: 3
		    },
		    {
			dst: 'DB6',
			value: 5
		    },
		    {
			dst: 'LUAL',
			value: 1
		    },
		    {
			dst: 'LUAR',
			value: 3
		    },
		    {
			dst: 'PDEL',
			value: 1
		    },
		    {
			dst: 'PDER',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 7
		    },
		    {
			dst: 'PVCR',
			value: 8
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 2
		    },
		    {
			dst: 'RIMR',
			value: 1
		    },
		    {
			dst: 'SABD',
			value: 1
		    },
		    {
			dst: 'SABVL',
			value: 6
		    },
		    {
			dst: 'SABVR',
			value: 1
		    },
		    {
			dst: 'URYDR',
			value: 1
		    },
		    {
			dst: 'URYVL',
			value: 1
		    },
		    {
			dst: 'VA10',
			value: 5
		    },
		    {
			dst: 'VA11',
			value: 15
		    },
		    {
			dst: 'VA12',
			value: 1
		    },
		    {
			dst: 'VA2',
			value: 2
		    },
		    {
			dst: 'VA3',
			value: 7
		    },
		    {
			dst: 'VA4',
			value: 5
		    },
		    {
			dst: 'VA5',
			value: 4
		    },
		    {
			dst: 'VA6',
			value: 5
		    },
		    {
			dst: 'VA7',
			value: 4
		    },
		    {
			dst: 'VA8',
			value: 16
		    },
		    {
			dst: 'VB9',
			value: 10
		    },
		    {
			dst: 'VD13',
			value: 2
		    }]},

	    AVBL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AQR',
			value: 1
		    },
		    {
			dst: 'AS10',
			value: 1
		    },
		    {
			dst: 'AS3',
			value: 1
		    },
		    {
			dst: 'AS4',
			value: 1
		    },
		    {
			dst: 'AS5',
			value: 1
		    },
		    {
			dst: 'AS6',
			value: 1
		    },
		    {
			dst: 'AS7',
			value: 2
		    },
		    {
			dst: 'AS9',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 7
		    },
		    {
			dst: 'AVAR',
			value: 7
		    },
		    {
			dst: 'AVBR',
			value: 4
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 2
		    },
		    {
			dst: 'AVL',
			value: 1
		    },
		    {
			dst: 'DB3',
			value: 1
		    },
		    {
			dst: 'DB4',
			value: 1
		    },
		    {
			dst: 'DB5',
			value: 1
		    },
		    {
			dst: 'DB6',
			value: 2
		    },
		    {
			dst: 'DB7',
			value: 2
		    },
		    {
			dst: 'DVA',
			value: 1
		    },
		    {
			dst: 'PVNR',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RID',
			value: 1
		    },
		    {
			dst: 'SDQR',
			value: 1
		    },
		    {
			dst: 'SIBVL',
			value: 1
		    },
		    {
			dst: 'VA10',
			value: 1
		    },
		    {
			dst: 'VA2',
			value: 1
		    },
		    {
			dst: 'VA7',
			value: 1
		    },
		    {
			dst: 'VB1',
			value: 1
		    },
		    {
			dst: 'VB10',
			value: 2
		    },
		    {
			dst: 'VB11',
			value: 2
		    },
		    {
			dst: 'VB2',
			value: 4
		    },
		    {
			dst: 'VB4',
			value: 1
		    },
		    {
			dst: 'VB5',
			value: 1
		    },
		    {
			dst: 'VB6',
			value: 1
		    },
		    {
			dst: 'VB7',
			value: 2
		    },
		    {
			dst: 'VB8',
			value: 7
		    },
		    {
			dst: 'VB9',
			value: 1
		    },
		    {
			dst: 'VC3',
			value: 1
		    }]},

	    AVBR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS1',
			value: 1
		    },
		    {
			dst: 'AS10',
			value: 1
		    },
		    {
			dst: 'AS3',
			value: 1
		    },
		    {
			dst: 'AS4',
			value: 1
		    },
		    {
			dst: 'AS5',
			value: 1
		    },
		    {
			dst: 'AS6',
			value: 2
		    },
		    {
			dst: 'AS7',
			value: 3
		    },
		    {
			dst: 'AVAL',
			value: 6
		    },
		    {
			dst: 'AVAR',
			value: 7
		    },
		    {
			dst: 'AVBL',
			value: 4
		    },
		    {
			dst: 'DA5',
			value: 1
		    },
		    {
			dst: 'DB1',
			value: 3
		    },
		    {
			dst: 'DB2',
			value: 1
		    },
		    {
			dst: 'DB3',
			value: 1
		    },
		    {
			dst: 'DB4',
			value: 1
		    },
		    {
			dst: 'DB5',
			value: 1
		    },
		    {
			dst: 'DB6',
			value: 1
		    },
		    {
			dst: 'DB7',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 1
		    },
		    {
			dst: 'DVA',
			value: 1
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'PVNL',
			value: 2
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RID',
			value: 2
		    },
		    {
			dst: 'SIBVL',
			value: 1
		    },
		    {
			dst: 'VA4',
			value: 1
		    },
		    {
			dst: 'VA8',
			value: 1
		    },
		    {
			dst: 'VA9',
			value: 2
		    },
		    {
			dst: 'VB10',
			value: 1
		    },
		    {
			dst: 'VB11',
			value: 1
		    },
		    {
			dst: 'VB2',
			value: 1
		    },
		    {
			dst: 'VB3',
			value: 1
		    },
		    {
			dst: 'VB4',
			value: 1
		    },
		    {
			dst: 'VB6',
			value: 2
		    },
		    {
			dst: 'VB7',
			value: 2
		    },
		    {
			dst: 'VB8',
			value: 3
		    },
		    {
			dst: 'VB9',
			value: 6
		    },
		    {
			dst: 'VD10',
			value: 1
		    },
		    {
			dst: 'VD3',
			value: 1
		    }]},

	    AVDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 2
		    },
		    {
			dst: 'AS1',
			value: 1
		    },
		    {
			dst: 'AS10',
			value: 1
		    },
		    {
			dst: 'AS11',
			value: 2
		    },
		    {
			dst: 'AS4',
			value: 1
		    },
		    {
			dst: 'AS5',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 13
		    },
		    {
			dst: 'AVAR',
			value: 19
		    },
		    {
			dst: 'AVM',
			value: 2
		    },
		    {
			dst: 'DA1',
			value: 1
		    },
		    {
			dst: 'DA2',
			value: 1
		    },
		    {
			dst: 'DA3',
			value: 4
		    },
		    {
			dst: 'DA4',
			value: 1
		    },
		    {
			dst: 'DA5',
			value: 1
		    },
		    {
			dst: 'DA8',
			value: 1
		    },
		    {
			dst: 'FLPL',
			value: 1
		    },
		    {
			dst: 'FLPR',
			value: 1
		    },
		    {
			dst: 'LUAL',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'SABD',
			value: 1
		    },
		    {
			dst: 'SABVL',
			value: 1
		    },
		    {
			dst: 'SABVR',
			value: 1
		    },
		    {
			dst: 'VA5',
			value: 1
		    }]},

	    AVDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 2
		    },
		    {
			dst: 'ADLL',
			value: 1
		    },
		    {
			dst: 'AS10',
			value: 1
		    },
		    {
			dst: 'AS5',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 16
		    },
		    {
			dst: 'AVAR',
			value: 15
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVDL',
			value: 2
		    },
		    {
			dst: 'AVJL',
			value: 2
		    },
		    {
			dst: 'DA1',
			value: 2
		    },
		    {
			dst: 'DA2',
			value: 1
		    },
		    {
			dst: 'DA3',
			value: 1
		    },
		    {
			dst: 'DA4',
			value: 1
		    },
		    {
			dst: 'DA5',
			value: 2
		    },
		    {
			dst: 'DA8',
			value: 1
		    },
		    {
			dst: 'DA9',
			value: 1
		    },
		    {
			dst: 'DB4',
			value: 1
		    },
		    {
			dst: 'DVC',
			value: 1
		    },
		    {
			dst: 'FLPR',
			value: 1
		    },
		    {
			dst: 'LUAL',
			value: 2
		    },
		    {
			dst: 'PQR',
			value: 1
		    },
		    {
			dst: 'SABD',
			value: 1
		    },
		    {
			dst: 'SABVL',
			value: 3
		    },
		    {
			dst: 'SABVR',
			value: 1
		    },
		    {
			dst: 'VA11',
			value: 1
		    },
		    {
			dst: 'VA2',
			value: 1
		    },
		    {
			dst: 'VA3',
			value: 2
		    },
		    {
			dst: 'VA6',
			value: 1
		    }]},

	    AVEL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS1',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 12
		    },
		    {
			dst: 'AVAR',
			value: 7
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'DA1',
			value: 5
		    },
		    {
			dst: 'DA2',
			value: 1
		    },
		    {
			dst: 'DA3',
			value: 3
		    },
		    {
			dst: 'DA4',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 2
		    },
		    {
			dst: 'RIMR',
			value: 3
		    },
		    {
			dst: 'RMDVR',
			value: 1
		    },
		    {
			dst: 'RMEV',
			value: 1
		    },
		    {
			dst: 'SABD',
			value: 6
		    },
		    {
			dst: 'SABVL',
			value: 7
		    },
		    {
			dst: 'SABVR',
			value: 3
		    },
		    {
			dst: 'VA1',
			value: 5
		    },
		    {
			dst: 'VA3',
			value: 3
		    },
		    {
			dst: 'VD2',
			value: 1
		    },
		    {
			dst: 'VD3',
			value: 1
		    }]},

	    AVER: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS1',
			value: 3
		    },
		    {
			dst: 'AS2',
			value: 2
		    },
		    {
			dst: 'AS3',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 7
		    },
		    {
			dst: 'AVAR',
			value: 16
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'DA1',
			value: 5
		    },
		    {
			dst: 'DA2',
			value: 3
		    },
		    {
			dst: 'DA3',
			value: 1
		    },
		    {
			dst: 'DB3',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 3
		    },
		    {
			dst: 'RIMR',
			value: 2
		    },
		    {
			dst: 'RMDVL',
			value: 1
		    },
		    {
			dst: 'RMDVR',
			value: 1
		    },
		    {
			dst: 'RMEV',
			value: 1
		    },
		    {
			dst: 'SABD',
			value: 2
		    },
		    {
			dst: 'SABVL',
			value: 3
		    },
		    {
			dst: 'SABVR',
			value: 3
		    },
		    {
			dst: 'VA1',
			value: 1
		    },
		    {
			dst: 'VA2',
			value: 1
		    },
		    {
			dst: 'VA3',
			value: 2
		    },
		    {
			dst: 'VA4',
			value: 1
		    },
		    {
			dst: 'VA5',
			value: 1
		    }]},

	    AVFL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'AVFR',
			value: 30
		    },
		    {
			dst: 'AVG',
			value: 1
		    },
		    {
			dst: 'AVHL',
			value: 4
		    },
		    {
			dst: 'AVHR',
			value: 7
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AVJR',
			value: 1
		    },
		    {
			dst: 'AVL',
			value: 1
		    },
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'MVL11',
			value: 1
		    },
		    {
			dst: 'MVL12',
			value: 1
		    },
		    {
			dst: 'PDER',
			value: 1
		    },
		    {
			dst: 'PVNL',
			value: 2
		    },
		    {
			dst: 'PVQL',
			value: 1
		    },
		    {
			dst: 'PVQR',
			value: 2
		    },
		    {
			dst: 'VB1',
			value: 1
		    }]},

	    AVFR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ASJL',
			value: 1
		    },
		    {
			dst: 'ASKL',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 5
		    },
		    {
			dst: 'AVFL',
			value: 24
		    },
		    {
			dst: 'AVHL',
			value: 4
		    },
		    {
			dst: 'AVHR',
			value: 2
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AVJR',
			value: 1
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'MVL14',
			value: 2
		    },
		    {
			dst: 'MVR14',
			value: 2
		    },
		    {
			dst: 'PVQL',
			value: 1
		    },
		    {
			dst: 'VC4',
			value: 1
		    },
		    {
			dst: 'VD11',
			value: 1
		    }]},

	    AVG: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 3
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'AVFL',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AVL',
			value: 1
		    },
		    {
			dst: 'DA8',
			value: 1
		    },
		    {
			dst: 'PHAL',
			value: 2
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'PVNR',
			value: 1
		    },
		    {
			dst: 'PVPR',
			value: 1
		    },
		    {
			dst: 'PVQR',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'RIFL',
			value: 1
		    },
		    {
			dst: 'RIFR',
			value: 1
		    },
		    {
			dst: 'VA11',
			value: 1
		    }]},

	    AVHL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADFR',
			value: 3
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVFL',
			value: 1
		    },
		    {
			dst: 'AVFL',
			value: 2
		    },
		    {
			dst: 'AVFR',
			value: 5
		    },
		    {
			dst: 'AVHR',
			value: 2
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AWBR',
			value: 1
		    },
		    {
			dst: 'PHBR',
			value: 1
		    },
		    {
			dst: 'PVPR',
			value: 2
		    },
		    {
			dst: 'PVQL',
			value: 1
		    },
		    {
			dst: 'PVQR',
			value: 2
		    },
		    {
			dst: 'RIMR',
			value: 1
		    },
		    {
			dst: 'RIR',
			value: 3
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    },
		    {
			dst: 'SMBVR',
			value: 1
		    },
		    {
			dst: 'VD1',
			value: 1
		    }]},

	    AVHR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADLL',
			value: 1
		    },
		    {
			dst: 'ADLR',
			value: 2
		    },
		    {
			dst: 'AQR',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVFL',
			value: 1
		    },
		    {
			dst: 'AVFR',
			value: 2
		    },
		    {
			dst: 'AVHL',
			value: 2
		    },
		    {
			dst: 'AVJR',
			value: 4
		    },
		    {
			dst: 'PVNL',
			value: 1
		    },
		    {
			dst: 'PVPL',
			value: 3
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RIR',
			value: 4
		    },
		    {
			dst: 'SMBDL',
			value: 1
		    },
		    {
			dst: 'SMBVL',
			value: 1
		    }]},

	    AVJL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 4
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVFR',
			value: 1
		    },
		    {
			dst: 'AVHL',
			value: 2
		    },
		    {
			dst: 'AVJR',
			value: 4
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'PLMR',
			value: 2
		    },
		    {
			dst: 'PVCL',
			value: 2
		    },
		    {
			dst: 'PVCR',
			value: 5
		    },
		    {
			dst: 'PVNR',
			value: 1
		    },
		    {
			dst: 'RIFR',
			value: 1
		    },
		    {
			dst: 'RIS',
			value: 2
		    }]},

	    AVJR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 3
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 3
		    },
		    {
			dst: 'AVER',
			value: 3
		    },
		    {
			dst: 'AVJL',
			value: 5
		    },
		    {
			dst: 'PVCL',
			value: 3
		    },
		    {
			dst: 'PVCR',
			value: 4
		    },
		    {
			dst: 'PVQR',
			value: 1
		    },
		    {
			dst: 'SABVL',
			value: 1
		    }]},

	    AVKL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADER',
			value: 1
		    },
		    {
			dst: 'AQR',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 2
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'AVKR',
			value: 2
		    },
		    {
			dst: 'AVM',
			value: 1
		    },
		    {
			dst: 'DVA',
			value: 1
		    },
		    {
			dst: 'PDEL',
			value: 3
		    },
		    {
			dst: 'PDER',
			value: 1
		    },
		    {
			dst: 'PVM',
			value: 1
		    },
		    {
			dst: 'PVPL',
			value: 1
		    },
		    {
			dst: 'PVPR',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 2
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RICR',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 2
		    },
		    {
			dst: 'RIMR',
			value: 1
		    },
		    {
			dst: 'RMFR',
			value: 1
		    },
		    {
			dst: 'SAADR',
			value: 1
		    },
		    {
			dst: 'SIAVR',
			value: 1
		    },
		    {
			dst: 'SMBDL',
			value: 1
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    },
		    {
			dst: 'SMBVR',
			value: 1
		    },
		    {
			dst: 'SMDDR',
			value: 1
		    },
		    {
			dst: 'VB1',
			value: 4
		    },
		    {
			dst: 'VB10',
			value: 1
		    }]},

	    AVKR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADEL',
			value: 1
		    },
		    {
			dst: 'AQR',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 2
		    },
		    {
			dst: 'BDUL',
			value: 1
		    },
		    {
			dst: 'MVL10',
			value: 1
		    },
		    {
			dst: 'PVPL',
			value: 6
		    },
		    {
			dst: 'PVQL',
			value: 1
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 2
		    },
		    {
			dst: 'RIMR',
			value: 2
		    },
		    {
			dst: 'RMDR',
			value: 1
		    },
		    {
			dst: 'RMFL',
			value: 1
		    },
		    {
			dst: 'SAADL',
			value: 1
		    },
		    {
			dst: 'SMBDL',
			value: 1
		    },
		    {
			dst: 'SMBDL',
			value: 1
		    },
		    {
			dst: 'SMBDR',
			value: 2
		    },
		    {
			dst: 'SMBVR',
			value: 1
		    },
		    {
			dst: 'SMDDL',
			value: 1
		    },
		    {
			dst: 'SMDDR',
			value: 2
		    }]},

	    AVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVFR',
			value: 1
		    },
		    {
			dst: 'DA2',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 1
		    },
		    {
			dst: 'DD6',
			value: 2
		    },
		    {
			dst: 'DVB',
			value: 1
		    },
		    {
			dst: 'DVC',
			value: 9
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'MVL10',
			value: -5
		    },
		    {
			dst: 'MVR10',
			value: -5
		    },
		    {
			dst: 'PVM',
			value: 1
		    },
		    {
			dst: 'PVPR',
			value: 1
		    },
		    {
			dst: 'PVWL',
			value: 1
		    },
		    {
			dst: 'SABD',
			value: 5
		    },
		    {
			dst: 'SABVL',
			value: 4
		    },
		    {
			dst: 'SABVR',
			value: 3
		    },
		    {
			dst: 'VD12',
			value: 4
		    }]},

	    AVM: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADER',
			value: 1
		    },
		    {
			dst: 'ALML',
			value: 1
		    },
		    {
			dst: 'ALMR',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 6
		    },
		    {
			dst: 'AVBR',
			value: 6
		    },
		    {
			dst: 'AVDL',
			value: 2
		    },
		    {
			dst: 'AVJR',
			value: 1
		    },
		    {
			dst: 'BDUL',
			value: 3
		    },
		    {
			dst: 'BDUR',
			value: 2
		    },
		    {
			dst: 'DA1',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 4
		    },
		    {
			dst: 'PVCR',
			value: 5
		    },
		    {
			dst: 'PVNL',
			value: 1
		    },
		    {
			dst: 'PVR',
			value: 3
		    },
		    {
			dst: 'RID',
			value: 1
		    },
		    {
			dst: 'SIBVL',
			value: 1
		    },
		    {
			dst: 'VA1',
			value: 2
		    }]},

	    AWAL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 1
		    },
		    {
			dst: 'AFDL',
			value: 5
		    },
		    {
			dst: 'AIAL',
			value: 1
		    },
		    {
			dst: 'AIYL',
			value: 1
		    },
		    {
			dst: 'AIZL',
			value: 10
		    },
		    {
			dst: 'ASEL',
			value: 4
		    },
		    {
			dst: 'ASGL',
			value: 1
		    },
		    {
			dst: 'AWAR',
			value: 1
		    },
		    {
			dst: 'AWBL',
			value: 1
		    }]},

	    AWAR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADFR',
			value: 3
		    },
		    {
			dst: 'AFDR',
			value: 7
		    },
		    {
			dst: 'AIAR',
			value: 1
		    },
		    {
			dst: 'AIYR',
			value: 2
		    },
		    {
			dst: 'AIZR',
			value: 7
		    },
		    {
			dst: 'AIZR',
			value: 1
		    },
		    {
			dst: 'ASEL',
			value: 1
		    },
		    {
			dst: 'ASER',
			value: 2
		    },
		    {
			dst: 'AUAR',
			value: 1
		    },
		    {
			dst: 'AWAL',
			value: 1
		    },
		    {
			dst: 'AWBR',
			value: 1
		    },
		    {
			dst: 'RIFR',
			value: 2
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RIR',
			value: 2
		    }]},

	    AWBL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADFL',
			value: 9
		    },
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AIZL',
			value: 9
		    },
		    {
			dst: 'AUAL',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AWBR',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 3
		    },
		    {
			dst: 'RMGL',
			value: 1
		    },
		    {
			dst: 'SMBDL',
			value: 1
		    }]},

	    AWBR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADFR',
			value: 4
		    },
		    {
			dst: 'AIZR',
			value: 4
		    },
		    {
			dst: 'ASGR',
			value: 1
		    },
		    {
			dst: 'ASHR',
			value: 2
		    },
		    {
			dst: 'AUAR',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'AWBL',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 1
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RIR',
			value: 2
		    },
		    {
			dst: 'RMGR',
			value: 1
		    },
		    {
			dst: 'SMBVR',
			value: 1
		    }]},

	    AWCL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAL',
			value: 2
		    },
		    {
			dst: 'AIAR',
			value: 4
		    },
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AIYL',
			value: 10
		    },
		    {
			dst: 'ASEL',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AWCR',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 3
		    }]},

	    AWCR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAR',
			value: 1
		    },
		    {
			dst: 'AIBR',
			value: 4
		    },
		    {
			dst: 'AIYL',
			value: 4
		    },
		    {
			dst: 'AIYR',
			value: 9
		    },
		    {
			dst: 'ASEL',
			value: 1
		    },
		    {
			dst: 'ASGR',
			value: 1
		    },
		    {
			dst: 'AWCL',
			value: 5
		    }]},

	    BAGL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 4
		    },
		    {
			dst: 'BAGR',
			value: 1
		    },
		    {
			dst: 'BAGR',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 5
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 7
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RIGR',
			value: 4
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RIR',
			value: 1
		    }]},

	    BAGR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIYL',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 2
		    },
		    {
			dst: 'BAGL',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 5
		    },
		    {
			dst: 'RIBL',
			value: 4
		    },
		    {
			dst: 'RIGL',
			value: 5
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RIR',
			value: 1
		    }]},

	    BDUL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADEL',
			value: 3
		    },
		    {
			dst: 'AVHL',
			value: 1
		    },
		    {
			dst: 'AVJR',
			value: 1
		    },
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'PVNL',
			value: 2
		    },
		    {
			dst: 'PVNR',
			value: 2
		    },
		    {
			dst: 'SAADL',
			value: 1
		    },
		    {
			dst: 'URADL',
			value: 1
		    }]},

	    BDUR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADER',
			value: 1
		    },
		    {
			dst: 'ALMR',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 3
		    },
		    {
			dst: 'AVHL',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 2
		    },
		    {
			dst: 'HSNR',
			value: 4
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'PVNL',
			value: 2
		    },
		    {
			dst: 'PVNR',
			value: 1
		    },
		    {
			dst: 'SDQL',
			value: 1
		    },
		    {
			dst: 'URADR',
			value: 1
		    }]},

	    CEPDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVER',
			value: 5
		    },
		    {
			dst: 'IL1DL',
			value: 4
		    },
		    {
			dst: 'OLLL',
			value: 2
		    },
		    {
			dst: 'OLQDL',
			value: 6
		    },
		    {
			dst: 'OLQDL',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 2
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RICR',
			value: 2
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 2
		    },
		    {
			dst: 'RIS',
			value: 1
		    },
		    {
			dst: 'RMDVL',
			value: 3
		    },
		    {
			dst: 'RMGL',
			value: 4
		    },
		    {
			dst: 'RMHR',
			value: 4
		    },
		    {
			dst: 'SIADR',
			value: 1
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    },
		    {
			dst: 'URADL',
			value: 2
		    },
		    {
			dst: 'URBL',
			value: 4
		    },
		    {
			dst: 'URYDL',
			value: 2
		    }]},

	    CEPDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVEL',
			value: 6
		    },
		    {
			dst: 'BDUR',
			value: 1
		    },
		    {
			dst: 'IL1DR',
			value: 5
		    },
		    {
			dst: 'IL1R',
			value: 1
		    },
		    {
			dst: 'OLLR',
			value: 8
		    },
		    {
			dst: 'OLQDR',
			value: 5
		    },
		    {
			dst: 'OLQDR',
			value: 2
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RICL',
			value: 4
		    },
		    {
			dst: 'RICR',
			value: 3
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'RIS',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 1
		    },
		    {
			dst: 'RMDVR',
			value: 2
		    },
		    {
			dst: 'RMGR',
			value: 1
		    },
		    {
			dst: 'RMHL',
			value: 4
		    },
		    {
			dst: 'RMHR',
			value: 1
		    },
		    {
			dst: 'SIADL',
			value: 1
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    },
		    {
			dst: 'URADR',
			value: 1
		    },
		    {
			dst: 'URBR',
			value: 2
		    },
		    {
			dst: 'URYDR',
			value: 1
		    }]},

	    CEPVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADLL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 3
		    },
		    {
			dst: 'IL1VL',
			value: 2
		    },
		    {
			dst: 'MVL03',
			value: 1
		    },
		    {
			dst: 'OLLL',
			value: 4
		    },
		    {
			dst: 'OLQVL',
			value: 6
		    },
		    {
			dst: 'OLQVL',
			value: 1
		    },
		    {
			dst: 'RICL',
			value: 7
		    },
		    {
			dst: 'RICR',
			value: 4
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 4
		    },
		    {
			dst: 'RMHL',
			value: 1
		    },
		    {
			dst: 'SIAVL',
			value: 1
		    },
		    {
			dst: 'URAVL',
			value: 2
		    }]},

	    CEPVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ASGR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 5
		    },
		    {
			dst: 'IL1VR',
			value: 1
		    },
		    {
			dst: 'IL2VR',
			value: 2
		    },
		    {
			dst: 'MVR04',
			value: 1
		    },
		    {
			dst: 'OLLR',
			value: 7
		    },
		    {
			dst: 'OLQVR',
			value: 3
		    },
		    {
			dst: 'OLQVR',
			value: 1
		    },
		    {
			dst: 'RICL',
			value: 2
		    },
		    {
			dst: 'RICR',
			value: 2
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'RIPR',
			value: 1
		    },
		    {
			dst: 'RIVL',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 2
		    },
		    {
			dst: 'RMHR',
			value: 2
		    },
		    {
			dst: 'SIAVR',
			value: 2
		    },
		    {
			dst: 'URAVR',
			value: 1
		    }]},

	    DA1: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVAR',
			value: 6
		    },
		    {
			dst: 'DA4',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 4
		    },
		    {
			dst: 'MDL08',
			value: 8
		    },
		    {
			dst: 'MDR08',
			value: 8
		    },
		    {
			dst: 'SABVL',
			value: 2
		    },
		    {
			dst: 'SABVR',
			value: 3
		    },
		    {
			dst: 'VD1',
			value: 17
		    },
		    {
			dst: 'VD2',
			value: 1
		    }]},

	    DA2: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS2',
			value: 1
		    },
		    {
			dst: 'AS2',
			value: 1
		    },
		    {
			dst: 'AS3',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'DD1',
			value: 1
		    },
		    {
			dst: 'MDL07',
			value: 2
		    },
		    {
			dst: 'MDL08',
			value: 1
		    },
		    {
			dst: 'MDL09',
			value: 2
		    },
		    {
			dst: 'MDL10',
			value: 2
		    },
		    {
			dst: 'MDR07',
			value: 2
		    },
		    {
			dst: 'MDR08',
			value: 2
		    },
		    {
			dst: 'MDR09',
			value: 2
		    },
		    {
			dst: 'MDR10',
			value: 2
		    },
		    {
			dst: 'SABVL',
			value: 1
		    },
		    {
			dst: 'VA1',
			value: 2
		    },
		    {
			dst: 'VD1',
			value: 2
		    },
		    {
			dst: 'VD2',
			value: 11
		    },
		    {
			dst: 'VD3',
			value: 5
		    }]},

	    DA3: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS4',
			value: 2
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'DA4',
			value: 2
		    },
		    {
			dst: 'DB3',
			value: 1
		    },
		    {
			dst: 'DD2',
			value: 1
		    },
		    {
			dst: 'MDL09',
			value: 5
		    },
		    {
			dst: 'MDL10',
			value: 5
		    },
		    {
			dst: 'MDL12',
			value: 5
		    },
		    {
			dst: 'MDR09',
			value: 5
		    },
		    {
			dst: 'MDR10',
			value: 5
		    },
		    {
			dst: 'MDR12',
			value: 5
		    },
		    {
			dst: 'VD3',
			value: 25
		    },
		    {
			dst: 'VD4',
			value: 6
		    }]},

	    DA4: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 3
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'DA1',
			value: 1
		    },
		    {
			dst: 'DA3',
			value: 1
		    },
		    {
			dst: 'DB3',
			value: 1
		    },
		    {
			dst: 'DB3',
			value: 1
		    },
		    {
			dst: 'DD2',
			value: 1
		    },
		    {
			dst: 'MDL11',
			value: 4
		    },
		    {
			dst: 'MDL12',
			value: 4
		    },
		    {
			dst: 'MDL14',
			value: 5
		    },
		    {
			dst: 'MDR11',
			value: 4
		    },
		    {
			dst: 'MDR12',
			value: 4
		    },
		    {
			dst: 'MDR14',
			value: 5
		    },
		    {
			dst: 'VB6',
			value: 1
		    },
		    {
			dst: 'VD4',
			value: 12
		    },
		    {
			dst: 'VD5',
			value: 15
		    }]},

	    DA5: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS6',
			value: 2
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 5
		    },
		    {
			dst: 'DB4',
			value: 1
		    },
		    {
			dst: 'MDL13',
			value: 5
		    },
		    {
			dst: 'MDL14',
			value: 4
		    },
		    {
			dst: 'MDR13',
			value: 5
		    },
		    {
			dst: 'MDR14',
			value: 4
		    },
		    {
			dst: 'VA4',
			value: 1
		    },
		    {
			dst: 'VA5',
			value: 2
		    },
		    {
			dst: 'VD5',
			value: 1
		    },
		    {
			dst: 'VD6',
			value: 16
		    }]},

	    DA6: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 10
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'MDL11',
			value: 6
		    },
		    {
			dst: 'MDL12',
			value: 4
		    },
		    {
			dst: 'MDL13',
			value: 4
		    },
		    {
			dst: 'MDL14',
			value: 4
		    },
		    {
			dst: 'MDL16',
			value: 4
		    },
		    {
			dst: 'MDR11',
			value: 4
		    },
		    {
			dst: 'MDR12',
			value: 4
		    },
		    {
			dst: 'MDR13',
			value: 4
		    },
		    {
			dst: 'MDR14',
			value: 4
		    },
		    {
			dst: 'MDR16',
			value: 4
		    },
		    {
			dst: 'VD4',
			value: 4
		    },
		    {
			dst: 'VD5',
			value: 3
		    },
		    {
			dst: 'VD6',
			value: 3
		    }]},

	    DA7: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'MDL15',
			value: 4
		    },
		    {
			dst: 'MDL17',
			value: 4
		    },
		    {
			dst: 'MDL18',
			value: 4
		    },
		    {
			dst: 'MDR15',
			value: 4
		    },
		    {
			dst: 'MDR17',
			value: 4
		    },
		    {
			dst: 'MDR18',
			value: 4
		    }]},

	    DA8: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'DA9',
			value: 1
		    },
		    {
			dst: 'MDL17',
			value: 4
		    },
		    {
			dst: 'MDL19',
			value: 4
		    },
		    {
			dst: 'MDL20',
			value: 4
		    },
		    {
			dst: 'MDR17',
			value: 4
		    },
		    {
			dst: 'MDR19',
			value: 4
		    },
		    {
			dst: 'MDR20',
			value: 4
		    }]},

	    DA9: {
		value: [0, 0],
		edges: [
		    {
			dst: 'DA8',
			value: 1
		    },
		    {
			dst: 'DD6',
			value: 1
		    },
		    {
			dst: 'MDL19',
			value: 4
		    },
		    {
			dst: 'MDL21',
			value: 4
		    },
		    {
			dst: 'MDL22',
			value: 4
		    },
		    {
			dst: 'MDL23',
			value: 4
		    },
		    {
			dst: 'MDL24',
			value: 4
		    },
		    {
			dst: 'MDR19',
			value: 4
		    },
		    {
			dst: 'MDR21',
			value: 4
		    },
		    {
			dst: 'MDR22',
			value: 4
		    },
		    {
			dst: 'MDR23',
			value: 4
		    },
		    {
			dst: 'MDR24',
			value: 4
		    },
		    {
			dst: 'PDA',
			value: 1
		    },
		    {
			dst: 'PHCL',
			value: 1
		    },
		    {
			dst: 'RID',
			value: 1
		    },
		    {
			dst: 'VD13',
			value: 1
		    }]},

	    DB1: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AS1',
			value: 1
		    },
		    {
			dst: 'AS2',
			value: 1
		    },
		    {
			dst: 'AS3',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 3
		    },
		    {
			dst: 'DB2',
			value: 1
		    },
		    {
			dst: 'DB4',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 10
		    },
		    {
			dst: 'DVA',
			value: 1
		    },
		    {
			dst: 'MDL07',
			value: 1
		    },
		    {
			dst: 'MDL08',
			value: 1
		    },
		    {
			dst: 'MDR07',
			value: 1
		    },
		    {
			dst: 'MDR08',
			value: 1
		    },
		    {
			dst: 'RID',
			value: 1
		    },
		    {
			dst: 'RIS',
			value: 1
		    },
		    {
			dst: 'VB3',
			value: 1
		    },
		    {
			dst: 'VB4',
			value: 1
		    },
		    {
			dst: 'VD1',
			value: 21
		    },
		    {
			dst: 'VD2',
			value: 15
		    },
		    {
			dst: 'VD3',
			value: 1
		    }]},

	    DB2: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DA3',
			value: 5
		    },
		    {
			dst: 'DB1',
			value: 1
		    },
		    {
			dst: 'DB3',
			value: 6
		    },
		    {
			dst: 'DD2',
			value: 3
		    },
		    {
			dst: 'MDL09',
			value: 3
		    },
		    {
			dst: 'MDL10',
			value: 3
		    },
		    {
			dst: 'MDL11',
			value: 3
		    },
		    {
			dst: 'MDL12',
			value: 3
		    },
		    {
			dst: 'MDR09',
			value: 3
		    },
		    {
			dst: 'MDR10',
			value: 3
		    },
		    {
			dst: 'MDR11',
			value: 3
		    },
		    {
			dst: 'MDR12',
			value: 3
		    },
		    {
			dst: 'VB1',
			value: 2
		    },
		    {
			dst: 'VD3',
			value: 23
		    },
		    {
			dst: 'VD4',
			value: 14
		    },
		    {
			dst: 'VD5',
			value: 1
		    }]},

	    DB3: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS4',
			value: 1
		    },
		    {
			dst: 'AS5',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DA4',
			value: 1
		    },
		    {
			dst: 'DB2',
			value: 6
		    },
		    {
			dst: 'DB4',
			value: 1
		    },
		    {
			dst: 'DD2',
			value: 4
		    },
		    {
			dst: 'DD3',
			value: 10
		    },
		    {
			dst: 'MDL11',
			value: 3
		    },
		    {
			dst: 'MDL12',
			value: 3
		    },
		    {
			dst: 'MDL13',
			value: 4
		    },
		    {
			dst: 'MDL14',
			value: 3
		    },
		    {
			dst: 'MDR11',
			value: 3
		    },
		    {
			dst: 'MDR12',
			value: 3
		    },
		    {
			dst: 'MDR13',
			value: 4
		    },
		    {
			dst: 'MDR14',
			value: 3
		    },
		    {
			dst: 'VD4',
			value: 9
		    },
		    {
			dst: 'VD5',
			value: 26
		    },
		    {
			dst: 'VD6',
			value: 7
		    }]},

	    DB4: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DB1',
			value: 1
		    },
		    {
			dst: 'DB3',
			value: 1
		    },
		    {
			dst: 'DD3',
			value: 3
		    },
		    {
			dst: 'MDL13',
			value: 2
		    },
		    {
			dst: 'MDL14',
			value: 2
		    },
		    {
			dst: 'MDL16',
			value: 2
		    },
		    {
			dst: 'MDR13',
			value: 2
		    },
		    {
			dst: 'MDR14',
			value: 2
		    },
		    {
			dst: 'MDR16',
			value: 2
		    },
		    {
			dst: 'VB2',
			value: 1
		    },
		    {
			dst: 'VB4',
			value: 1
		    },
		    {
			dst: 'VD6',
			value: 13
		    }]},

	    DB5: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'MDL15',
			value: 2
		    },
		    {
			dst: 'MDL17',
			value: 2
		    },
		    {
			dst: 'MDL18',
			value: 2
		    },
		    {
			dst: 'MDR15',
			value: 2
		    },
		    {
			dst: 'MDR17',
			value: 2
		    },
		    {
			dst: 'MDR18',
			value: 2
		    }]},

	    DB6: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 3
		    },
		    {
			dst: 'AVBL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'MDL17',
			value: 2
		    },
		    {
			dst: 'MDL19',
			value: 2
		    },
		    {
			dst: 'MDL20',
			value: 2
		    },
		    {
			dst: 'MDR17',
			value: 2
		    },
		    {
			dst: 'MDR19',
			value: 2
		    },
		    {
			dst: 'MDR20',
			value: 2
		    }]},

	    DB7: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'MDL19',
			value: 2
		    },
		    {
			dst: 'MDL21',
			value: 2
		    },
		    {
			dst: 'MDL22',
			value: 2
		    },
		    {
			dst: 'MDL23',
			value: 2
		    },
		    {
			dst: 'MDL24',
			value: 2
		    },
		    {
			dst: 'MDR19',
			value: 2
		    },
		    {
			dst: 'MDR21',
			value: 2
		    },
		    {
			dst: 'MDR22',
			value: 2
		    },
		    {
			dst: 'MDR23',
			value: 2
		    },
		    {
			dst: 'MDR24',
			value: 2
		    },
		    {
			dst: 'VD13',
			value: 2
		    }]},

	    DD1: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DD2',
			value: 3
		    },
		    {
			dst: 'MDL07',
			value: -6
		    },
		    {
			dst: 'MDL08',
			value: -6
		    },
		    {
			dst: 'MDL09',
			value: -7
		    },
		    {
			dst: 'MDL10',
			value: -6
		    },
		    {
			dst: 'MDR07',
			value: -6
		    },
		    {
			dst: 'MDR08',
			value: -6
		    },
		    {
			dst: 'MDR09',
			value: -7
		    },
		    {
			dst: 'MDR10',
			value: -6
		    },
		    {
			dst: 'VD1',
			value: 4
		    },
		    {
			dst: 'VD2',
			value: 1
		    },
		    {
			dst: 'VD2',
			value: 2
		    }]},

	    DD2: {
		value: [0, 0],
		edges: [
		    {
			dst: 'DA3',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 1
		    },
		    {
			dst: 'DD3',
			value: 2
		    },
		    {
			dst: 'MDL09',
			value: -6
		    },
		    {
			dst: 'MDL11',
			value: -7
		    },
		    {
			dst: 'MDL12',
			value: -6
		    },
		    {
			dst: 'MDR09',
			value: -6
		    },
		    {
			dst: 'MDR11',
			value: -7
		    },
		    {
			dst: 'MDR12',
			value: -6
		    },
		    {
			dst: 'VD3',
			value: 1
		    },
		    {
			dst: 'VD4',
			value: 3
		    }]},

	    DD3: {
		value: [0, 0],
		edges: [
		    {
			dst: 'DD2',
			value: 2
		    },
		    {
			dst: 'DD4',
			value: 1
		    },
		    {
			dst: 'MDL11',
			value: -7
		    },
		    {
			dst: 'MDL13',
			value: -9
		    },
		    {
			dst: 'MDL14',
			value: -7
		    },
		    {
			dst: 'MDR11',
			value: -7
		    },
		    {
			dst: 'MDR13',
			value: -9
		    },
		    {
			dst: 'MDR14',
			value: -7
		    }]},

	    DD4: {
		value: [0, 0],
		edges: [
		    {
			dst: 'DD3',
			value: 1
		    },
		    {
			dst: 'MDL13',
			value: -7
		    },
		    {
			dst: 'MDL15',
			value: -7
		    },
		    {
			dst: 'MDL16',
			value: -7
		    },
		    {
			dst: 'MDR13',
			value: -7
		    },
		    {
			dst: 'MDR15',
			value: -7
		    },
		    {
			dst: 'MDR16',
			value: -7
		    },
		    {
			dst: 'VC3',
			value: 1
		    },
		    {
			dst: 'VD8',
			value: 1
		    }]},

	    DD5: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDL17',
			value: -7
		    },
		    {
			dst: 'MDL18',
			value: -7
		    },
		    {
			dst: 'MDL20',
			value: -7
		    },
		    {
			dst: 'MDR17',
			value: -7
		    },
		    {
			dst: 'MDR18',
			value: -7
		    },
		    {
			dst: 'MDR20',
			value: -7
		    },
		    {
			dst: 'VB8',
			value: 1
		    },
		    {
			dst: 'VD10',
			value: 1
		    },
		    {
			dst: 'VD9',
			value: 1
		    }]},

	    DD6: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDL19',
			value: -7
		    },
		    {
			dst: 'MDL21',
			value: -7
		    },
		    {
			dst: 'MDL22',
			value: -7
		    },
		    {
			dst: 'MDL23',
			value: -7
		    },
		    {
			dst: 'MDL24',
			value: -7
		    },
		    {
			dst: 'MDR19',
			value: -7
		    },
		    {
			dst: 'MDR21',
			value: -7
		    },
		    {
			dst: 'MDR22',
			value: -7
		    },
		    {
			dst: 'MDR23',
			value: -7
		    },
		    {
			dst: 'MDR24',
			value: -7
		    }]},

	    DVA: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIZL',
			value: 3
		    },
		    {
			dst: 'AQR',
			value: 4
		    },
		    {
			dst: 'AUAL',
			value: 1
		    },
		    {
			dst: 'AUAR',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 3
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 9
		    },
		    {
			dst: 'AVER',
			value: 5
		    },
		    {
			dst: 'DB1',
			value: 1
		    },
		    {
			dst: 'DB2',
			value: 1
		    },
		    {
			dst: 'DB3',
			value: 2
		    },
		    {
			dst: 'DB4',
			value: 1
		    },
		    {
			dst: 'DB5',
			value: 1
		    },
		    {
			dst: 'DB6',
			value: 2
		    },
		    {
			dst: 'DB7',
			value: 1
		    },
		    {
			dst: 'PDEL',
			value: 3
		    },
		    {
			dst: 'PVCL',
			value: 3
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'PVR',
			value: 3
		    },
		    {
			dst: 'PVR',
			value: 2
		    },
		    {
			dst: 'RIAL',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 1
		    },
		    {
			dst: 'RIMR',
			value: 1
		    },
		    {
			dst: 'RIR',
			value: 3
		    },
		    {
			dst: 'SAADR',
			value: 1
		    },
		    {
			dst: 'SAAVL',
			value: 1
		    },
		    {
			dst: 'SAAVR',
			value: 1
		    },
		    {
			dst: 'SABD',
			value: 1
		    },
		    {
			dst: 'SMBDL',
			value: 3
		    },
		    {
			dst: 'SMBDR',
			value: 2
		    },
		    {
			dst: 'SMBVL',
			value: 3
		    },
		    {
			dst: 'SMBVR',
			value: 2
		    },
		    {
			dst: 'VA12',
			value: 1
		    },
		    {
			dst: 'VA2',
			value: 1
		    },
		    {
			dst: 'VB1',
			value: 1
		    },
		    {
			dst: 'VB11',
			value: 2
		    }]},

	    DVB: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS9',
			value: 7
		    },
		    {
			dst: 'AVL',
			value: 5
		    },
		    {
			dst: 'AVL',
			value: 1
		    },
		    {
			dst: 'DA8',
			value: 2
		    },
		    {
			dst: 'DD6',
			value: 3
		    },
		    {
			dst: 'DVC',
			value: 3
		    },
		    {
			dst: 'PDA',
			value: 1
		    },
		    {
			dst: 'PHCL',
			value: 1
		    },
		    {
			dst: 'PVPL',
			value: 1
		    },
		    {
			dst: 'VA9',
			value: 1
		    },
		    {
			dst: 'VB9',
			value: 1
		    }]},

	    DVC: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBL',
			value: 2
		    },
		    {
			dst: 'AIBR',
			value: 5
		    },
		    {
			dst: 'AVAL',
			value: 5
		    },
		    {
			dst: 'AVAR',
			value: 7
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 2
		    },
		    {
			dst: 'AVKR',
			value: 1
		    },
		    {
			dst: 'AVL',
			value: 9
		    },
		    {
			dst: 'PVPL',
			value: 2
		    },
		    {
			dst: 'PVPR',
			value: 13
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 5
		    },
		    {
			dst: 'RIGR',
			value: 5
		    },
		    {
			dst: 'RMFL',
			value: 2
		    },
		    {
			dst: 'RMFR',
			value: 4
		    },
		    {
			dst: 'VA9',
			value: 1
		    },
		    {
			dst: 'VD1',
			value: 5
		    },
		    {
			dst: 'VD10',
			value: 4
		    }]},

	    FLPL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADEL',
			value: 2
		    },
		    {
			dst: 'ADER',
			value: 2
		    },
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AIBR',
			value: 2
		    },
		    {
			dst: 'AVAL',
			value: 15
		    },
		    {
			dst: 'AVAR',
			value: 17
		    },
		    {
			dst: 'AVBL',
			value: 4
		    },
		    {
			dst: 'AVBR',
			value: 5
		    },
		    {
			dst: 'AVDL',
			value: 7
		    },
		    {
			dst: 'AVDR',
			value: 13
		    },
		    {
			dst: 'DVA',
			value: 1
		    },
		    {
			dst: 'FLPR',
			value: 3
		    },
		    {
			dst: 'RIH',
			value: 1
		    }]},

	    FLPR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADER',
			value: 1
		    },
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 12
		    },
		    {
			dst: 'AVAR',
			value: 5
		    },
		    {
			dst: 'AVBL',
			value: 5
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVDL',
			value: 10
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 4
		    },
		    {
			dst: 'AVER',
			value: 2
		    },
		    {
			dst: 'AVJR',
			value: 1
		    },
		    {
			dst: 'DVA',
			value: 1
		    },
		    {
			dst: 'FLPL',
			value: 4
		    },
		    {
			dst: 'PVCL',
			value: 2
		    },
		    {
			dst: 'VB1',
			value: 1
		    }]},

	    HSNL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIAL',
			value: 1
		    },
		    {
			dst: 'AIZL',
			value: 2
		    },
		    {
			dst: 'AIZR',
			value: 1
		    },
		    {
			dst: 'ASHL',
			value: 1
		    },
		    {
			dst: 'ASHR',
			value: 2
		    },
		    {
			dst: 'ASJR',
			value: 1
		    },
		    {
			dst: 'ASKL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVFL',
			value: 6
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AWBL',
			value: 1
		    },
		    {
			dst: 'AWBR',
			value: 2
		    },
		    {
			dst: 'HSNR',
			value: 3
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'MVULVA',
			value: 7
		    },
		    {
			dst: 'RIFL',
			value: 3
		    },
		    {
			dst: 'RIML',
			value: 2
		    },
		    {
			dst: 'SABVL',
			value: 2
		    },
		    {
			dst: 'VC5',
			value: 3
		    }]},

	    HSNR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AIZL',
			value: 1
		    },
		    {
			dst: 'AIZR',
			value: 1
		    },
		    {
			dst: 'AS5',
			value: 1
		    },
		    {
			dst: 'ASHL',
			value: 2
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVFL',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AVL',
			value: 1
		    },
		    {
			dst: 'AWBL',
			value: 1
		    },
		    {
			dst: 'BDUR',
			value: 1
		    },
		    {
			dst: 'DA5',
			value: 1
		    },
		    {
			dst: 'DA6',
			value: 1
		    },
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'MVULVA',
			value: 6
		    },
		    {
			dst: 'PVNR',
			value: 1
		    },
		    {
			dst: 'PVNR',
			value: 1
		    },
		    {
			dst: 'PVQR',
			value: 1
		    },
		    {
			dst: 'RIFR',
			value: 4
		    },
		    {
			dst: 'RMGR',
			value: 1
		    },
		    {
			dst: 'SABD',
			value: 1
		    },
		    {
			dst: 'SABVR',
			value: 1
		    },
		    {
			dst: 'VA6',
			value: 1
		    },
		    {
			dst: 'VC2',
			value: 3
		    },
		    {
			dst: 'VC3',
			value: 1
		    },
		    {
			dst: 'VD4',
			value: 2
		    }]},

	    I1L: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1R',
			value: 1
		    },
		    {
			dst: 'I3',
			value: 1
		    },
		    {
			dst: 'I5',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 1
		    },
		    {
			dst: 'RIPR',
			value: 1
		    }]},

	    I1R: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 1
		    },
		    {
			dst: 'I3',
			value: 1
		    },
		    {
			dst: 'I5',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 1
		    },
		    {
			dst: 'RIPR',
			value: 1
		    }]},

	    I2L: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 1
		    },
		    {
			dst: 'I1R',
			value: 1
		    },
		    {
			dst: 'M1',
			value: 4
		    }]},

	    I2R: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 1
		    },
		    {
			dst: 'I1R',
			value: 1
		    },
		    {
			dst: 'M1',
			value: 4
		    }]},

	    I3: {
		value: [0, 0],
		edges: [
		    {
			dst: 'M1',
			value: 4
		    },
		    {
			dst: 'M2L',
			value: 2
		    },
		    {
			dst: 'M2R',
			value: 2
		    }]},

	    I4: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I2L',
			value: 5
		    },
		    {
			dst: 'I2R',
			value: 5
		    },
		    {
			dst: 'I5',
			value: 2
		    },
		    {
			dst: 'M1',
			value: 4
		    }]},

	    I5: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 4
		    },
		    {
			dst: 'I1R',
			value: 3
		    },
		    {
			dst: 'M1',
			value: 2
		    },
		    {
			dst: 'M5',
			value: 2
		    },
		    {
			dst: 'MI',
			value: 4
		    }]},

	    I6: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I2L',
			value: 2
		    },
		    {
			dst: 'I2R',
			value: 2
		    },
		    {
			dst: 'I3',
			value: 1
		    },
		    {
			dst: 'M4',
			value: 1
		    },
		    {
			dst: 'M5',
			value: 2
		    },
		    {
			dst: 'NSML',
			value: 2
		    },
		    {
			dst: 'NSMR',
			value: 2
		    }]},

	    IL1DL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'IL1DR',
			value: 1
		    },
		    {
			dst: 'IL1L',
			value: 1
		    },
		    {
			dst: 'MDL01',
			value: 1
		    },
		    {
			dst: 'MDL02',
			value: 1
		    },
		    {
			dst: 'MDL04',
			value: 2
		    },
		    {
			dst: 'OLLL',
			value: 1
		    },
		    {
			dst: 'PVR',
			value: 1
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 2
		    },
		    {
			dst: 'RMDDR',
			value: 1
		    },
		    {
			dst: 'RMDVL',
			value: 4
		    },
		    {
			dst: 'RMEV',
			value: 1
		    },
		    {
			dst: 'URYDL',
			value: 1
		    }]},

	    IL1DR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'IL1DL',
			value: 1
		    },
		    {
			dst: 'IL1R',
			value: 1
		    },
		    {
			dst: 'MDR01',
			value: 4
		    },
		    {
			dst: 'MDR02',
			value: 3
		    },
		    {
			dst: 'OLLR',
			value: 1
		    },
		    {
			dst: 'RIPR',
			value: 5
		    },
		    {
			dst: 'RMDVR',
			value: 5
		    },
		    {
			dst: 'RMEV',
			value: 1
		    }]},

	    IL1L: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVER',
			value: 2
		    },
		    {
			dst: 'IL1DL',
			value: 2
		    },
		    {
			dst: 'IL1VL',
			value: 1
		    },
		    {
			dst: 'MDL01',
			value: 3
		    },
		    {
			dst: 'MDL03',
			value: 3
		    },
		    {
			dst: 'MDL05',
			value: 4
		    },
		    {
			dst: 'MVL01',
			value: 3
		    },
		    {
			dst: 'MVL03',
			value: 3
		    },
		    {
			dst: 'RMDDL',
			value: 5
		    },
		    {
			dst: 'RMDL',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 3
		    },
		    {
			dst: 'RMDVL',
			value: 4
		    },
		    {
			dst: 'RMDVR',
			value: 2
		    },
		    {
			dst: 'RMER',
			value: 1
		    }]},

	    IL1R: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'IL1DR',
			value: 2
		    },
		    {
			dst: 'IL1VR',
			value: 1
		    },
		    {
			dst: 'MDR01',
			value: 3
		    },
		    {
			dst: 'MDR03',
			value: 3
		    },
		    {
			dst: 'MVR01',
			value: 3
		    },
		    {
			dst: 'MVR03',
			value: 3
		    },
		    {
			dst: 'RMDDL',
			value: 3
		    },
		    {
			dst: 'RMDDR',
			value: 2
		    },
		    {
			dst: 'RMDL',
			value: 4
		    },
		    {
			dst: 'RMDR',
			value: 2
		    },
		    {
			dst: 'RMDVL',
			value: 1
		    },
		    {
			dst: 'RMDVR',
			value: 4
		    },
		    {
			dst: 'RMEL',
			value: 2
		    },
		    {
			dst: 'RMHL',
			value: 1
		    },
		    {
			dst: 'URXR',
			value: 2
		    }]},

	    IL1VL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'IL1L',
			value: 2
		    },
		    {
			dst: 'IL1VR',
			value: 1
		    },
		    {
			dst: 'MVL01',
			value: 5
		    },
		    {
			dst: 'MVL02',
			value: 4
		    },
		    {
			dst: 'RIPL',
			value: 4
		    },
		    {
			dst: 'RMDDL',
			value: 5
		    },
		    {
			dst: 'RMED',
			value: 1
		    },
		    {
			dst: 'URYVL',
			value: 1
		    }]},

	    IL1VR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'IL1R',
			value: 2
		    },
		    {
			dst: 'IL1VL',
			value: 1
		    },
		    {
			dst: 'IL2R',
			value: 1
		    },
		    {
			dst: 'IL2VR',
			value: 1
		    },
		    {
			dst: 'MVR01',
			value: 5
		    },
		    {
			dst: 'MVR02',
			value: 5
		    },
		    {
			dst: 'RIPR',
			value: 6
		    },
		    {
			dst: 'RMDDR',
			value: 10
		    },
		    {
			dst: 'RMER',
			value: 1
		    }]},

	    IL2DL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AUAL',
			value: 1
		    },
		    {
			dst: 'IL1DL',
			value: 7
		    },
		    {
			dst: 'OLQDL',
			value: 2
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 10
		    },
		    {
			dst: 'RMEL',
			value: 4
		    },
		    {
			dst: 'RMER',
			value: 3
		    },
		    {
			dst: 'URADL',
			value: 3
		    }]},

	    IL2DR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'CEPDR',
			value: 1
		    },
		    {
			dst: 'IL1DR',
			value: 7
		    },
		    {
			dst: 'RICR',
			value: 1
		    },
		    {
			dst: 'RIPR',
			value: 11
		    },
		    {
			dst: 'RMED',
			value: 1
		    },
		    {
			dst: 'RMEL',
			value: 2
		    },
		    {
			dst: 'RMER',
			value: 2
		    },
		    {
			dst: 'RMEV',
			value: 1
		    },
		    {
			dst: 'URADR',
			value: 3
		    }]},

	    IL2L: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADEL',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'IL1L',
			value: 1
		    },
		    {
			dst: 'OLQDL',
			value: 5
		    },
		    {
			dst: 'OLQVL',
			value: 8
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RIH',
			value: 7
		    },
		    {
			dst: 'RMDL',
			value: 3
		    },
		    {
			dst: 'RMDR',
			value: 1
		    },
		    {
			dst: 'RMER',
			value: 2
		    },
		    {
			dst: 'RMEV',
			value: 2
		    },
		    {
			dst: 'RMGL',
			value: 1
		    },
		    {
			dst: 'URXL',
			value: 2
		    }]},

	    IL2R: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADER',
			value: 1
		    },
		    {
			dst: 'IL1R',
			value: 1
		    },
		    {
			dst: 'IL1VR',
			value: 1
		    },
		    {
			dst: 'OLLR',
			value: 1
		    },
		    {
			dst: 'OLQDR',
			value: 2
		    },
		    {
			dst: 'OLQVR',
			value: 7
		    },
		    {
			dst: 'RIH',
			value: 6
		    },
		    {
			dst: 'RMDL',
			value: 1
		    },
		    {
			dst: 'RMEL',
			value: 2
		    },
		    {
			dst: 'RMEV',
			value: 1
		    },
		    {
			dst: 'RMGR',
			value: 1
		    },
		    {
			dst: 'URBR',
			value: 1
		    },
		    {
			dst: 'URXR',
			value: 1
		    }]},

	    IL2VL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'BAGR',
			value: 1
		    },
		    {
			dst: 'IL1VL',
			value: 7
		    },
		    {
			dst: 'IL2L',
			value: 1
		    },
		    {
			dst: 'OLQVL',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 1
		    },
		    {
			dst: 'RIH',
			value: 2
		    },
		    {
			dst: 'RIPL',
			value: 1
		    },
		    {
			dst: 'RMEL',
			value: 1
		    },
		    {
			dst: 'RMER',
			value: 4
		    },
		    {
			dst: 'RMEV',
			value: 1
		    },
		    {
			dst: 'URAVL',
			value: 3
		    }]},

	    IL2VR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'IL1VR',
			value: 6
		    },
		    {
			dst: 'OLQVR',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 2
		    },
		    {
			dst: 'RIH',
			value: 3
		    },
		    {
			dst: 'RIPR',
			value: 15
		    },
		    {
			dst: 'RMEL',
			value: 3
		    },
		    {
			dst: 'RMER',
			value: 2
		    },
		    {
			dst: 'RMEV',
			value: 3
		    },
		    {
			dst: 'URAVR',
			value: 4
		    },
		    {
			dst: 'URXR',
			value: 1
		    }]},

	    LUAL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 6
		    },
		    {
			dst: 'AVAR',
			value: 6
		    },
		    {
			dst: 'AVDL',
			value: 4
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'PHBL',
			value: 1
		    },
		    {
			dst: 'PLML',
			value: 1
		    },
		    {
			dst: 'PVNL',
			value: 1
		    },
		    {
			dst: 'PVR',
			value: 1
		    },
		    {
			dst: 'PVWL',
			value: 1
		    }]},

	    LUAR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 3
		    },
		    {
			dst: 'AVAR',
			value: 7
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 3
		    },
		    {
			dst: 'AVJR',
			value: 1
		    },
		    {
			dst: 'PLMR',
			value: 1
		    },
		    {
			dst: 'PQR',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 3
		    },
		    {
			dst: 'PVR',
			value: 1
		    },
		    {
			dst: 'PVR',
			value: 1
		    },
		    {
			dst: 'PVWL',
			value: 1
		    }]},

	    M1: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I2L',
			value: 2
		    },
		    {
			dst: 'I2R',
			value: 2
		    },
		    {
			dst: 'I3',
			value: 1
		    },
		    {
			dst: 'I4',
			value: 1
		    }]},

	    M2L: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 3
		    },
		    {
			dst: 'I1R',
			value: 3
		    },
		    {
			dst: 'I3',
			value: 3
		    },
		    {
			dst: 'M2R',
			value: 1
		    },
		    {
			dst: 'M5',
			value: 1
		    },
		    {
			dst: 'MI',
			value: 4
		    }]},

	    M2R: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 3
		    },
		    {
			dst: 'I1R',
			value: 3
		    },
		    {
			dst: 'I3',
			value: 3
		    },
		    {
			dst: 'M3L',
			value: 1
		    },
		    {
			dst: 'M3R',
			value: 1
		    },
		    {
			dst: 'M5',
			value: 1
		    },
		    {
			dst: 'MI',
			value: 4
		    }]},

	    M3L: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 4
		    },
		    {
			dst: 'I1R',
			value: 4
		    },
		    {
			dst: 'I4',
			value: 2
		    },
		    {
			dst: 'I5',
			value: 3
		    },
		    {
			dst: 'I6',
			value: 1
		    },
		    {
			dst: 'M1',
			value: 2
		    },
		    {
			dst: 'M3R',
			value: 1
		    },
		    {
			dst: 'MCL',
			value: 1
		    },
		    {
			dst: 'MCR',
			value: 1
		    },
		    {
			dst: 'MI',
			value: 2
		    },
		    {
			dst: 'NSML',
			value: 2
		    },
		    {
			dst: 'NSMR',
			value: 3
		    }]},

	    M3R: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 4
		    },
		    {
			dst: 'I1R',
			value: 4
		    },
		    {
			dst: 'I3',
			value: 2
		    },
		    {
			dst: 'I4',
			value: 6
		    },
		    {
			dst: 'I5',
			value: 3
		    },
		    {
			dst: 'I6',
			value: 1
		    },
		    {
			dst: 'M1',
			value: 2
		    },
		    {
			dst: 'M3L',
			value: 1
		    },
		    {
			dst: 'MCL',
			value: 1
		    },
		    {
			dst: 'MCR',
			value: 1
		    },
		    {
			dst: 'MI',
			value: 2
		    },
		    {
			dst: 'NSML',
			value: 2
		    },
		    {
			dst: 'NSMR',
			value: 3
		    }]},

	    M4: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I3',
			value: 1
		    },
		    {
			dst: 'I5',
			value: 13
		    },
		    {
			dst: 'I6',
			value: 3
		    },
		    {
			dst: 'M2L',
			value: 1
		    },
		    {
			dst: 'M2R',
			value: 1
		    },
		    {
			dst: 'M4',
			value: 6
		    },
		    {
			dst: 'M5',
			value: 1
		    },
		    {
			dst: 'NSML',
			value: 1
		    },
		    {
			dst: 'NSMR',
			value: 1
		    }]},

	    M5: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I5',
			value: 3
		    },
		    {
			dst: 'I5',
			value: 1
		    },
		    {
			dst: 'I6',
			value: 1
		    },
		    {
			dst: 'M1',
			value: 2
		    },
		    {
			dst: 'M2L',
			value: 2
		    },
		    {
			dst: 'M2R',
			value: 2
		    },
		    {
			dst: 'M5',
			value: 4
		    }]},

	    MCL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 3
		    },
		    {
			dst: 'I1R',
			value: 3
		    },
		    {
			dst: 'I2L',
			value: 1
		    },
		    {
			dst: 'I2R',
			value: 1
		    },
		    {
			dst: 'I3',
			value: 1
		    },
		    {
			dst: 'M1',
			value: 2
		    },
		    {
			dst: 'M2L',
			value: 2
		    },
		    {
			dst: 'M2R',
			value: 2
		    }]},

	    MCR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 3
		    },
		    {
			dst: 'I1R',
			value: 3
		    },
		    {
			dst: 'I3',
			value: 1
		    },
		    {
			dst: 'M1',
			value: 2
		    },
		    {
			dst: 'M2L',
			value: 2
		    },
		    {
			dst: 'M2R',
			value: 2
		    }]},
	    
	    MI: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 1
		    },
		    {
			dst: 'I1R',
			value: 1
		    },
		    {
			dst: 'I3',
			value: 1
		    },
		    {
			dst: 'I4',
			value: 1
		    },
		    {
			dst: 'I5',
			value: 2
		    },
		    {
			dst: 'M1',
			value: 1
		    },
		    {
			dst: 'M2L',
			value: 2
		    },
		    {
			dst: 'M2R',
			value: 2
		    },
		    {
			dst: 'M3L',
			value: 1
		    },
		    {
			dst: 'M3R',
			value: 1
		    },
		    {
			dst: 'MCL',
			value: 2
		    },
		    {
			dst: 'MCR',
			value: 2
		    }]},

	    NSML: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 1
		    },
		    {
			dst: 'I1R',
			value: 2
		    },
		    {
			dst: 'I2L',
			value: 6
		    },
		    {
			dst: 'I2R',
			value: 6
		    },
		    {
			dst: 'I3',
			value: 2
		    },
		    {
			dst: 'I4',
			value: 3
		    },
		    {
			dst: 'I5',
			value: 2
		    },
		    {
			dst: 'I6',
			value: 2
		    },
		    {
			dst: 'M3L',
			value: 2
		    },
		    {
			dst: 'M3R',
			value: 2
		    }]},

	    NSMR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'I1L',
			value: 2
		    },
		    {
			dst: 'I1R',
			value: 2
		    },
		    {
			dst: 'I2L',
			value: 6
		    },
		    {
			dst: 'I2R',
			value: 6
		    },
		    {
			dst: 'I3',
			value: 2
		    },
		    {
			dst: 'I4',
			value: 3
		    },
		    {
			dst: 'I5',
			value: 2
		    },
		    {
			dst: 'I6',
			value: 2
		    },
		    {
			dst: 'M3L',
			value: 2
		    },
		    {
			dst: 'M3R',
			value: 2
		    }]},

	    OLLL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVER',
			value: 21
		    },
		    {
			dst: 'CEPDL',
			value: 3
		    },
		    {
			dst: 'CEPVL',
			value: 4
		    },
		    {
			dst: 'IL1DL',
			value: 1
		    },
		    {
			dst: 'IL1VL',
			value: 2
		    },
		    {
			dst: 'OLLR',
			value: 2
		    },
		    {
			dst: 'RIBL',
			value: 8
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 7
		    },
		    {
			dst: 'RMDL',
			value: 2
		    },
		    {
			dst: 'RMDVL',
			value: 1
		    },
		    {
			dst: 'RMEL',
			value: 2
		    },
		    {
			dst: 'SMDDL',
			value: 3
		    },
		    {
			dst: 'SMDDR',
			value: 4
		    },
		    {
			dst: 'SMDVR',
			value: 4
		    },
		    {
			dst: 'URYDL',
			value: 1
		    }]},

	    OLLR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVEL',
			value: 16
		    },
		    {
			dst: 'CEPDR',
			value: 1
		    },
		    {
			dst: 'CEPVR',
			value: 6
		    },
		    {
			dst: 'IL1DR',
			value: 3
		    },
		    {
			dst: 'IL1VR',
			value: 1
		    },
		    {
			dst: 'IL2R',
			value: 1
		    },
		    {
			dst: 'OLLL',
			value: 2
		    },
		    {
			dst: 'RIBR',
			value: 10
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 10
		    },
		    {
			dst: 'RMDL',
			value: 3
		    },
		    {
			dst: 'RMDVR',
			value: 3
		    },
		    {
			dst: 'RMER',
			value: 2
		    },
		    {
			dst: 'SMDDR',
			value: 1
		    },
		    {
			dst: 'SMDVL',
			value: 4
		    },
		    {
			dst: 'SMDVR',
			value: 3
		    }]},

	    OLQDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'CEPDL',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 2
		    },
		    {
			dst: 'RICR',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 4
		    },
		    {
			dst: 'RMDVL',
			value: 1
		    },
		    {
			dst: 'SIBVL',
			value: 3
		    },
		    {
			dst: 'URBL',
			value: 1
		    }]},

	    OLQDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'CEPDR',
			value: 2
		    },
		    {
			dst: 'RIBR',
			value: 2
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RICR',
			value: 1
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 3
		    },
		    {
			dst: 'RMDVR',
			value: 1
		    },
		    {
			dst: 'RMHR',
			value: 1
		    },
		    {
			dst: 'SIBVR',
			value: 2
		    },
		    {
			dst: 'URBR',
			value: 1
		    }]},

	    OLQVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADLL',
			value: 1
		    },
		    {
			dst: 'CEPVL',
			value: 1
		    },
		    {
			dst: 'IL1VL',
			value: 1
		    },
		    {
			dst: 'IL2VL',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 1
		    },
		    {
			dst: 'RMDVR',
			value: 4
		    },
		    {
			dst: 'SIBDL',
			value: 3
		    },
		    {
			dst: 'URBL',
			value: 1
		    }]},

	    OLQVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'CEPVR',
			value: 1
		    },
		    {
			dst: 'IL1VR',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RICR',
			value: 1
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RIH',
			value: 2
		    },
		    {
			dst: 'RIPR',
			value: 2
		    },
		    {
			dst: 'RMDDR',
			value: 1
		    },
		    {
			dst: 'RMDVL',
			value: 4
		    },
		    {
			dst: 'RMER',
			value: 1
		    },
		    {
			dst: 'SIBDR',
			value: 4
		    },
		    {
			dst: 'URBR',
			value: 1
		    }]},

	    PDA: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS11',
			value: 1
		    },
		    {
			dst: 'DA9',
			value: 1
		    },
		    {
			dst: 'DD6',
			value: 1
		    },
		    {
			dst: 'MDL21',
			value: 2
		    },
		    {
			dst: 'PVNR',
			value: 1
		    },
		    {
			dst: 'VD13',
			value: 3
		    }]},

	    PDB: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS11',
			value: 2
		    },
		    {
			dst: 'MVL22',
			value: 1
		    },
		    {
			dst: 'MVR21',
			value: 1
		    },
		    {
			dst: 'RID',
			value: 2
		    },
		    {
			dst: 'VD13',
			value: 2
		    }]},

	    PDEL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVKL',
			value: 6
		    },
		    {
			dst: 'DVA',
			value: 24
		    },
		    {
			dst: 'PDER',
			value: 1
		    },
		    {
			dst: 'PDER',
			value: 3
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'PVM',
			value: 2
		    },
		    {
			dst: 'PVM',
			value: 1
		    },
		    {
			dst: 'PVR',
			value: 2
		    },
		    {
			dst: 'VA9',
			value: 1
		    },
		    {
			dst: 'VD11',
			value: 1
		    }]},

	    PDER: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVKL',
			value: 16
		    },
		    {
			dst: 'DVA',
			value: 35
		    },
		    {
			dst: 'PDEL',
			value: 3
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'PVM',
			value: 1
		    },
		    {
			dst: 'VA8',
			value: 1
		    },
		    {
			dst: 'VD9',
			value: 1
		    }]},

	    PHAL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVFL',
			value: 3
		    },
		    {
			dst: 'AVG',
			value: 5
		    },
		    {
			dst: 'AVHL',
			value: 1
		    },
		    {
			dst: 'AVHR',
			value: 1
		    },
		    {
			dst: 'DVA',
			value: 2
		    },
		    {
			dst: 'PHAR',
			value: 5
		    },
		    {
			dst: 'PHAR',
			value: 2
		    },
		    {
			dst: 'PHBL',
			value: 5
		    },
		    {
			dst: 'PHBR',
			value: 5
		    },
		    {
			dst: 'PVQL',
			value: 2
		    }]},

	    PHAR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVG',
			value: 3
		    },
		    {
			dst: 'AVHR',
			value: 1
		    },
		    {
			dst: 'DA8',
			value: 1
		    },
		    {
			dst: 'DVA',
			value: 1
		    },
		    {
			dst: 'PHAL',
			value: 6
		    },
		    {
			dst: 'PHAL',
			value: 2
		    },
		    {
			dst: 'PHBL',
			value: 1
		    },
		    {
			dst: 'PHBR',
			value: 5
		    },
		    {
			dst: 'PVPL',
			value: 3
		    },
		    {
			dst: 'PVQL',
			value: 2
		    }]},

	    PHBL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 9
		    },
		    {
			dst: 'AVAR',
			value: 6
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'PHBR',
			value: 1
		    },
		    {
			dst: 'PHBR',
			value: 3
		    },
		    {
			dst: 'PVCL',
			value: 13
		    },
		    {
			dst: 'VA12',
			value: 1
		    }]},

	    PHBR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 7
		    },
		    {
			dst: 'AVAR',
			value: 7
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVFL',
			value: 1
		    },
		    {
			dst: 'AVHL',
			value: 1
		    },
		    {
			dst: 'DA8',
			value: 1
		    },
		    {
			dst: 'PHBL',
			value: 1
		    },
		    {
			dst: 'PHBL',
			value: 3
		    },
		    {
			dst: 'PVCL',
			value: 6
		    },
		    {
			dst: 'PVCR',
			value: 3
		    },
		    {
			dst: 'VA12',
			value: 2
		    }]},

	    PHCL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'DA9',
			value: 7
		    },
		    {
			dst: 'DA9',
			value: 1
		    },
		    {
			dst: 'DVA',
			value: 6
		    },
		    {
			dst: 'LUAL',
			value: 1
		    },
		    {
			dst: 'PHCR',
			value: 1
		    },
		    {
			dst: 'PLML',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 2
		    },
		    {
			dst: 'VA12',
			value: 3
		    }]},

	    PHCR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVHR',
			value: 1
		    },
		    {
			dst: 'DA9',
			value: 2
		    },
		    {
			dst: 'DVA',
			value: 8
		    },
		    {
			dst: 'LUAR',
			value: 1
		    },
		    {
			dst: 'PHCL',
			value: 2
		    },
		    {
			dst: 'PVCR',
			value: 9
		    },
		    {
			dst: 'VA12',
			value: 2
		    }]},

	    PLML: {
		value: [0, 0],
		edges: [
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'LUAL',
			value: 1
		    },
		    {
			dst: 'PHCL',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 1
		    }]},

	    PLMR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS6',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 4
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 4
		    },
		    {
			dst: 'DVA',
			value: 5
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'LUAR',
			value: 1
		    },
		    {
			dst: 'PDEL',
			value: 2
		    },
		    {
			dst: 'PDER',
			value: 3
		    },
		    {
			dst: 'PVCL',
			value: 2
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'PVR',
			value: 2
		    }]},

	    PLNL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'SAADL',
			value: 5
		    },
		    {
			dst: 'SMBVL',
			value: 6
		    }]},

	    PLNR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'SAADR',
			value: 4
		    },
		    {
			dst: 'SMBVR',
			value: 6
		    }]},

	    PQR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 8
		    },
		    {
			dst: 'AVAR',
			value: 11
		    },
		    {
			dst: 'AVDL',
			value: 7
		    },
		    {
			dst: 'AVDR',
			value: 6
		    },
		    {
			dst: 'AVG',
			value: 1
		    },
		    {
			dst: 'LUAR',
			value: 1
		    },
		    {
			dst: 'PVNL',
			value: 1
		    },
		    {
			dst: 'PVPL',
			value: 4
		    }]},

	    PVCL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS1',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 3
		    },
		    {
			dst: 'AVAR',
			value: 4
		    },
		    {
			dst: 'AVBL',
			value: 5
		    },
		    {
			dst: 'AVBR',
			value: 12
		    },
		    {
			dst: 'AVDL',
			value: 5
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 3
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 4
		    },
		    {
			dst: 'AVJR',
			value: 2
		    },
		    {
			dst: 'DA2',
			value: 1
		    },
		    {
			dst: 'DA5',
			value: 1
		    },
		    {
			dst: 'DA6',
			value: 1
		    },
		    {
			dst: 'DB2',
			value: 3
		    },
		    {
			dst: 'DB3',
			value: 4
		    },
		    {
			dst: 'DB4',
			value: 3
		    },
		    {
			dst: 'DB5',
			value: 2
		    },
		    {
			dst: 'DB6',
			value: 2
		    },
		    {
			dst: 'DB7',
			value: 3
		    },
		    {
			dst: 'DVA',
			value: 5
		    },
		    {
			dst: 'PLML',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 7
		    },
		    {
			dst: 'RID',
			value: 5
		    },
		    {
			dst: 'RIS',
			value: 2
		    },
		    {
			dst: 'SIBVL',
			value: 2
		    },
		    {
			dst: 'VB10',
			value: 3
		    },
		    {
			dst: 'VB11',
			value: 1
		    },
		    {
			dst: 'VB3',
			value: 1
		    },
		    {
			dst: 'VB4',
			value: 1
		    },
		    {
			dst: 'VB5',
			value: 1
		    },
		    {
			dst: 'VB6',
			value: 2
		    },
		    {
			dst: 'VB8',
			value: 1
		    },
		    {
			dst: 'VB9',
			value: 2
		    }]},

	    PVCR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AQR',
			value: 1
		    },
		    {
			dst: 'AS2',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 12
		    },
		    {
			dst: 'AVAR',
			value: 10
		    },
		    {
			dst: 'AVBL',
			value: 8
		    },
		    {
			dst: 'AVBR',
			value: 6
		    },
		    {
			dst: 'AVDL',
			value: 5
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 3
		    },
		    {
			dst: 'AVL',
			value: 1
		    },
		    {
			dst: 'DA9',
			value: 1
		    },
		    {
			dst: 'DB2',
			value: 1
		    },
		    {
			dst: 'DB3',
			value: 3
		    },
		    {
			dst: 'DB4',
			value: 4
		    },
		    {
			dst: 'DB5',
			value: 1
		    },
		    {
			dst: 'DB6',
			value: 2
		    },
		    {
			dst: 'DB7',
			value: 1
		    },
		    {
			dst: 'FLPL',
			value: 1
		    },
		    {
			dst: 'LUAR',
			value: 1
		    },
		    {
			dst: 'PDEL',
			value: 2
		    },
		    {
			dst: 'PHCR',
			value: 1
		    },
		    {
			dst: 'PLMR',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 8
		    },
		    {
			dst: 'PVDL',
			value: 1
		    },
		    {
			dst: 'PVR',
			value: 1
		    },
		    {
			dst: 'PVWL',
			value: 2
		    },
		    {
			dst: 'PVWR',
			value: 2
		    },
		    {
			dst: 'RID',
			value: 5
		    },
		    {
			dst: 'SIBVR',
			value: 2
		    },
		    {
			dst: 'VA8',
			value: 2
		    },
		    {
			dst: 'VA9',
			value: 1
		    },
		    {
			dst: 'VB10',
			value: 1
		    },
		    {
			dst: 'VB4',
			value: 3
		    },
		    {
			dst: 'VB6',
			value: 2
		    },
		    {
			dst: 'VB7',
			value: 3
		    },
		    {
			dst: 'VB8',
			value: 1
		    }]},

	    PVDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 6
		    },
		    {
			dst: 'AVAR',
			value: 6
		    },
		    {
			dst: 'DD5',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 6
		    },
		    {
			dst: 'VD10',
			value: 6
		    }]},

	    PVDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 6
		    },
		    {
			dst: 'AVAR',
			value: 9
		    },
		    {
			dst: 'DVA',
			value: 3
		    },
		    {
			dst: 'PVCL',
			value: 13
		    },
		    {
			dst: 'PVCR',
			value: 10
		    },
		    {
			dst: 'PVDL',
			value: 1
		    },
		    {
			dst: 'VA9',
			value: 1
		    }]},

	    PVM: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVKL',
			value: 11
		    },
		    {
			dst: 'AVL',
			value: 1
		    },
		    {
			dst: 'AVM',
			value: 1
		    },
		    {
			dst: 'DVA',
			value: 3
		    },
		    {
			dst: 'PDEL',
			value: 7
		    },
		    {
			dst: 'PDEL',
			value: 1
		    },
		    {
			dst: 'PDER',
			value: 8
		    },
		    {
			dst: 'PDER',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 2
		    },
		    {
			dst: 'PVR',
			value: 1
		    }]},

	    PVNL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 3
		    },
		    {
			dst: 'AVDL',
			value: 3
		    },
		    {
			dst: 'AVDR',
			value: 3
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVFR',
			value: 1
		    },
		    {
			dst: 'AVG',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 5
		    },
		    {
			dst: 'AVJR',
			value: 5
		    },
		    {
			dst: 'AVL',
			value: 2
		    },
		    {
			dst: 'BDUL',
			value: 1
		    },
		    {
			dst: 'BDUR',
			value: 2
		    },
		    {
			dst: 'DD1',
			value: 2
		    },
		    {
			dst: 'MVL09',
			value: 3
		    },
		    {
			dst: 'PQR',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'PVNR',
			value: 5
		    },
		    {
			dst: 'PVQR',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'PVWL',
			value: 1
		    },
		    {
			dst: 'RIFL',
			value: 1
		    }]},

	    PVNR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 3
		    },
		    {
			dst: 'AVJL',
			value: 4
		    },
		    {
			dst: 'AVJR',
			value: 1
		    },
		    {
			dst: 'AVL',
			value: 2
		    },
		    {
			dst: 'BDUL',
			value: 1
		    },
		    {
			dst: 'BDUR',
			value: 2
		    },
		    {
			dst: 'DD3',
			value: 1
		    },
		    {
			dst: 'HSNR',
			value: 2
		    },
		    {
			dst: 'MVL12',
			value: 1
		    },
		    {
			dst: 'MVL13',
			value: 2
		    },
		    {
			dst: 'PQR',
			value: 2
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'PVNL',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 2
		    },
		    {
			dst: 'PVWL',
			value: 2
		    },
		    {
			dst: 'VC2',
			value: 1
		    },
		    {
			dst: 'VC3',
			value: 1
		    },
		    {
			dst: 'VD12',
			value: 1
		    },
		    {
			dst: 'VD6',
			value: 1
		    },
		    {
			dst: 'VD7',
			value: 1
		    }]},

	    PVPL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 1
		    },
		    {
			dst: 'AQR',
			value: 8
		    },
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 5
		    },
		    {
			dst: 'AVBR',
			value: 6
		    },
		    {
			dst: 'AVDR',
			value: 2
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'AVHR',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'AVKR',
			value: 6
		    },
		    {
			dst: 'DVC',
			value: 2
		    },
		    {
			dst: 'PHAR',
			value: 3
		    },
		    {
			dst: 'PQR',
			value: 4
		    },
		    {
			dst: 'PVCR',
			value: 3
		    },
		    {
			dst: 'PVPR',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 2
		    },
		    {
			dst: 'VD13',
			value: 2
		    },
		    {
			dst: 'VD3',
			value: 1
		    }]},

	    PVPR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADFR',
			value: 1
		    },
		    {
			dst: 'AQR',
			value: 11
		    },
		    {
			dst: 'ASHR',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 4
		    },
		    {
			dst: 'AVBR',
			value: 5
		    },
		    {
			dst: 'AVHL',
			value: 3
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'AVL',
			value: 4
		    },
		    {
			dst: 'DD2',
			value: 1
		    },
		    {
			dst: 'DVC',
			value: 14
		    },
		    {
			dst: 'PVCL',
			value: 4
		    },
		    {
			dst: 'PVCR',
			value: 7
		    },
		    {
			dst: 'PVPL',
			value: 1
		    },
		    {
			dst: 'PVQR',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 2
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RIMR',
			value: 1
		    },
		    {
			dst: 'RMGR',
			value: 1
		    },
		    {
			dst: 'VD4',
			value: 1
		    },
		    {
			dst: 'VD5',
			value: 1
		    }]},

	    PVQL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 1
		    },
		    {
			dst: 'AIAL',
			value: 3
		    },
		    {
			dst: 'ASJL',
			value: 1
		    },
		    {
			dst: 'ASKL',
			value: 4
		    },
		    {
			dst: 'ASKL',
			value: 5
		    },
		    {
			dst: 'HSNL',
			value: 2
		    },
		    {
			dst: 'PVQR',
			value: 2
		    },
		    {
			dst: 'RMGL',
			value: 1
		    }]},

	    PVQR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 1
		    },
		    {
			dst: 'AIAR',
			value: 7
		    },
		    {
			dst: 'ASER',
			value: 1
		    },
		    {
			dst: 'ASKR',
			value: 8
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVFL',
			value: 1
		    },
		    {
			dst: 'AVFR',
			value: 1
		    },
		    {
			dst: 'AVL',
			value: 1
		    },
		    {
			dst: 'AWAR',
			value: 2
		    },
		    {
			dst: 'DD1',
			value: 1
		    },
		    {
			dst: 'DVC',
			value: 1
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'PVNL',
			value: 1
		    },
		    {
			dst: 'PVQL',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'RIFR',
			value: 1
		    },
		    {
			dst: 'VD1',
			value: 1
		    }]},

	    PVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 1
		    },
		    {
			dst: 'ALML',
			value: 1
		    },
		    {
			dst: 'AS6',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 4
		    },
		    {
			dst: 'AVBR',
			value: 4
		    },
		    {
			dst: 'AVJL',
			value: 3
		    },
		    {
			dst: 'AVJR',
			value: 2
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'DA9',
			value: 1
		    },
		    {
			dst: 'DB2',
			value: 1
		    },
		    {
			dst: 'DB3',
			value: 1
		    },
		    {
			dst: 'DVA',
			value: 3
		    },
		    {
			dst: 'IL1DL',
			value: 1
		    },
		    {
			dst: 'IL1DR',
			value: 1
		    },
		    {
			dst: 'IL1VL',
			value: 1
		    },
		    {
			dst: 'IL1VR',
			value: 1
		    },
		    {
			dst: 'LUAL',
			value: 1
		    },
		    {
			dst: 'LUAR',
			value: 1
		    },
		    {
			dst: 'PDEL',
			value: 1
		    },
		    {
			dst: 'PDER',
			value: 1
		    },
		    {
			dst: 'PLMR',
			value: 2
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 3
		    },
		    {
			dst: 'RIPR',
			value: 3
		    },
		    {
			dst: 'SABD',
			value: 1
		    },
		    {
			dst: 'URADL',
			value: 1
		    }]},

	    PVT: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBL',
			value: 3
		    },
		    {
			dst: 'AIBR',
			value: 5
		    },
		    {
			dst: 'AVKL',
			value: 9
		    },
		    {
			dst: 'AVKR',
			value: 7
		    },
		    {
			dst: 'AVL',
			value: 2
		    },
		    {
			dst: 'DVC',
			value: 2
		    },
		    {
			dst: 'PVPL',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 2
		    },
		    {
			dst: 'RIGR',
			value: 3
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'RMEV',
			value: 1
		    },
		    {
			dst: 'RMFL',
			value: 2
		    },
		    {
			dst: 'RMFR',
			value: 3
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    }]},

	    PVWL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 2
		    },
		    {
			dst: 'PVT',
			value: 2
		    },
		    {
			dst: 'PVWR',
			value: 1
		    },
		    {
			dst: 'VA12',
			value: 1
		    }]},

	    PVWR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 2
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'VA12',
			value: 1
		    }]},

	    RIAL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'CEPVL',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 1
		    },
		    {
			dst: 'RIVL',
			value: 2
		    },
		    {
			dst: 'RIVR',
			value: 4
		    },
		    {
			dst: 'RMDDL',
			value: 12
		    },
		    {
			dst: 'RMDDR',
			value: 7
		    },
		    {
			dst: 'RMDL',
			value: 6
		    },
		    {
			dst: 'RMDR',
			value: 6
		    },
		    {
			dst: 'RMDVL',
			value: 9
		    },
		    {
			dst: 'RMDVR',
			value: 11
		    },
		    {
			dst: 'SIADL',
			value: 2
		    },
		    {
			dst: 'SMDDL',
			value: 8
		    },
		    {
			dst: 'SMDDR',
			value: 10
		    },
		    {
			dst: 'SMDVL',
			value: 6
		    },
		    {
			dst: 'SMDVR',
			value: 11
		    }]},

	    RIAR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'CEPVR',
			value: 1
		    },
		    {
			dst: 'IL1R',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 4
		    },
		    {
			dst: 'RIVL',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 10
		    },
		    {
			dst: 'RMDDR',
			value: 11
		    },
		    {
			dst: 'RMDL',
			value: 3
		    },
		    {
			dst: 'RMDR',
			value: 8
		    },
		    {
			dst: 'RMDVL',
			value: 12
		    },
		    {
			dst: 'RMDVR',
			value: 10
		    },
		    {
			dst: 'SAADR',
			value: 1
		    },
		    {
			dst: 'SIADL',
			value: 1
		    },
		    {
			dst: 'SIADR',
			value: 1
		    },
		    {
			dst: 'SIAVL',
			value: 1
		    },
		    {
			dst: 'SMDDL',
			value: 7
		    },
		    {
			dst: 'SMDDR',
			value: 7
		    },
		    {
			dst: 'SMDVL',
			value: 13
		    },
		    {
			dst: 'SMDVR',
			value: 7
		    }]},

	    RIBL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBR',
			value: 2
		    },
		    {
			dst: 'AUAL',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'AVDR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 5
		    },
		    {
			dst: 'BAGR',
			value: 1
		    },
		    {
			dst: 'OLQDL',
			value: 2
		    },
		    {
			dst: 'OLQVL',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 3
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 3
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'SIADL',
			value: 1
		    },
		    {
			dst: 'SIAVL',
			value: 1
		    },
		    {
			dst: 'SIBDL',
			value: 1
		    },
		    {
			dst: 'SIBVL',
			value: 1
		    },
		    {
			dst: 'SIBVR',
			value: 1
		    },
		    {
			dst: 'SMBDL',
			value: 1
		    },
		    {
			dst: 'SMDDL',
			value: 1
		    },
		    {
			dst: 'SMDVR',
			value: 4
		    }]},

	    RIBR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AIZR',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 3
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'BAGL',
			value: 1
		    },
		    {
			dst: 'OLQDR',
			value: 2
		    },
		    {
			dst: 'OLQVR',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 2
		    },
		    {
			dst: 'RIBL',
			value: 3
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RIGR',
			value: 2
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'SIADR',
			value: 1
		    },
		    {
			dst: 'SIAVR',
			value: 1
		    },
		    {
			dst: 'SIBDR',
			value: 1
		    },
		    {
			dst: 'SIBVR',
			value: 1
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    },
		    {
			dst: 'SMDDL',
			value: 2
		    },
		    {
			dst: 'SMDDR',
			value: 1
		    },
		    {
			dst: 'SMDVL',
			value: 2
		    }]},

	    RICL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 1
		    },
		    {
			dst: 'ASHL',
			value: 2
		    },
		    {
			dst: 'AVAL',
			value: 5
		    },
		    {
			dst: 'AVAR',
			value: 6
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'AVKR',
			value: 2
		    },
		    {
			dst: 'AWBR',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 1
		    },
		    {
			dst: 'RIMR',
			value: 3
		    },
		    {
			dst: 'RIVR',
			value: 1
		    },
		    {
			dst: 'RMFR',
			value: 1
		    },
		    {
			dst: 'SMBDL',
			value: 2
		    },
		    {
			dst: 'SMDDL',
			value: 3
		    },
		    {
			dst: 'SMDDR',
			value: 3
		    },
		    {
			dst: 'SMDVR',
			value: 1
		    }]},

	    RICR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 1
		    },
		    {
			dst: 'ASHR',
			value: 2
		    },
		    {
			dst: 'AVAL',
			value: 5
		    },
		    {
			dst: 'AVAR',
			value: 5
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    },
		    {
			dst: 'SMDDL',
			value: 4
		    },
		    {
			dst: 'SMDDR',
			value: 3
		    },
		    {
			dst: 'SMDVL',
			value: 2
		    },
		    {
			dst: 'SMDVR',
			value: 1
		    }]},

	    RID: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ALA',
			value: 1
		    },
		    {
			dst: 'AS2',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'DA6',
			value: 3
		    },
		    {
			dst: 'DA9',
			value: 1
		    },
		    {
			dst: 'DB1',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 4
		    },
		    {
			dst: 'DD2',
			value: 4
		    },
		    {
			dst: 'DD3',
			value: 3
		    },
		    {
			dst: 'MDL14',
			value: -2
		    },
		    {
			dst: 'MDL21',
			value: -3
		    },
		    {
			dst: 'PDB',
			value: 2
		    },
		    {
			dst: 'VD13',
			value: 1
		    },
		    {
			dst: 'VD5',
			value: 1
		    }]},

	    RIFL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ALML',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 10
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVG',
			value: 1
		    },
		    {
			dst: 'AVHR',
			value: 1
		    },
		    {
			dst: 'AVJR',
			value: 2
		    },
		    {
			dst: 'PVPL',
			value: 3
		    },
		    {
			dst: 'RIML',
			value: 4
		    },
		    {
			dst: 'VD1',
			value: 1
		    }]},

	    RIFR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ASHR',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 17
		    },
		    {
			dst: 'AVFL',
			value: 1
		    },
		    {
			dst: 'AVG',
			value: 1
		    },
		    {
			dst: 'AVHL',
			value: 1
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AVJR',
			value: 2
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'PVPR',
			value: 4
		    },
		    {
			dst: 'RIMR',
			value: 4
		    },
		    {
			dst: 'RIPR',
			value: 1
		    }]},

	    RIGL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBR',
			value: 3
		    },
		    {
			dst: 'AIZR',
			value: 1
		    },
		    {
			dst: 'ALNL',
			value: 1
		    },
		    {
			dst: 'AQR',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'AVKR',
			value: 2
		    },
		    {
			dst: 'BAGR',
			value: 1
		    },
		    {
			dst: 'BAGR',
			value: 1
		    },
		    {
			dst: 'DVC',
			value: 1
		    },
		    {
			dst: 'OLLL',
			value: 1
		    },
		    {
			dst: 'OLQDL',
			value: 1
		    },
		    {
			dst: 'OLQVL',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 2
		    },
		    {
			dst: 'RIGR',
			value: 3
		    },
		    {
			dst: 'RIR',
			value: 2
		    },
		    {
			dst: 'RMEL',
			value: 2
		    },
		    {
			dst: 'RMHR',
			value: 3
		    },
		    {
			dst: 'URYDL',
			value: 1
		    },
		    {
			dst: 'URYVL',
			value: 1
		    },
		    {
			dst: 'VB2',
			value: 1
		    },
		    {
			dst: 'VD1',
			value: 2
		    }]},

	    RIGR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBL',
			value: 3
		    },
		    {
			dst: 'ALNR',
			value: 1
		    },
		    {
			dst: 'AQR',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 2
		    },
		    {
			dst: 'AVKL',
			value: 4
		    },
		    {
			dst: 'AVKR',
			value: 2
		    },
		    {
			dst: 'BAGL',
			value: 1
		    },
		    {
			dst: 'OLLR',
			value: 1
		    },
		    {
			dst: 'OLQDR',
			value: 1
		    },
		    {
			dst: 'OLQVR',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 2
		    },
		    {
			dst: 'RIGL',
			value: 3
		    },
		    {
			dst: 'RIR',
			value: 1
		    },
		    {
			dst: 'RMHL',
			value: 4
		    },
		    {
			dst: 'URYDR',
			value: 1
		    },
		    {
			dst: 'URYVR',
			value: 1
		    }]},

	    RIH: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADFR',
			value: 1
		    },
		    {
			dst: 'AIZL',
			value: 4
		    },
		    {
			dst: 'AIZR',
			value: 4
		    },
		    {
			dst: 'AUAR',
			value: 1
		    },
		    {
			dst: 'BAGR',
			value: 1
		    },
		    {
			dst: 'CEPDL',
			value: 2
		    },
		    {
			dst: 'CEPDR',
			value: 2
		    },
		    {
			dst: 'CEPVL',
			value: 2
		    },
		    {
			dst: 'CEPVR',
			value: 2
		    },
		    {
			dst: 'FLPL',
			value: 1
		    },
		    {
			dst: 'IL2L',
			value: 2
		    },
		    {
			dst: 'IL2R',
			value: 1
		    },
		    {
			dst: 'OLQDL',
			value: 4
		    },
		    {
			dst: 'OLQDR',
			value: 2
		    },
		    {
			dst: 'OLQVL',
			value: 1
		    },
		    {
			dst: 'OLQVR',
			value: 6
		    },
		    {
			dst: 'RIAL',
			value: 10
		    },
		    {
			dst: 'RIAR',
			value: 8
		    },
		    {
			dst: 'RIBL',
			value: 5
		    },
		    {
			dst: 'RIBR',
			value: 4
		    },
		    {
			dst: 'RIPL',
			value: 4
		    },
		    {
			dst: 'RIPR',
			value: 6
		    },
		    {
			dst: 'RMER',
			value: 2
		    },
		    {
			dst: 'RMEV',
			value: 1
		    },
		    {
			dst: 'URYVR',
			value: 1
		    }]},

	    RIML: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AIYL',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'AVBL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 3
		    },
		    {
			dst: 'AVEL',
			value: 2
		    },
		    {
			dst: 'AVER',
			value: 3
		    },
		    {
			dst: 'MDR05',
			value: 2
		    },
		    {
			dst: 'MVR05',
			value: 2
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIS',
			value: 1
		    },
		    {
			dst: 'RMDL',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 1
		    },
		    {
			dst: 'RMFR',
			value: 1
		    },
		    {
			dst: 'SAADR',
			value: 1
		    },
		    {
			dst: 'SAAVL',
			value: 3
		    },
		    {
			dst: 'SAAVR',
			value: 2
		    },
		    {
			dst: 'SMDDR',
			value: 5
		    },
		    {
			dst: 'SMDVL',
			value: 1
		    }]},

	    RIMR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 1
		    },
		    {
			dst: 'AIBL',
			value: 4
		    },
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AIYR',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 5
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 5
		    },
		    {
			dst: 'AVEL',
			value: 3
		    },
		    {
			dst: 'AVER',
			value: 2
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'MDL05',
			value: 1
		    },
		    {
			dst: 'MDL07',
			value: 1
		    },
		    {
			dst: 'MVL05',
			value: 1
		    },
		    {
			dst: 'MVL07',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RIS',
			value: 2
		    },
		    {
			dst: 'RMDL',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 1
		    },
		    {
			dst: 'RMFL',
			value: 1
		    },
		    {
			dst: 'RMFR',
			value: 1
		    },
		    {
			dst: 'SAAVL',
			value: 3
		    },
		    {
			dst: 'SAAVR',
			value: 3
		    },
		    {
			dst: 'SMDDL',
			value: 2
		    },
		    {
			dst: 'SMDDR',
			value: 4
		    }]},

	    RIPL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'OLQDL',
			value: 1
		    },
		    {
			dst: 'OLQDR',
			value: 1
		    },
		    {
			dst: 'RMED',
			value: 1
		    }]},

	    RIPR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'OLQDL',
			value: 1
		    },
		    {
			dst: 'OLQDR',
			value: 1
		    },
		    {
			dst: 'RMED',
			value: 1
		    }]},

	    RIR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AFDR',
			value: 1
		    },
		    {
			dst: 'AIZL',
			value: 3
		    },
		    {
			dst: 'AIZR',
			value: 5
		    },
		    {
			dst: 'AUAL',
			value: 1
		    },
		    {
			dst: 'AWBR',
			value: 1
		    },
		    {
			dst: 'BAGL',
			value: 1
		    },
		    {
			dst: 'BAGR',
			value: 2
		    },
		    {
			dst: 'DVA',
			value: 2
		    },
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'PVPL',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 5
		    },
		    {
			dst: 'RIAR',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'URXL',
			value: 5
		    },
		    {
			dst: 'URXR',
			value: 1
		    }]},

	    RIS: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 7
		    },
		    {
			dst: 'AVER',
			value: 7
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'AVKR',
			value: 4
		    },
		    {
			dst: 'AVL',
			value: 2
		    },
		    {
			dst: 'CEPDR',
			value: 1
		    },
		    {
			dst: 'CEPVL',
			value: 2
		    },
		    {
			dst: 'CEPVR',
			value: 1
		    },
		    {
			dst: 'DB1',
			value: 1
		    },
		    {
			dst: 'OLLR',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 3
		    },
		    {
			dst: 'RIBR',
			value: 5
		    },
		    {
			dst: 'RIML',
			value: 2
		    },
		    {
			dst: 'RIMR',
			value: 5
		    },
		    {
			dst: 'RMDDL',
			value: 1
		    },
		    {
			dst: 'RMDL',
			value: 2
		    },
		    {
			dst: 'RMDR',
			value: 4
		    },
		    {
			dst: 'SMDDL',
			value: 1
		    },
		    {
			dst: 'SMDDR',
			value: 3
		    },
		    {
			dst: 'SMDVL',
			value: 1
		    },
		    {
			dst: 'SMDVR',
			value: 1
		    },
		    {
			dst: 'URYVR',
			value: 1
		    }]},

	    RIVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'MVR05',
			value: -2
		    },
		    {
			dst: 'MVR06',
			value: -2
		    },
		    {
			dst: 'MVR08',
			value: -3
		    },
		    {
			dst: 'RIAL',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 1
		    },
		    {
			dst: 'RIVR',
			value: 2
		    },
		    {
			dst: 'RMDL',
			value: 2
		    },
		    {
			dst: 'SAADR',
			value: 3
		    },
		    {
			dst: 'SDQR',
			value: 2
		    },
		    {
			dst: 'SIAVR',
			value: 2
		    },
		    {
			dst: 'SMDDR',
			value: 1
		    },
		    {
			dst: 'SMDVL',
			value: 1
		    }]},

	    RIVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'MVL05',
			value: -2
		    },
		    {
			dst: 'MVL06',
			value: -2
		    },
		    {
			dst: 'MVL08',
			value: -2
		    },
		    {
			dst: 'MVR04',
			value: -2
		    },
		    {
			dst: 'MVR06',
			value: -2
		    },
		    {
			dst: 'RIAL',
			value: 2
		    },
		    {
			dst: 'RIAR',
			value: 1
		    },
		    {
			dst: 'RIVL',
			value: 2
		    },
		    {
			dst: 'RMDDL',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 1
		    },
		    {
			dst: 'RMDVR',
			value: 1
		    },
		    {
			dst: 'RMEV',
			value: 1
		    },
		    {
			dst: 'SAADL',
			value: 2
		    },
		    {
			dst: 'SDQR',
			value: 2
		    },
		    {
			dst: 'SIAVL',
			value: 2
		    },
		    {
			dst: 'SMDDL',
			value: 2
		    },
		    {
			dst: 'SMDVR',
			value: 4
		    }]},

	    RMDDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDR01',
			value: 1
		    },
		    {
			dst: 'MDR02',
			value: 1
		    },
		    {
			dst: 'MDR03',
			value: 1
		    },
		    {
			dst: 'MDR04',
			value: 1
		    },
		    {
			dst: 'MDR08',
			value: 2
		    },
		    {
			dst: 'MVR01',
			value: 1
		    },
		    {
			dst: 'OLQVL',
			value: 1
		    },
		    {
			dst: 'RMDL',
			value: 1
		    },
		    {
			dst: 'RMDVL',
			value: 1
		    },
		    {
			dst: 'RMDVR',
			value: 7
		    },
		    {
			dst: 'SMDDL',
			value: 1
		    }]},

	    RMDDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDL01',
			value: 1
		    },
		    {
			dst: 'MDL02',
			value: 1
		    },
		    {
			dst: 'MDL03',
			value: 2
		    },
		    {
			dst: 'MDL04',
			value: 1
		    },
		    {
			dst: 'MDR04',
			value: 1
		    },
		    {
			dst: 'MVR01',
			value: 1
		    },
		    {
			dst: 'MVR02',
			value: 1
		    },
		    {
			dst: 'OLQVR',
			value: 1
		    },
		    {
			dst: 'RMDVL',
			value: 12
		    },
		    {
			dst: 'RMDVR',
			value: 1
		    },
		    {
			dst: 'SAADR',
			value: 1
		    },
		    {
			dst: 'SMDDR',
			value: 1
		    },
		    {
			dst: 'URYDL',
			value: 1
		    }]},

	    RMDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDL03',
			value: 1
		    },
		    {
			dst: 'MDL05',
			value: 2
		    },
		    {
			dst: 'MDR01',
			value: 1
		    },
		    {
			dst: 'MDR03',
			value: 1
		    },
		    {
			dst: 'MVL01',
			value: 1
		    },
		    {
			dst: 'MVR01',
			value: 1
		    },
		    {
			dst: 'MVR03',
			value: 1
		    },
		    {
			dst: 'MVR05',
			value: 2
		    },
		    {
			dst: 'MVR07',
			value: 1
		    },
		    {
			dst: 'OLLR',
			value: 2
		    },
		    {
			dst: 'RIAL',
			value: 4
		    },
		    {
			dst: 'RIAR',
			value: 3
		    },
		    {
			dst: 'RMDDL',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 3
		    },
		    {
			dst: 'RMDVL',
			value: 1
		    },
		    {
			dst: 'RMER',
			value: 1
		    },
		    {
			dst: 'RMFL',
			value: 1
		    }]},

	    RMDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'MDL03',
			value: 1
		    },
		    {
			dst: 'MDL05',
			value: 1
		    },
		    {
			dst: 'MDR05',
			value: 1
		    },
		    {
			dst: 'MVL03',
			value: 1
		    },
		    {
			dst: 'MVL05',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 3
		    },
		    {
			dst: 'RIAR',
			value: 7
		    },
		    {
			dst: 'RIMR',
			value: 2
		    },
		    {
			dst: 'RIS',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 1
		    },
		    {
			dst: 'RMDL',
			value: 1
		    },
		    {
			dst: 'RMDVR',
			value: 1
		    }]},

	    RMDVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'MDR01',
			value: 1
		    },
		    {
			dst: 'MVL04',
			value: 1
		    },
		    {
			dst: 'MVR01',
			value: 1
		    },
		    {
			dst: 'MVR02',
			value: 1
		    },
		    {
			dst: 'MVR03',
			value: 1
		    },
		    {
			dst: 'MVR04',
			value: 1
		    },
		    {
			dst: 'MVR05',
			value: 1
		    },
		    {
			dst: 'MVR06',
			value: 1
		    },
		    {
			dst: 'MVR08',
			value: 1
		    },
		    {
			dst: 'OLQDL',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 6
		    },
		    {
			dst: 'RMDL',
			value: 1
		    },
		    {
			dst: 'RMDVR',
			value: 1
		    },
		    {
			dst: 'SAAVL',
			value: 1
		    },
		    {
			dst: 'SMDVL',
			value: 1
		    }]},

	    RMDVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'MDL01',
			value: 1
		    },
		    {
			dst: 'MVL01',
			value: 1
		    },
		    {
			dst: 'MVL02',
			value: 1
		    },
		    {
			dst: 'MVL03',
			value: 1
		    },
		    {
			dst: 'MVL04',
			value: 1
		    },
		    {
			dst: 'MVL05',
			value: 1
		    },
		    {
			dst: 'MVL06',
			value: 1
		    },
		    {
			dst: 'MVL08',
			value: 1
		    },
		    {
			dst: 'MVR04',
			value: 1
		    },
		    {
			dst: 'MVR06',
			value: 1
		    },
		    {
			dst: 'MVR08',
			value: 1
		    },
		    {
			dst: 'OLQDR',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 4
		    },
		    {
			dst: 'RMDDR',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 1
		    },
		    {
			dst: 'RMDVL',
			value: 1
		    },
		    {
			dst: 'SAAVR',
			value: 1
		    },
		    {
			dst: 'SIBDR',
			value: 1
		    },
		    {
			dst: 'SIBVR',
			value: 1
		    },
		    {
			dst: 'SMDVR',
			value: 1
		    }]},

	    RMED: {
		value: [0, 0],
		edges: [
		    {
			dst: 'IL1VL',
			value: 1
		    },
		    {
			dst: 'MVL02',
			value: -4
		    },
		    {
			dst: 'MVL04',
			value: -4
		    },
		    {
			dst: 'MVL06',
			value: -4
		    },
		    {
			dst: 'MVR02',
			value: -4
		    },
		    {
			dst: 'MVR04',
			value: -4
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RIPL',
			value: 1
		    },
		    {
			dst: 'RIPR',
			value: 1
		    },
		    {
			dst: 'RMEV',
			value: 2
		    }]},

	    RMEL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDR01',
			value: -5
		    },
		    {
			dst: 'MDR03',
			value: -5
		    },
		    {
			dst: 'MVR01',
			value: -5
		    },
		    {
			dst: 'MVR03',
			value: -5
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RMEV',
			value: 1
		    }]},

	    RMER: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDL01',
			value: -7
		    },
		    {
			dst: 'MDL03',
			value: -7
		    },
		    {
			dst: 'MVL01',
			value: -7
		    },
		    {
			dst: 'RMEV',
			value: 1
		    }]},

	    RMEV: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 1
		    },
		    {
			dst: 'IL1DL',
			value: 1
		    },
		    {
			dst: 'IL1DR',
			value: 1
		    },
		    {
			dst: 'MDL02',
			value: -3
		    },
		    {
			dst: 'MDL04',
			value: -3
		    },
		    {
			dst: 'MDL06',
			value: -3
		    },
		    {
			dst: 'MDR02',
			value: -3
		    },
		    {
			dst: 'MDR04',
			value: -3
		    },
		    {
			dst: 'RMED',
			value: 2
		    },
		    {
			dst: 'RMEL',
			value: 1
		    },
		    {
			dst: 'RMER',
			value: 1
		    },
		    {
			dst: 'SMDDR',
			value: 1
		    }]},

	    RMFL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVKL',
			value: 4
		    },
		    {
			dst: 'AVKR',
			value: 4
		    },
		    {
			dst: 'MDR03',
			value: 1
		    },
		    {
			dst: 'MVR01',
			value: 1
		    },
		    {
			dst: 'MVR03',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 3
		    },
		    {
			dst: 'RMGR',
			value: 1
		    },
		    {
			dst: 'URBR',
			value: 1
		    }]},

	    RMFR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVKL',
			value: 3
		    },
		    {
			dst: 'AVKR',
			value: 3
		    },
		    {
			dst: 'RMDL',
			value: 2
		    }]},

	    RMGL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAL',
			value: 1
		    },
		    {
			dst: 'ADLL',
			value: 1
		    },
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'ALML',
			value: 1
		    },
		    {
			dst: 'ALNL',
			value: 1
		    },
		    {
			dst: 'ASHL',
			value: 2
		    },
		    {
			dst: 'ASKL',
			value: 2
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 2
		    },
		    {
			dst: 'AWBL',
			value: 1
		    },
		    {
			dst: 'CEPDL',
			value: 1
		    },
		    {
			dst: 'IL2L',
			value: 1
		    },
		    {
			dst: 'MDL05',
			value: 2
		    },
		    {
			dst: 'MVL05',
			value: 2
		    },
		    {
			dst: 'RID',
			value: 1
		    },
		    {
			dst: 'RMDL',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 3
		    },
		    {
			dst: 'RMDVL',
			value: 3
		    },
		    {
			dst: 'RMHL',
			value: 3
		    },
		    {
			dst: 'RMHR',
			value: 1
		    },
		    {
			dst: 'SIAVL',
			value: 1
		    },
		    {
			dst: 'SIBVL',
			value: 3
		    },
		    {
			dst: 'SIBVR',
			value: 1
		    },
		    {
			dst: 'SMBVL',
			value: 1
		    },
		    {
			dst: 'URXL',
			value: 2
		    }]},

	    RMGR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 1
		    },
		    {
			dst: 'AIMR',
			value: 1
		    },
		    {
			dst: 'ALNR',
			value: 1
		    },
		    {
			dst: 'ASHR',
			value: 2
		    },
		    {
			dst: 'ASKR',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 3
		    },
		    {
			dst: 'AVJL',
			value: 1
		    },
		    {
			dst: 'AWBR',
			value: 1
		    },
		    {
			dst: 'IL2R',
			value: 1
		    },
		    {
			dst: 'MDR05',
			value: 1
		    },
		    {
			dst: 'MVR05',
			value: 1
		    },
		    {
			dst: 'MVR07',
			value: 1
		    },
		    {
			dst: 'RIR',
			value: 1
		    },
		    {
			dst: 'RMDL',
			value: 4
		    },
		    {
			dst: 'RMDR',
			value: 2
		    },
		    {
			dst: 'RMDVR',
			value: 5
		    },
		    {
			dst: 'RMHR',
			value: 1
		    },
		    {
			dst: 'URXR',
			value: 2
		    }]},

	    RMHL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDR01',
			value: 2
		    },
		    {
			dst: 'MDR03',
			value: 3
		    },
		    {
			dst: 'MVR01',
			value: 2
		    },
		    {
			dst: 'RMDR',
			value: 1
		    },
		    {
			dst: 'RMGL',
			value: 3
		    },
		    {
			dst: 'SIBVR',
			value: 1
		    }]},

	    RMHR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDL01',
			value: 2
		    },
		    {
			dst: 'MDL03',
			value: 2
		    },
		    {
			dst: 'MDL05',
			value: 2
		    },
		    {
			dst: 'MVL01',
			value: 2
		    },
		    {
			dst: 'RMER',
			value: 1
		    },
		    {
			dst: 'RMGL',
			value: 1
		    },
		    {
			dst: 'RMGR',
			value: 1
		    }]},

	    SAADL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 6
		    },
		    {
			dst: 'RIML',
			value: 3
		    },
		    {
			dst: 'RIMR',
			value: 6
		    },
		    {
			dst: 'RMGR',
			value: 1
		    },
		    {
			dst: 'SMBDL',
			value: 1
		    }]},

	    SAADR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 3
		    },
		    {
			dst: 'OLLL',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 4
		    },
		    {
			dst: 'RIMR',
			value: 5
		    },
		    {
			dst: 'RMDDR',
			value: 1
		    },
		    {
			dst: 'RMFL',
			value: 1
		    },
		    {
			dst: 'RMGL',
			value: 1
		    }]},

	    SAAVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBL',
			value: 1
		    },
		    {
			dst: 'ALNL',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 16
		    },
		    {
			dst: 'OLLR',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 2
		    },
		    {
			dst: 'RIMR',
			value: 12
		    },
		    {
			dst: 'RMDVL',
			value: 2
		    },
		    {
			dst: 'RMFR',
			value: 2
		    },
		    {
			dst: 'SMBVR',
			value: 3
		    },
		    {
			dst: 'SMDDR',
			value: 8
		    }]},

	    SAAVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 13
		    },
		    {
			dst: 'RIML',
			value: 5
		    },
		    {
			dst: 'RIMR',
			value: 2
		    },
		    {
			dst: 'RMDVR',
			value: 1
		    },
		    {
			dst: 'SMBVL',
			value: 2
		    },
		    {
			dst: 'SMDDL',
			value: 6
		    }]},

	    SABD: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 4
		    },
		    {
			dst: 'VA2',
			value: 4
		    },
		    {
			dst: 'VA3',
			value: 2
		    },
		    {
			dst: 'VA4',
			value: 1
		    }]},

	    SABVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 3
		    },
		    {
			dst: 'DA1',
			value: 2
		    },
		    {
			dst: 'DA2',
			value: 1
		    }]},

	    SABVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'DA1',
			value: 3
		    }]},

	    SDQL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ALML',
			value: 2
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 3
		    },
		    {
			dst: 'AVEL',
			value: 1
		    },
		    {
			dst: 'FLPL',
			value: 1
		    },
		    {
			dst: 'RICR',
			value: 1
		    },
		    {
			dst: 'RIS',
			value: 3
		    },
		    {
			dst: 'RMFL',
			value: 1
		    },
		    {
			dst: 'SDQR',
			value: 1
		    }]},

	    SDQR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADLL',
			value: 1
		    },
		    {
			dst: 'AIBL',
			value: 2
		    },
		    {
			dst: 'AVAL',
			value: 3
		    },
		    {
			dst: 'AVBL',
			value: 7
		    },
		    {
			dst: 'AVBR',
			value: 4
		    },
		    {
			dst: 'DVA',
			value: 3
		    },
		    {
			dst: 'RICR',
			value: 1
		    },
		    {
			dst: 'RIVL',
			value: 2
		    },
		    {
			dst: 'RIVR',
			value: 2
		    },
		    {
			dst: 'RMHL',
			value: 2
		    },
		    {
			dst: 'RMHR',
			value: 1
		    },
		    {
			dst: 'SDQL',
			value: 1
		    },
		    {
			dst: 'SIBVL',
			value: 1
		    }]},

	    SIADL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'RIBL',
			value: 1
		    }]},

	    SIADR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'RIBR',
			value: 1
		    }]},

	    SIAVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'RIBL',
			value: 1
		    }]},

	    SIAVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'RIBR',
			value: 1
		    }]},

	    SIBDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'SIBVL',
			value: 1
		    }]},

	    SIBDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIML',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'SIBVR',
			value: 1
		    }]},

	    SIBVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'SDQR',
			value: 1
		    },
		    {
			dst: 'SIBDL',
			value: 1
		    }]},

	    SIBVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RMHL',
			value: 1
		    },
		    {
			dst: 'SIBDR',
			value: 1
		    }]},

	    SMBDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'AVKR',
			value: 1
		    },
		    {
			dst: 'MDR01',
			value: 2
		    },
		    {
			dst: 'MDR02',
			value: 2
		    },
		    {
			dst: 'MDR03',
			value: 2
		    },
		    {
			dst: 'MDR04',
			value: 2
		    },
		    {
			dst: 'MDR06',
			value: 3
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RMED',
			value: 3
		    },
		    {
			dst: 'SAADL',
			value: 1
		    },
		    {
			dst: 'SAAVR',
			value: 1
		    }]},

	    SMBDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ALNL',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'AVKR',
			value: 2
		    },
		    {
			dst: 'MDL02',
			value: 1
		    },
		    {
			dst: 'MDL03',
			value: 1
		    },
		    {
			dst: 'MDL04',
			value: 1
		    },
		    {
			dst: 'MDL06',
			value: 2
		    },
		    {
			dst: 'MDR04',
			value: 1
		    },
		    {
			dst: 'MDR08',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RMED',
			value: 4
		    },
		    {
			dst: 'SAAVL',
			value: 3
		    }]},

	    SMBVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MVL01',
			value: 1
		    },
		    {
			dst: 'MVL02',
			value: 1
		    },
		    {
			dst: 'MVL03',
			value: 1
		    },
		    {
			dst: 'MVL04',
			value: 1
		    },
		    {
			dst: 'MVL05',
			value: 1
		    },
		    {
			dst: 'MVL06',
			value: 1
		    },
		    {
			dst: 'MVL08',
			value: 1
		    },
		    {
			dst: 'PLNL',
			value: 1
		    },
		    {
			dst: 'RMEV',
			value: 5
		    },
		    {
			dst: 'SAADL',
			value: 3
		    },
		    {
			dst: 'SAAVR',
			value: 2
		    }]},

	    SMBVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'AVKR',
			value: 1
		    },
		    {
			dst: 'MVR01',
			value: 1
		    },
		    {
			dst: 'MVR02',
			value: 1
		    },
		    {
			dst: 'MVR03',
			value: 1
		    },
		    {
			dst: 'MVR04',
			value: 1
		    },
		    {
			dst: 'MVR06',
			value: 1
		    },
		    {
			dst: 'MVR07',
			value: 1
		    },
		    {
			dst: 'RMEV',
			value: 3
		    },
		    {
			dst: 'SAADR',
			value: 4
		    },
		    {
			dst: 'SAAVL',
			value: 3
		    }]},

	    SMDDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDL04',
			value: 1
		    },
		    {
			dst: 'MDL06',
			value: 1
		    },
		    {
			dst: 'MDL08',
			value: 1
		    },
		    {
			dst: 'MDR02',
			value: 1
		    },
		    {
			dst: 'MDR03',
			value: 1
		    },
		    {
			dst: 'MDR04',
			value: 1
		    },
		    {
			dst: 'MDR05',
			value: 1
		    },
		    {
			dst: 'MDR06',
			value: 1
		    },
		    {
			dst: 'MDR07',
			value: 1
		    },
		    {
			dst: 'MVL02',
			value: 1
		    },
		    {
			dst: 'MVL04',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RIS',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 1
		    },
		    {
			dst: 'SMDVR',
			value: 2
		    }]},

	    SMDDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MDL04',
			value: 1
		    },
		    {
			dst: 'MDL05',
			value: 1
		    },
		    {
			dst: 'MDL06',
			value: 1
		    },
		    {
			dst: 'MDL08',
			value: 1
		    },
		    {
			dst: 'MDR04',
			value: 1
		    },
		    {
			dst: 'MDR06',
			value: 1
		    },
		    {
			dst: 'MVR02',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 2
		    },
		    {
			dst: 'RIAR',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RIS',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 1
		    },
		    {
			dst: 'VD1',
			value: 1
		    }]},

	    SMDVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MVL03',
			value: 1
		    },
		    {
			dst: 'MVL06',
			value: 1
		    },
		    {
			dst: 'MVR02',
			value: 1
		    },
		    {
			dst: 'MVR03',
			value: 1
		    },
		    {
			dst: 'MVR04',
			value: 1
		    },
		    {
			dst: 'MVR06',
			value: 1
		    },
		    {
			dst: 'PVR',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 3
		    },
		    {
			dst: 'RIAR',
			value: 8
		    },
		    {
			dst: 'RIBR',
			value: 2
		    },
		    {
			dst: 'RIS',
			value: 1
		    },
		    {
			dst: 'RIVL',
			value: 1
		    },
		    {
			dst: 'RIVL',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 1
		    },
		    {
			dst: 'RMDVL',
			value: 1
		    },
		    {
			dst: 'SMDDR',
			value: 4
		    },
		    {
			dst: 'SMDVR',
			value: 1
		    }]},

	    SMDVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MVL02',
			value: 1
		    },
		    {
			dst: 'MVL03',
			value: 1
		    },
		    {
			dst: 'MVL04',
			value: 1
		    },
		    {
			dst: 'MVR07',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 7
		    },
		    {
			dst: 'RIAR',
			value: 5
		    },
		    {
			dst: 'RIBL',
			value: 2
		    },
		    {
			dst: 'RIVR',
			value: 1
		    },
		    {
			dst: 'RIVR',
			value: 2
		    },
		    {
			dst: 'RMDDL',
			value: 1
		    },
		    {
			dst: 'RMDVR',
			value: 1
		    },
		    {
			dst: 'SMDDL',
			value: 2
		    },
		    {
			dst: 'SMDVL',
			value: 1
		    },
		    {
			dst: 'VB1',
			value: 1
		    }]},

	    URADL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'IL1DL',
			value: 2
		    },
		    {
			dst: 'MDL02',
			value: 2
		    },
		    {
			dst: 'MDL03',
			value: 2
		    },
		    {
			dst: 'MDL04',
			value: 2
		    },
		    {
			dst: 'RIPL',
			value: 3
		    },
		    {
			dst: 'RMEL',
			value: 1
		    }]},

	    URADR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'IL1DR',
			value: 1
		    },
		    {
			dst: 'MDR01',
			value: 3
		    },
		    {
			dst: 'MDR02',
			value: 2
		    },
		    {
			dst: 'MDR03',
			value: 3
		    },
		    {
			dst: 'RIPR',
			value: 3
		    },
		    {
			dst: 'RMDVR',
			value: 1
		    },
		    {
			dst: 'RMED',
			value: 1
		    },
		    {
			dst: 'RMER',
			value: 1
		    },
		    {
			dst: 'URYDR',
			value: 1
		    }]},

	    URAVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MVL01',
			value: 2
		    },
		    {
			dst: 'MVL02',
			value: 2
		    },
		    {
			dst: 'MVL03',
			value: 3
		    },
		    {
			dst: 'MVL04',
			value: 2
		    },
		    {
			dst: 'RIPL',
			value: 3
		    },
		    {
			dst: 'RMEL',
			value: 1
		    },
		    {
			dst: 'RMER',
			value: 1
		    },
		    {
			dst: 'RMEV',
			value: 2
		    }]},

	    URAVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'IL1R',
			value: 1
		    },
		    {
			dst: 'MVR01',
			value: 2
		    },
		    {
			dst: 'MVR02',
			value: 2
		    },
		    {
			dst: 'MVR03',
			value: 2
		    },
		    {
			dst: 'MVR04',
			value: 2
		    },
		    {
			dst: 'RIPR',
			value: 3
		    },
		    {
			dst: 'RMDVL',
			value: 1
		    },
		    {
			dst: 'RMER',
			value: 2
		    },
		    {
			dst: 'RMEV',
			value: 2
		    }]},

	    URBL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'CEPDL',
			value: 1
		    },
		    {
			dst: 'IL1L',
			value: 1
		    },
		    {
			dst: 'OLQDL',
			value: 1
		    },
		    {
			dst: 'OLQVL',
			value: 1
		    },
		    {
			dst: 'RICR',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 1
		    },
		    {
			dst: 'SIAVL',
			value: 1
		    },
		    {
			dst: 'SMBDR',
			value: 1
		    },
		    {
			dst: 'URXL',
			value: 2
		    }]},

	    URBR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ADAR',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'CEPDR',
			value: 1
		    },
		    {
			dst: 'IL1R',
			value: 3
		    },
		    {
			dst: 'IL2R',
			value: 1
		    },
		    {
			dst: 'OLQDR',
			value: 1
		    },
		    {
			dst: 'OLQVR',
			value: 1
		    },
		    {
			dst: 'RICR',
			value: 1
		    },
		    {
			dst: 'RMDL',
			value: 1
		    },
		    {
			dst: 'RMDR',
			value: 1
		    },
		    {
			dst: 'RMFL',
			value: 1
		    },
		    {
			dst: 'SIAVR',
			value: 2
		    },
		    {
			dst: 'SMBDL',
			value: 1
		    },
		    {
			dst: 'URXR',
			value: 4
		    }]},

	    URXL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'ASHL',
			value: 1
		    },
		    {
			dst: 'AUAL',
			value: 5
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 4
		    },
		    {
			dst: 'AVJR',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 8
		    },
		    {
			dst: 'RICL',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 3
		    },
		    {
			dst: 'RMGL',
			value: 2
		    },
		    {
			dst: 'RMGL',
			value: 1
		    }]},

	    URXR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AUAR',
			value: 4
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'AVER',
			value: 2
		    },
		    {
			dst: 'IL2R',
			value: 1
		    },
		    {
			dst: 'OLQVR',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 3
		    },
		    {
			dst: 'RIGR',
			value: 2
		    },
		    {
			dst: 'RIPR',
			value: 3
		    },
		    {
			dst: 'RMDR',
			value: 1
		    },
		    {
			dst: 'RMGR',
			value: 2
		    },
		    {
			dst: 'SIAVR',
			value: 1
		    }]},

	    URYDL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 2
		    },
		    {
			dst: 'RIBL',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 4
		    },
		    {
			dst: 'RMDVL',
			value: 6
		    },
		    {
			dst: 'SMDDL',
			value: 1
		    },
		    {
			dst: 'SMDDR',
			value: 1
		    }]},

	    URYDR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVEL',
			value: 2
		    },
		    {
			dst: 'AVER',
			value: 2
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 3
		    },
		    {
			dst: 'RMDVR',
			value: 5
		    },
		    {
			dst: 'SMDDL',
			value: 4
		    }]},

	    URYVL: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVER',
			value: 5
		    },
		    {
			dst: 'IL1VL',
			value: 1
		    },
		    {
			dst: 'RIAL',
			value: 1
		    },
		    {
			dst: 'RIBL',
			value: 2
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'RIH',
			value: 1
		    },
		    {
			dst: 'RIS',
			value: 1
		    },
		    {
			dst: 'RMDDL',
			value: 4
		    },
		    {
			dst: 'RMDVR',
			value: 2
		    },
		    {
			dst: 'SIBVR',
			value: 1
		    },
		    {
			dst: 'SMDVR',
			value: 4
		    }]},

	    URYVR: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVEL',
			value: 6
		    },
		    {
			dst: 'IL1VR',
			value: 1
		    },
		    {
			dst: 'RIAR',
			value: 1
		    },
		    {
			dst: 'RIBR',
			value: 1
		    },
		    {
			dst: 'RIGR',
			value: 1
		    },
		    {
			dst: 'RMDDR',
			value: 6
		    },
		    {
			dst: 'RMDVL',
			value: 4
		    },
		    {
			dst: 'SIBDR',
			value: 1
		    },
		    {
			dst: 'SIBVL',
			value: 1
		    },
		    {
			dst: 'SMDVL',
			value: 3
		    }]},

	    VA1: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 3
		    },
		    {
			dst: 'DA2',
			value: 2
		    },
		    {
			dst: 'DD1',
			value: 9
		    },
		    {
			dst: 'MVL07',
			value: 3
		    },
		    {
			dst: 'MVL08',
			value: 3
		    },
		    {
			dst: 'MVR07',
			value: 3
		    },
		    {
			dst: 'MVR08',
			value: 3
		    },
		    {
			dst: 'VD1',
			value: 2
		    }]},

	    VA2: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 5
		    },
		    {
			dst: 'DD1',
			value: 13
		    },
		    {
			dst: 'MVL07',
			value: 5
		    },
		    {
			dst: 'MVL10',
			value: 5
		    },
		    {
			dst: 'MVR07',
			value: 5
		    },
		    {
			dst: 'MVR10',
			value: 5
		    },
		    {
			dst: 'SABD',
			value: 3
		    },
		    {
			dst: 'VA3',
			value: 2
		    },
		    {
			dst: 'VB1',
			value: 2
		    },
		    {
			dst: 'VD1',
			value: 2
		    },
		    {
			dst: 'VD1',
			value: 1
		    },
		    {
			dst: 'VD2',
			value: 11
		    }]},

	    VA3: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS1',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'DD1',
			value: 18
		    },
		    {
			dst: 'DD2',
			value: 11
		    },
		    {
			dst: 'MVL09',
			value: 5
		    },
		    {
			dst: 'MVL10',
			value: 5
		    },
		    {
			dst: 'MVL12',
			value: 5
		    },
		    {
			dst: 'MVR09',
			value: 5
		    },
		    {
			dst: 'MVR10',
			value: 5
		    },
		    {
			dst: 'MVR12',
			value: 5
		    },
		    {
			dst: 'SABD',
			value: 2
		    },
		    {
			dst: 'VA4',
			value: 1
		    },
		    {
			dst: 'VD2',
			value: 3
		    },
		    {
			dst: 'VD3',
			value: 3
		    }]},

	    VA4: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS2',
			value: 2
		    },
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'AVDL',
			value: 1
		    },
		    {
			dst: 'DA5',
			value: 1
		    },
		    {
			dst: 'DD2',
			value: 21
		    },
		    {
			dst: 'MVL11',
			value: 6
		    },
		    {
			dst: 'MVL12',
			value: 6
		    },
		    {
			dst: 'MVR11',
			value: 6
		    },
		    {
			dst: 'MVR12',
			value: 6
		    },
		    {
			dst: 'SABD',
			value: 1
		    },
		    {
			dst: 'VB3',
			value: 2
		    },
		    {
			dst: 'VD4',
			value: 3
		    }]},

	    VA5: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS3',
			value: 2
		    },
		    {
			dst: 'AVAL',
			value: 5
		    },
		    {
			dst: 'AVAR',
			value: 3
		    },
		    {
			dst: 'DA5',
			value: 2
		    },
		    {
			dst: 'DD2',
			value: 5
		    },
		    {
			dst: 'DD3',
			value: 13
		    },
		    {
			dst: 'MVL11',
			value: 5
		    },
		    {
			dst: 'MVL14',
			value: 5
		    },
		    {
			dst: 'MVR11',
			value: 5
		    },
		    {
			dst: 'MVR14',
			value: 5
		    },
		    {
			dst: 'VD5',
			value: 2
		    }]},

	    VA6: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 6
		    },
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'DD3',
			value: 24
		    },
		    {
			dst: 'MVL13',
			value: 5
		    },
		    {
			dst: 'MVL14',
			value: 5
		    },
		    {
			dst: 'MVR13',
			value: 5
		    },
		    {
			dst: 'MVR14',
			value: 5
		    },
		    {
			dst: 'VB5',
			value: 2
		    },
		    {
			dst: 'VD5',
			value: 1
		    },
		    {
			dst: 'VD6',
			value: 2
		    }]},

	    VA7: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS5',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 2
		    },
		    {
			dst: 'AVAR',
			value: 4
		    },
		    {
			dst: 'DD3',
			value: 3
		    },
		    {
			dst: 'DD4',
			value: 12
		    },
		    {
			dst: 'MVL13',
			value: 4
		    },
		    {
			dst: 'MVL15',
			value: 4
		    },
		    {
			dst: 'MVL16',
			value: 4
		    },
		    {
			dst: 'MVR13',
			value: 4
		    },
		    {
			dst: 'MVR15',
			value: 4
		    },
		    {
			dst: 'MVR16',
			value: 4
		    },
		    {
			dst: 'MVULVA',
			value: 4
		    },
		    {
			dst: 'VB3',
			value: 1
		    },
		    {
			dst: 'VD7',
			value: 9
		    }]},

	    VA8: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS6',
			value: 1
		    },
		    {
			dst: 'AVAL',
			value: 10
		    },
		    {
			dst: 'AVAR',
			value: 4
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DD4',
			value: 21
		    },
		    {
			dst: 'MVL15',
			value: 6
		    },
		    {
			dst: 'MVL16',
			value: 6
		    },
		    {
			dst: 'MVR15',
			value: 6
		    },
		    {
			dst: 'MVR16',
			value: 6
		    },
		    {
			dst: 'PDER',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 2
		    },
		    {
			dst: 'VA8',
			value: 1
		    },
		    {
			dst: 'VA9',
			value: 1
		    },
		    {
			dst: 'VB6',
			value: 1
		    },
		    {
			dst: 'VB8',
			value: 1
		    },
		    {
			dst: 'VB8',
			value: 3
		    },
		    {
			dst: 'VB9',
			value: 3
		    },
		    {
			dst: 'VD7',
			value: 5
		    },
		    {
			dst: 'VD8',
			value: 5
		    },
		    {
			dst: 'VD8',
			value: 1
		    }]},

	    VA9: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DD4',
			value: 3
		    },
		    {
			dst: 'DD5',
			value: 15
		    },
		    {
			dst: 'DVB',
			value: 1
		    },
		    {
			dst: 'DVC',
			value: 1
		    },
		    {
			dst: 'MVL15',
			value: 5
		    },
		    {
			dst: 'MVL18',
			value: 5
		    },
		    {
			dst: 'MVR15',
			value: 5
		    },
		    {
			dst: 'MVR18',
			value: 5
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'VB8',
			value: 6
		    },
		    {
			dst: 'VB8',
			value: 1
		    },
		    {
			dst: 'VB9',
			value: 4
		    },
		    {
			dst: 'VD7',
			value: 1
		    },
		    {
			dst: 'VD9',
			value: 10
		    }]},

	    VA10: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'MVL17',
			value: 5
		    },
		    {
			dst: 'MVL18',
			value: 5
		    },
		    {
			dst: 'MVR17',
			value: 5
		    },
		    {
			dst: 'MVR18',
			value: 5
		    }]},

	    VA11: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'AVAR',
			value: 7
		    },
		    {
			dst: 'DD6',
			value: 10
		    },
		    {
			dst: 'MVL19',
			value: 5
		    },
		    {
			dst: 'MVL20',
			value: 5
		    },
		    {
			dst: 'MVR19',
			value: 5
		    },
		    {
			dst: 'MVR20',
			value: 5
		    },
		    {
			dst: 'PVNR',
			value: 2
		    },
		    {
			dst: 'VB10',
			value: 1
		    },
		    {
			dst: 'VD12',
			value: 4
		    }]},

	    VA12: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS11',
			value: 2
		    },
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'DA8',
			value: 3
		    },
		    {
			dst: 'DA9',
			value: 5
		    },
		    {
			dst: 'DB7',
			value: 4
		    },
		    {
			dst: 'DD6',
			value: 2
		    },
		    {
			dst: 'LUAL',
			value: 2
		    },
		    {
			dst: 'MVL21',
			value: 5
		    },
		    {
			dst: 'MVL22',
			value: 5
		    },
		    {
			dst: 'MVL23',
			value: 5
		    },
		    {
			dst: 'MVR21',
			value: 5
		    },
		    {
			dst: 'MVR22',
			value: 5
		    },
		    {
			dst: 'MVR23',
			value: 5
		    },
		    {
			dst: 'MVR24',
			value: 5
		    },
		    {
			dst: 'PHCL',
			value: 1
		    },
		    {
			dst: 'PHCR',
			value: 1
		    },
		    {
			dst: 'PVCL',
			value: 2
		    },
		    {
			dst: 'PVCR',
			value: 3
		    },
		    {
			dst: 'VA11',
			value: 1
		    },
		    {
			dst: 'VB11',
			value: 1
		    },
		    {
			dst: 'VD12',
			value: 3
		    },
		    {
			dst: 'VD13',
			value: 11
		    }]},

	    VB1: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AIBR',
			value: 1
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 4
		    },
		    {
			dst: 'DB2',
			value: 2
		    },
		    {
			dst: 'DD1',
			value: 1
		    },
		    {
			dst: 'DVA',
			value: 1
		    },
		    {
			dst: 'MVL07',
			value: 1
		    },
		    {
			dst: 'MVL08',
			value: 1
		    },
		    {
			dst: 'MVR07',
			value: 1
		    },
		    {
			dst: 'MVR08',
			value: 1
		    },
		    {
			dst: 'RIML',
			value: 2
		    },
		    {
			dst: 'RMFL',
			value: 2
		    },
		    {
			dst: 'SAADL',
			value: 9
		    },
		    {
			dst: 'SAADR',
			value: 2
		    },
		    {
			dst: 'SABD',
			value: 1
		    },
		    {
			dst: 'SMDVR',
			value: 1
		    },
		    {
			dst: 'VA1',
			value: 3
		    },
		    {
			dst: 'VA3',
			value: 1
		    },
		    {
			dst: 'VB2',
			value: 4
		    },
		    {
			dst: 'VD1',
			value: 3
		    },
		    {
			dst: 'VD2',
			value: 1
		    }]},

	    VB2: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 3
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DB4',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 20
		    },
		    {
			dst: 'DD2',
			value: 1
		    },
		    {
			dst: 'MVL07',
			value: 4
		    },
		    {
			dst: 'MVL09',
			value: 4
		    },
		    {
			dst: 'MVL10',
			value: 4
		    },
		    {
			dst: 'MVL12',
			value: 4
		    },
		    {
			dst: 'MVR07',
			value: 4
		    },
		    {
			dst: 'MVR09',
			value: 4
		    },
		    {
			dst: 'MVR10',
			value: 4
		    },
		    {
			dst: 'MVR12',
			value: 4
		    },
		    {
			dst: 'RIGL',
			value: 1
		    },
		    {
			dst: 'VA2',
			value: 1
		    },
		    {
			dst: 'VB1',
			value: 4
		    },
		    {
			dst: 'VB3',
			value: 1
		    },
		    {
			dst: 'VB5',
			value: 1
		    },
		    {
			dst: 'VB7',
			value: 2
		    },
		    {
			dst: 'VC2',
			value: 1
		    },
		    {
			dst: 'VD2',
			value: 9
		    },
		    {
			dst: 'VD3',
			value: 3
		    }]},

	    VB3: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DB1',
			value: 1
		    },
		    {
			dst: 'DD2',
			value: 37
		    },
		    {
			dst: 'MVL11',
			value: 6
		    },
		    {
			dst: 'MVL12',
			value: 6
		    },
		    {
			dst: 'MVL14',
			value: 6
		    },
		    {
			dst: 'MVR11',
			value: 6
		    },
		    {
			dst: 'MVR12',
			value: 6
		    },
		    {
			dst: 'MVR14',
			value: 6
		    },
		    {
			dst: 'VA4',
			value: 1
		    },
		    {
			dst: 'VA7',
			value: 1
		    },
		    {
			dst: 'VB2',
			value: 1
		    }]},

	    VB4: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DB1',
			value: 1
		    },
		    {
			dst: 'DB4',
			value: 1
		    },
		    {
			dst: 'DD2',
			value: 6
		    },
		    {
			dst: 'DD3',
			value: 16
		    },
		    {
			dst: 'MVL11',
			value: 5
		    },
		    {
			dst: 'MVL14',
			value: 5
		    },
		    {
			dst: 'MVR11',
			value: 5
		    },
		    {
			dst: 'MVR14',
			value: 5
		    },
		    {
			dst: 'VB5',
			value: 1
		    }]},

	    VB5: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'DD3',
			value: 27
		    },
		    {
			dst: 'MVL13',
			value: 6
		    },
		    {
			dst: 'MVL14',
			value: 6
		    },
		    {
			dst: 'MVR13',
			value: 6
		    },
		    {
			dst: 'MVR14',
			value: 6
		    },
		    {
			dst: 'VB2',
			value: 1
		    },
		    {
			dst: 'VB4',
			value: 1
		    },
		    {
			dst: 'VB6',
			value: 8
		    }]},

	    VB6: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'DA4',
			value: 1
		    },
		    {
			dst: 'DD4',
			value: 30
		    },
		    {
			dst: 'MVL15',
			value: 6
		    },
		    {
			dst: 'MVL16',
			value: 6
		    },
		    {
			dst: 'MVR15',
			value: 6
		    },
		    {
			dst: 'MVR16',
			value: 6
		    },
		    {
			dst: 'MVULVA',
			value: 6
		    },
		    {
			dst: 'VA8',
			value: 1
		    },
		    {
			dst: 'VB5',
			value: 1
		    },
		    {
			dst: 'VB7',
			value: 1
		    },
		    {
			dst: 'VD6',
			value: 1
		    },
		    {
			dst: 'VD7',
			value: 8
		    }]},

	    VB7: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 2
		    },
		    {
			dst: 'DD4',
			value: 2
		    },
		    {
			dst: 'MVL15',
			value: 5
		    },
		    {
			dst: 'MVR15',
			value: 5
		    },
		    {
			dst: 'VB2',
			value: 2
		    }]},

	    VB8: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 7
		    },
		    {
			dst: 'AVBR',
			value: 3
		    },
		    {
			dst: 'DD5',
			value: 30
		    },
		    {
			dst: 'MVL17',
			value: 5
		    },
		    {
			dst: 'MVL18',
			value: 5
		    },
		    {
			dst: 'MVL20',
			value: 5
		    },
		    {
			dst: 'MVR17',
			value: 5
		    },
		    {
			dst: 'MVR18',
			value: 5
		    },
		    {
			dst: 'MVR20',
			value: 5
		    },
		    {
			dst: 'VA8',
			value: 3
		    },
		    {
			dst: 'VA9',
			value: 9
		    },
		    {
			dst: 'VA9',
			value: 1
		    },
		    {
			dst: 'VB9',
			value: 3
		    },
		    {
			dst: 'VB9',
			value: 3
		    },
		    {
			dst: 'VD10',
			value: 1
		    },
		    {
			dst: 'VD9',
			value: 10
		    }]},

	    VB9: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 5
		    },
		    {
			dst: 'AVAR',
			value: 4
		    },
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVBR',
			value: 6
		    },
		    {
			dst: 'DD5',
			value: 8
		    },
		    {
			dst: 'DVB',
			value: 1
		    },
		    {
			dst: 'MVL17',
			value: 6
		    },
		    {
			dst: 'MVL20',
			value: 6
		    },
		    {
			dst: 'MVR17',
			value: 6
		    },
		    {
			dst: 'MVR20',
			value: 6
		    },
		    {
			dst: 'PVCL',
			value: 2
		    },
		    {
			dst: 'VA8',
			value: 3
		    },
		    {
			dst: 'VA9',
			value: 4
		    },
		    {
			dst: 'VB8',
			value: 1
		    },
		    {
			dst: 'VB8',
			value: 3
		    },
		    {
			dst: 'VD10',
			value: 5
		    }]},

	    VB10: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'AVKL',
			value: 1
		    },
		    {
			dst: 'DD6',
			value: 9
		    },
		    {
			dst: 'MVL19',
			value: 5
		    },
		    {
			dst: 'MVL20',
			value: 5
		    },
		    {
			dst: 'MVR19',
			value: 5
		    },
		    {
			dst: 'MVR20',
			value: 5
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'VD11',
			value: 1
		    },
		    {
			dst: 'VD12',
			value: 2
		    }]},

	    VB11: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 2
		    },
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DD6',
			value: 7
		    },
		    {
			dst: 'MVL21',
			value: 5
		    },
		    {
			dst: 'MVL22',
			value: 5
		    },
		    {
			dst: 'MVL23',
			value: 5
		    },
		    {
			dst: 'MVR21',
			value: 5
		    },
		    {
			dst: 'MVR22',
			value: 5
		    },
		    {
			dst: 'MVR23',
			value: 5
		    },
		    {
			dst: 'MVR24',
			value: 5
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'VA12',
			value: 2
		    }]},

	    VC1: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVL',
			value: 2
		    },
		    {
			dst: 'DD1',
			value: 7
		    },
		    {
			dst: 'DD2',
			value: 6
		    },
		    {
			dst: 'DD3',
			value: 6
		    },
		    {
			dst: 'DVC',
			value: 1
		    },
		    {
			dst: 'MVULVA',
			value: 6
		    },
		    {
			dst: 'PVT',
			value: 2
		    },
		    {
			dst: 'VC2',
			value: 9
		    },
		    {
			dst: 'VC3',
			value: 3
		    },
		    {
			dst: 'VD1',
			value: 5
		    },
		    {
			dst: 'VD2',
			value: 1
		    },
		    {
			dst: 'VD3',
			value: 1
		    },
		    {
			dst: 'VD4',
			value: 2
		    },
		    {
			dst: 'VD5',
			value: 5
		    },
		    {
			dst: 'VD6',
			value: 1
		    }]},

	    VC2: {
		value: [0, 0],
		edges: [
		    {
			dst: 'DB4',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 6
		    },
		    {
			dst: 'DD2',
			value: 4
		    },
		    {
			dst: 'DD3',
			value: 9
		    },
		    {
			dst: 'DVC',
			value: 1
		    },
		    {
			dst: 'MVULVA',
			value: 10
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'PVQR',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 2
		    },
		    {
			dst: 'VC1',
			value: 10
		    },
		    {
			dst: 'VC3',
			value: 6
		    },
		    {
			dst: 'VD1',
			value: 2
		    },
		    {
			dst: 'VD2',
			value: 2
		    },
		    {
			dst: 'VD4',
			value: 5
		    },
		    {
			dst: 'VD5',
			value: 5
		    },
		    {
			dst: 'VD6',
			value: 1
		    }]},

	    VC3: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVL',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 2
		    },
		    {
			dst: 'DD2',
			value: 4
		    },
		    {
			dst: 'DD3',
			value: 5
		    },
		    {
			dst: 'DD4',
			value: 13
		    },
		    {
			dst: 'DVC',
			value: 1
		    },
		    {
			dst: 'HSNR',
			value: 1
		    },
		    {
			dst: 'MVULVA',
			value: 11
		    },
		    {
			dst: 'PVNR',
			value: 1
		    },
		    {
			dst: 'PVPR',
			value: 1
		    },
		    {
			dst: 'PVQR',
			value: 4
		    },
		    {
			dst: 'VC1',
			value: 4
		    },
		    {
			dst: 'VC2',
			value: 3
		    },
		    {
			dst: 'VC4',
			value: 1
		    },
		    {
			dst: 'VC5',
			value: 2
		    },
		    {
			dst: 'VD1',
			value: 1
		    },
		    {
			dst: 'VD2',
			value: 1
		    },
		    {
			dst: 'VD3',
			value: 1
		    },
		    {
			dst: 'VD4',
			value: 2
		    },
		    {
			dst: 'VD5',
			value: 4
		    },
		    {
			dst: 'VD6',
			value: 4
		    },
		    {
			dst: 'VD7',
			value: 5
		    }]},

	    VC4: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBL',
			value: 1
		    },
		    {
			dst: 'AVFR',
			value: 1
		    },
		    {
			dst: 'AVHR',
			value: 1
		    },
		    {
			dst: 'MVULVA',
			value: 7
		    },
		    {
			dst: 'VC1',
			value: 1
		    },
		    {
			dst: 'VC3',
			value: 5
		    },
		    {
			dst: 'VC5',
			value: 2
		    }]},

	    VC5: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVFL',
			value: 1
		    },
		    {
			dst: 'AVFR',
			value: 1
		    },
		    {
			dst: 'DVC',
			value: 2
		    },
		    {
			dst: 'HSNL',
			value: 1
		    },
		    {
			dst: 'MVULVA',
			value: 2
		    },
		    {
			dst: 'OLLR',
			value: 1
		    },
		    {
			dst: 'PVT',
			value: 1
		    },
		    {
			dst: 'URBL',
			value: 3
		    },
		    {
			dst: 'VC3',
			value: 3
		    },
		    {
			dst: 'VC4',
			value: 2
		    }]},

	    VC6: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MVULVA',
			value: 1
		    }]},

	    VD1: {
		value: [0, 0],
		edges: [
		    {
			dst: 'DD1',
			value: 5
		    },
		    {
			dst: 'DVC',
			value: 5
		    },
		    {
			dst: 'MVL05',
			value: -5
		    },
		    {
			dst: 'MVL08',
			value: -5
		    },
		    {
			dst: 'MVR05',
			value: -5
		    },
		    {
			dst: 'MVR08',
			value: -5
		    },
		    {
			dst: 'RIFL',
			value: 1
		    },
		    {
			dst: 'RIGL',
			value: 2
		    },
		    {
			dst: 'SMDDR',
			value: 1
		    },
		    {
			dst: 'VA1',
			value: 2
		    },
		    {
			dst: 'VA2',
			value: 1
		    },
		    {
			dst: 'VC1',
			value: 1
		    },
		    {
			dst: 'VD2',
			value: 7
		    }]},

	    VD2: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AS1',
			value: 1
		    },
		    {
			dst: 'DD1',
			value: 3
		    },
		    {
			dst: 'MVL07',
			value: -7
		    },
		    {
			dst: 'MVL10',
			value: -7
		    },
		    {
			dst: 'MVR07',
			value: -7
		    },
		    {
			dst: 'MVR10',
			value: -7
		    },
		    {
			dst: 'VA2',
			value: 9
		    },
		    {
			dst: 'VB2',
			value: 3
		    },
		    {
			dst: 'VD1',
			value: 7
		    },
		    {
			dst: 'VD3',
			value: 2
		    }]},

	    VD3: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MVL09',
			value: -7
		    },
		    {
			dst: 'MVL12',
			value: -9
		    },
		    {
			dst: 'MVR09',
			value: -7
		    },
		    {
			dst: 'MVR12',
			value: -7
		    },
		    {
			dst: 'PVPL',
			value: 1
		    },
		    {
			dst: 'VA3',
			value: 2
		    },
		    {
			dst: 'VB2',
			value: 2
		    },
		    {
			dst: 'VD2',
			value: 2
		    },
		    {
			dst: 'VD4',
			value: 1
		    }]},

	    VD4: {
		value: [0, 0],
		edges: [
		    {
			dst: 'DD2',
			value: 2
		    },
		    {
			dst: 'MVL11',
			value: -9
		    },
		    {
			dst: 'MVL12',
			value: -9
		    },
		    {
			dst: 'MVR11',
			value: -9
		    },
		    {
			dst: 'MVR12',
			value: -9
		    },
		    {
			dst: 'PVPR',
			value: 1
		    },
		    {
			dst: 'VD3',
			value: 1
		    },
		    {
			dst: 'VD5',
			value: 1
		    }]},

	    VD5: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 1
		    },
		    {
			dst: 'MVL14',
			value: -17
		    },
		    {
			dst: 'MVR14',
			value: -17
		    },
		    {
			dst: 'PVPR',
			value: 1
		    },
		    {
			dst: 'VA5',
			value: 2
		    },
		    {
			dst: 'VB4',
			value: 2
		    },
		    {
			dst: 'VD4',
			value: 1
		    },
		    {
			dst: 'VD6',
			value: 2
		    }]},

	    VD6: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAL',
			value: 1
		    },
		    {
			dst: 'MVL13',
			value: -7
		    },
		    {
			dst: 'MVL14',
			value: -7
		    },
		    {
			dst: 'MVL16',
			value: -7
		    },
		    {
			dst: 'MVR13',
			value: -7
		    },
		    {
			dst: 'MVR14',
			value: -7
		    },
		    {
			dst: 'MVR16',
			value: -7
		    },
		    {
			dst: 'VA6',
			value: 1
		    },
		    {
			dst: 'VB5',
			value: 2
		    },
		    {
			dst: 'VD5',
			value: 2
		    },
		    {
			dst: 'VD7',
			value: 1
		    }]},

	    VD7: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MVL15',
			value: -7
		    },
		    {
			dst: 'MVL16',
			value: -7
		    },
		    {
			dst: 'MVR15',
			value: -7
		    },
		    {
			dst: 'MVR16',
			value: -7
		    },
		    {
			dst: 'MVULVA',
			value: -15
		    },
		    {
			dst: 'VA9',
			value: 1
		    },
		    {
			dst: 'VD6',
			value: 1
		    }]},

	    VD8: {
		value: [0, 0],
		edges: [
		    {
			dst: 'DD4',
			value: 2
		    },
		    {
			dst: 'MVL15',
			value: -18
		    },
		    {
			dst: 'MVR15',
			value: -18
		    },
		    {
			dst: 'VA8',
			value: 5
		    }]},

	    VD9: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MVL17',
			value: -10
		    },
		    {
			dst: 'MVL18',
			value: -10
		    },
		    {
			dst: 'MVR17',
			value: -10
		    },
		    {
			dst: 'MVR18',
			value: -10
		    },
		    {
			dst: 'PDER',
			value: 1
		    },
		    {
			dst: 'VD10',
			value: 5
		    }]},

	    VD10: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVBR',
			value: 1
		    },
		    {
			dst: 'DD5',
			value: 2
		    },
		    {
			dst: 'DVC',
			value: 4
		    },
		    {
			dst: 'MVL17',
			value: -9
		    },
		    {
			dst: 'MVL20',
			value: -9
		    },
		    {
			dst: 'MVR17',
			value: -9
		    },
		    {
			dst: 'MVR20',
			value: -9
		    },
		    {
			dst: 'VB9',
			value: 2
		    },
		    {
			dst: 'VD9',
			value: 5
		    }]},

	    VD11: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'MVL19',
			value: -9
		    },
		    {
			dst: 'MVL20',
			value: -9
		    },
		    {
			dst: 'MVR19',
			value: -9
		    },
		    {
			dst: 'MVR20',
			value: -9
		    },
		    {
			dst: 'VA11',
			value: 1
		    },
		    {
			dst: 'VB10',
			value: 1
		    }]},

	    VD12: {
		value: [0, 0],
		edges: [
		    {
			dst: 'MVL19',
			value: -5
		    },
		    {
			dst: 'MVL21',
			value: -5
		    },
		    {
			dst: 'MVR19',
			value: -5
		    },
		    {
			dst: 'MVR22',
			value: -5
		    },
		    {
			dst: 'VA11',
			value: 3
		    },
		    {
			dst: 'VA12',
			value: 2
		    },
		    {
			dst: 'VB10',
			value: 1
		    },
		    {
			dst: 'VB11',
			value: 1
		    }]},

	    VD13: {
		value: [0, 0],
		edges: [
		    {
			dst: 'AVAR',
			value: 2
		    },
		    {
			dst: 'MVL21',
			value: -9
		    },
		    {
			dst: 'MVL22',
			value: -9
		    },
		    {
			dst: 'MVL23',
			value: -9
		    },
		    {
			dst: 'MVR21',
			value: -9
		    },
		    {
			dst: 'MVR22',
			value: -9
		    },
		    {
			dst: 'MVR23',
			value: -9
		    },
		    {
			dst: 'MVR24',
			value: -9
		    },
		    {
			dst: 'PVCL',
			value: 1
		    },
		    {
			dst: 'PVCR',
			value: 1
		    },
		    {
			dst: 'PVPL',
			value: 2
		    },
		    {
			dst: 'VA12',
			value: 1
		    }]}
	}

    }

    return {
	'test': test,
	'c_elegans': c_elegans
    }[name];
}
