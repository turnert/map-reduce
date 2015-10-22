import {Implementation} from './implementation';
import fs from 'fs';
import child_process from 'child_process';
require('babel/polyfill');

let privateVariables = Symbol();

/**
 * gets the value of a private variable for an instance of a Class
 * @param {String} name
 * @returns {Any} val The value referenced by the name param in an instance of a Class
 */

function classGet (name) {
	return this[privateVariables].get(name);
}

/**
 * sets the value of a private variable for an instance of a Class
 * @param {String} name
 * @param {Any} val
 */

function classSet (name, val) {
	this[privateVariables].set(name, val);
}

/**
 * defines the actions to be taken once the readable portion of a pipe receives an end event
 * @param {Object} readable
 * @param {Object} childProcess
 * @param {Array} remainingFiles
 */

function handleReadableEnd (readable, childProcess, remainingFiles) {
	let that = this;
	
	return function () {
		let nextFileName;
		
		readable.unpipe(childProcess.stdin);
		childProcess.stdin.write('\n', 'utf8');
		if (remainingFiles.length > 0) {
			nextFileName = remainingFiles.shift()
			pipeNextFileToMap.call(that, nextFileName, childProcess, remainingFiles);
		} else {
			endChildProcess(childProcess);
		}
	}
}

/**
 * creates a pipe from an input file to a child process
 * @param {String} fileName
 * @param {Object} childProcess
 * @param {Array} remainingFiles
 */

function pipeNextFileToMap (fileName, childProcess, remainingFiles) {
	let readable,
		fs = this.fs;
	
	if (typeof fileName !== 'string' && remainingFiles.length == 0) {
		endChildProcess(childProcess);
		return;
	}
	else if (typeof fileName !== 'string' && remainingFiles.length > 0) {
		pipeNextFileToMap.call(this, remainingFiles.shift(), childProcess, remainingFiles);
		return;
	}

	readable = fs.createReadStream(fileName, {encoding: 'utf8'});
	readable.pipe(childProcess.stdin, {end: false});
	readable.on('end', handleReadableEnd.call(this, readable, childProcess, remainingFiles));
}

/**
 * performs the steps required to end a child process
 * @param {Object} childProcess
 */

function endChildProcess(childProcess) {
	childProcess.stdin.end();
}

/**
 * defines what actions a map child process will take when that child process exits
 * @param {Object} childProcess
 */

function handleMapWorkerExit(childProcess) {
	childProcess.stdout.on('finish', () => {
		let allMapWorkers = classGet.call(this, 'allMapWorkers'),
			allReduceWorkers = classGet.call(this, 'allReduceWorkers');
			
		classSet.call(this, 'mapWorkersKilled', classGet.call(this, 'mapWorkersKilled') + 1);
		if (classGet.call(this, 'mapWorkersKilled') == allMapWorkers.length) {
			allMapWorkers.forEach(workerToEnd => {
				workerToEnd.kill();
			});
			allReduceWorkers.forEach(endChildProcess);
		}
	});
}

/**
 * defines what actions a map child process will take when data is written to standard out
 * @param {Object} childProcess 
 */

function handleMapWorkerStdout(childProcess) {
	let allReduceWorkers = classGet.call(this, 'allReduceWorkers');
	
	childProcess.stdout.setEncoding('utf8');
	childProcess.stdout.on('data', data => {
		data.split('\n').forEach(pair => {
			if (pair !== '') {
				let firstLetter = pair.charAt(0),
					reduceIndex = this.implementation.reducePartition(firstLetter);

				allReduceWorkers[reduceIndex].stdin.write(pair + '\n', 'utf8');
			}
		})
	});
}

/**
 * initializes a child process that will handle the map portion of the algorithm
 * @param {Array} data containing the file names of input files sorted such that data[i] is an array of file names that will be handled by the ith map child process 
 */

function initializeMapWorker(data) {
	let that = this;
		
	return function initializeMapWorker(mapWorker, index) {
		let allFiles = data[index] ? data[index] : [],
			fileName = allFiles.shift();
		
		handleMapWorkerStdout.call(that, mapWorker);
		handleMapWorkerExit.call(that, mapWorker);

		pipeNextFileToMap.call(that, fileName, mapWorker, allFiles);
	}
}

/**
 * creates the child processes that will handle the map portion of the algorithm
 * @param {Array} dataSets An array of file names that contain the input to the algorithm
 */

