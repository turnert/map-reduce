require('babel/polyfill');
/* global process */

let aggregatedData = {};

/**
 * converts data read by the process into a form that can be used by the algorithm
 * @param {String} data Read from standard in
 * @return {Object} The aggregation of the word counts for all words handled by this process
 */
function performReduce (data) {
	let wordList = data.split('\n');
	wordList.forEach(str => {
		if (str.indexOf(':') > 0) {
			let [word, count] = str.split(':');
			aggregatedData[word] = aggregatedData[word] || 0;
			aggregatedData[word] += parseInt(count, 0);
		}
	});
	return aggregatedData;
}

/**
 * writes all word counts aggregated by this process to standard out
 * @param {Object} wordCounts Words mapped to the number of times that word was read in the input
 * @returns {Array} Array of promises that resolve once the corresponding write to standard out has completed  
 */

function writeAll(wordCounts) {
	let allWritesFinished = []
	Object.keys(wordCounts).forEach(word => {
		allWritesFinished.push(new Promise((resolve, reject) => {
			process.stdout.write(word + ':' + wordCounts[word] + '\n', 'utf8', () => {
				resolve(true);
			});
		}));
	});
	return allWritesFinished;
}

process.stdin.setEncoding('utf8');

process.stdin.on('data', data => {
	performReduce(data);
});

process.stdin.on('finish', () => {
	let finished = writeAll(aggregatedData);
	Promise.all(finished).then(() => {
		process.stdout.end();
		process.stdout.on('finish', () => {
			process.exit();
		});
	});
});