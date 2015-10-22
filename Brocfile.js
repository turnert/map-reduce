var esTranspiler = require('broccoli-babel-transpiler'),
	inputTree = 'src',
	options = {browserPolyfill: true},
	mapReduce = esTranspiler(inputTree, options);

module.exports = mapReduce;