function createMapWorkers (dataSets) {
	let i,
		allMapWorkers = classGet.call(this, 'allMapWorkers'),
		boundInitialization = initializeMapWorker.bind(this),
		mapWorkerFileName = classGet.call(this, 'mapWorkerFileName');
		
	const NUM_MAP_WORKERS = classGet.call(this, 'numMapWorkers');
	
	for (i = 0; i < NUM_MAP_WORKERS; i++) {
		allMapWorkers.push(this.fork(mapWorkerFileName, {silent: true}));
	}
	
	allMapWorkers.forEach(boundInitialization(dataSets));
}

/**
 * defines what actions will be taken when a child process exits
 * @param {Object} childProcess
 * @returns {Promise} resolves when the supplied child process exits
 */

function handleExit(childProcess) {
	let totalReducers = classGet.call(this, 'allReduceWorkers').length,
		output = new Promise((resolve, reject) => {
			childProcess.on('exit', () => {
				classSet.call(this, 'reduceWorkersKilled',
					classGet.call(this, 'reduceWorkersKilled') + 1);
				if (totalReducers === classGet.call(this, 'reduceWorkersKilled')) {
					resolve(this.implementation.allData);
				}
			});
	});
	
	return output;
}

/**
 * defines how a the standard out output is handled by a child process
 * @param {Object} childProcess
 */

function handleStdoutData(childProcess) {
	childProcess.stdout.setEncoding('utf8');
	childProcess.stdout.on('data', data => {
		this.implementation.aggregate.call(this, data);
	});
}

/**
 * initializes a single reduce child process
 * @param {Object} childProcess
 * @returns {Promise} resolves to true once the child process has exited
 */

function initializeReduceWorker(childProcess) {
	let exitFinished;
	
	handleStdoutData.call(this, childProcess);
	exitFinished = handleExit.call(this, childProcess);
	
	return exitFinished;	
}

/**
 * creates child processes that perform the reduce work required by the algorithm
 * @returns {Array} An array of promises that each resolve once the corresponding reduce child process exits  
 */

function createReduceWorkers () {
	let i,
		exitPromises,
		boundInitialize = initializeReduceWorker.bind(this),
		numReduceWorkers = classGet.call(this, 'numReduceWorkers'),
		allReduceWorkers = classGet.call(this, 'allReduceWorkers'),
		reduceWorkerFileName = classGet.call(this, 'reduceWorkerFileName');
	
	for (i = 0; i < numReduceWorkers; i++) {
		allReduceWorkers.push(this.fork(reduceWorkerFileName, {silent: true}));
	}
	exitPromises = allReduceWorkers.map(boundInitialize);
		
	return exitPromises;
}

export class MapReduce {
	constructor(implementation) {
		this[privateVariables] = new Map();
		this[privateVariables].set('mapWorkerFileName', implementation.mapWorkerFileName);
		this[privateVariables].set('reduceWorkerFileName', implementation.reduceWorkerFileName);
		this[privateVariables].set('numMapWorkers', implementation.numMapWorkers);
		this[privateVariables].set('allMapWorkers', []);
		this[privateVariables].set('mapWorkersKilled', 0);
		this[privateVariables].set('numReduceWorkers', implementation.numReduceWorkers);
		this[privateVariables].set('allReduceWorkers', []);
		this[privateVariables].set('reduceWorkersKilled', 0);
		this[privateVariables].set('fs', fs);
		this[privateVariables].set('fork', child_process.fork);
		this[privateVariables].set('spawn', child_process.spawn);
		this[privateVariables].set('implementation', implementation);
	}
	
	/**
	 * Runs the map reduce algorithm on the supplied array of file names
	 * @param {Array} data
	 * @returns {Promise} the result of algorithm run on the supplied data set
	 */
	
	execute (data) {
		let allPartitionedData = this.implementation.mapPartition(data),
			reducerExitPromises;
			
		this[privateVariables].set('allData', this.implementation.allData);
		reducerExitPromises = createReduceWorkers.call(this);
		createMapWorkers.call(this, allPartitionedData);
		
		return Promise.race(reducerExitPromises);
	}
	
	get fs () {
		return this[privateVariables].get('fs');
	}

	set fs (val) {
		this[privateVariables].set('fs', val);
	}
	
	get fork () {
		return this[privateVariables].get('fork');
	}
	
	set fork (val) {
		this[privateVariables].set('fork', val);
	}
	
	get spawn () {
	 return this[privateVariables].get('spawn');
 	}
 
 	set spawn (val) {
		 this[privateVariables].set('spawn', val);
	}
	 
	get implementation () {
		return this[privateVariables].get('implementation');
	}
}