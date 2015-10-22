/* global process */

function performReduce (data) {
	return [data];
}

/**
 * writes the next piece of data to the standard out of the process running this script
 * @param {Array} remainingData All data that has yet to be written
 */

function writeNext(remainingData) {
	let datum;
	
	if (remainingData.length > 0) {
		datum = remainingData.shift();
		process.stdout.write(datum, 'utf8', () => {
			writeNext(remainingData);
		});
	}
}

process.stdin.setEncoding('utf8');

process.stdin.on('data', data => {
	let reducedData = performReduce(data);
	
	writeNext(reducedData);
});

process.stdin.on('finish', () => {
		process.stdout.end();
		process.stdout.on('finish', () => {
			process.exit();				
		});
});