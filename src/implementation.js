require('babel/polyfill');

const ASCII_LOWER_CASE_A = 97,
	ALPHABET_LENGTH = 26,
	alphabet = 'abcdefghijklmnopqrstuvwxyz';

let privateVariables = Symbol();

// function createPartitionIndexMap () {
// 	let indexMap = {};
// 	alphabet.split('').forEach(letter => {
// 		indexMap[letter] = this.reducePartition(letter);
// 	});
	
// 	return indexMap;
// }

/**
 * strips all non alphanumeric characters from a string
 * @param {String} str
 * @returns {String}
 */
function stripNonAlphaNumericChars (str) {
	return str.replace(/\W/g, '');
}

/**
 * generates a function that determines whether or not a given value is included in the nth alphabetical grouping of letters
 * @param {Number} group The alphabetical grouping inclusion will be tested against
 * @returns {Function}
 */

function alphabeticallyGivenGroup (group) {
	let that = this;
	
	/**
	 * determines if a value should be included in a given alphabetical grouping of letters
	 * @param {String} val The string being evaluated
	 * @returns {Boolean} True if value is included in group, false otherwise
	 */
	
	return function alphabetically(val) {
		let onlyAlphaNumeric = stripNonAlphaNumericChars(val),
			firstLetter = onlyAlphaNumeric.charAt(0).toLowerCase();
			
		const INCREMENT = Math.ceil(that.alphabetLength / that.numMapWorkers);
			
		return firstLetter.charCodeAt(0) >= (that.asciiLowerCaseA + group * INCREMENT) && 
			firstLetter.charCodeAt(0) < (that.asciiLowerCaseA + (group + 1) * INCREMENT); 	
	}
}

/**
 * partitions an array into seperate sub arrays, one for each map child process
 * @param {Array} data An array of file names that contain input data
 * @returns {Array} The same file names found in the original array divided into subarrays alphabetically by the first letter of each name
 */

function mapPartitionFn (data) {
	let partitionedData = [],
		i,
		boundAlphabeticalFilter = alphabeticallyGivenGroup.bind(this);
	
	for (i = 0; i < this.numMapWorkers; i++) {
		partitionedData.push(data.filter(boundAlphabeticalFilter(i)));
	}
	
	return partitionedData;
}

/**
 * computes the array index of the reduce child process that should handle the given value
 * @param {String} val The string to be processed
 * @returns {Number} The index of the child process the value should be sent to 
 */
	
function reducePartitionFn (val) {
	let onlyAlphaNumeric = stripNonAlphaNumericChars(val),
		firstLetter = onlyAlphaNumeric.charAt(0).toLowerCase();
		
	const INCREMENT = Math.ceil(this.alphabetLength / this.numReduceWorkers);
	
	return Math.floor((firstLetter.charCodeAt(0) - this.asciiLowerCaseA) / INCREMENT);
}

/**
 * combines the data received
 * @param {String} data The data to be added to the string
 * @returns {String} All of the data combined
 */

function aggregateFn(data) {
	this.allData = this.allData + data;
	return this.allData;
}

export class Implementation {
	constructor(options) {
		this.asciiLowerCaseA = ASCII_LOWER_CASE_A;
		this.alphabetLength = ALPHABET_LENGTH;
		this.mapWorkerFileName = options.mapWorkerFileName;
		this.reduceWorkerFileName = options.reduceWorkerFileName;
		this.numMapWorkers = options.numMapWorkers;
		this.numReduceWorkers = options.numReduceWorkers;
		this._mapPartition = mapPartitionFn.bind(this);
		this._reducePartition = reducePartitionFn.bind(this);
		this._aggregate = aggregateFn.bind(this);
		// this._indexMap = createPartitionIndexMap.call(this);
		this.allData = '';
	}
	
	get mapPartition () {
		return this._mapPartition;
	}
	
	set mapPartition (val) {
		if (typeof val == 'function') {
			this._mapPartition = val;
		}
	}
	
	get reducePartition () {
		return this._reducePartition;
	}
	
	set reducePartition (val) {
		if (typeof val == 'function') {
			this._reducePartition = val;
		}
	}
	
	get aggregate () {
		return this._aggregate;
	}
	
	set aggregate (val) {
		if (typeof val == 'function') {
			this._aggregate = val;
		}
	}
	
	get indexMap () {
		return this._indexMap;
	}
	
	set indexMap (val) {
		this._indexMap = createPartitionIndexMap.call(this);
	}
}