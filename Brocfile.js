var esTranspiler = require('broccoli-babel-transpiler'),
	inputTree = 'src',
	options = {},
	mapReduce = esTranspiler(inputTree, options);

module.exports = mapReduce;