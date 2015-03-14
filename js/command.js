var command = {
	'getFirmware': '100300',
	'getHardware': '100301',
	'idle':        '180300',
	'resume':      '1803ff',
	'newScan':     '310301',
	'nextScan':    '310302',
	'select':      '330f0c',
}

module.exports = function(arg){
	var string = new Buffer(command[arg], 'hex');
	return string;
}
	